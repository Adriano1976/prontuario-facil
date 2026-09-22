import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockSeed } from '../mockSeed';

/**
 * Prova de CARREGAMENTO do modo offline — a ativação por variável de ambiente, nas duas metades.
 *
 * | Requisito | Cenário / regra | Como é provado |
 * |-----------|-----------------|----------------|
 * | `RF-01` | `PT-009.1` · `BR-OFF01`, `BR-OFF02` | com a variável ligada, o cliente exportado lê do armazenamento local e a fábrica do provedor **não** é chamada |
 * | `RF-02` | `PT-009.1` | sem a variável, a fábrica do provedor **é** chamada, nada é semeado e a leitura escopada vem vazia |
 *
 * ⚠️ ESTE ARQUIVO EXISTE PARA PROVAR UMA DECISÃO QUE ACONTECE UMA VEZ POR PROCESSO. Ele tem duas
 * verificações e mais nada, de propósito: a variável é lida **no carregamento do módulo**
 * (`base44Client.ts:21`), de modo que a única forma de observar as duas metades é descartar o
 * registro de módulos e importar de novo. Isso é uma intervenção global — e é por isso que ela mora
 * sozinha aqui, e não junto das provas do adaptador (`D-01`).
 *
 * ⚠️ A FÁBRICA DO PROVEDOR É SUBSTITUÍDA, e a metade negativa afirma que ela **foi chamada**
 * (decisão `3a` do clarify). Carregar o provedor real construiria um cliente com os parâmetros da
 * aplicação; sem configuração, isso pode lançar por motivo **alheio à promessa**, e uma verificação
 * que falha pelo motivo errado é pior que uma ausente (`D-02`, `R-03`).
 *
 * ⚠️ O SUBSTITUTO OFERECE OS QUATRO GATEWAYS do contrato — entidades, sessão, integrações e registro
 * de aplicação. Um substituto incompleto faria o encaixe falhar, e a falha pareceria defeito da
 * feature em vez de defeito do arranjo.
 *
 * ⚠️ AS OUTRAS DUAS CLÁUSULAS DE `PT-009.2` SÃO **CITADAS**, e não reescritas (`D-12`): a
 * autenticação imediata é provada por `src/lib/__tests__/AuthContext.test.tsx`, que já substitui o
 * ambiente e descarta o registro; e a ausência estrutural de papel é provada pelos casos de
 * compilação da feature `008-prova-contrato-dados`.
 */

const { criarClienteDoProvedor } = vi.hoisted(() => ({
  criarClienteDoProvedor: vi.fn(),
}));

vi.mock('@base44/sdk', () => ({ createClient: criarClienteDoProvedor }));

/** Escopo do usuário de demonstração, na forma que o contrato exige. */
const ESCOPO_DO_DEMO = { kind: 'user', user_id: 'demo-user-001' } as const;

const PREFIXO = 'mock_db_';

/**
 * Os quatro gateways que o encaixe consome, na forma mínima que o contrato aceita.
 *
 * Substituir a fábrica sem devolver todos eles faria o carregamento falhar por motivo alheio à
 * promessa — exatamente o que o risco `R-03` descreve.
 */
function gatewaysDoProvedor() {
  return {
    entities: new Proxy(
      {},
      {
        get: () => ({
          list: async () => [],
          filter: async () => [],
          create: async (dados: unknown) => dados,
          update: async (_id: string, dados: unknown) => dados,
          delete: async () => ({ success: true }),
        }),
      },
    ),
    auth: {
      me: async () => ({ id: 'usuario-do-provedor', email: 'provedor@exemplo.test' }),
      logout: async () => {},
      redirectToLogin: () => {},
      getPublicSettings: async () => ({}),
    },
    integrations: {
      Core: {
        UploadFile: async () => ({ file_url: '' }),
        SendEmail: async () => ({}),
      },
    },
    appLogs: {
      logUserInApp: async () => {},
    },
  };
}

describe('Modo offline — a ativação', () => {
  beforeEach(() => {
    localStorage.clear();
    criarClienteDoProvedor.mockReset();
    criarClienteDoProvedor.mockReturnValue(gatewaysDoProvedor());
    // O registro é descartado ANTES de cada importação: a variável é lida no carregamento, e sem
    // isso a troca de ambiente não tem efeito (`D-04`).
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('com a variável ligada, o cliente exportado é o do adaptador local', async () => {
    vi.stubEnv('VITE_OFFLINE', 'true');
    vi.resetModules();

    const { base44 } = await import('../base44Client');

    // A fábrica do provedor NÃO foi consultada: o ramo local foi o escolhido.
    expect(criarClienteDoProvedor).not.toHaveBeenCalled();

    // E o efeito é observável no comportamento, não na identidade do objeto: a leitura escopada
    // devolve o seed, com o dono que o próprio adaptador carimba (`D-03`).
    const pacientes = await base44.entities.Patient.listOwned(ESCOPO_DO_DEMO);
    expect(pacientes.map((paciente) => paciente.id)).toEqual(
      mockSeed.Patient.map((paciente) => paciente.id),
    );

    // E a passagem pelo adaptador deixou rastro no armazenamento, que é o que ele promete.
    expect(localStorage.getItem(PREFIXO + 'Patient')).not.toBeNull();
  });

  it('sem a variável, a fábrica do provedor é chamada e nada é semeado', async () => {
    vi.stubEnv('VITE_OFFLINE', 'false');
    vi.resetModules();

    const { base44 } = await import('../base44Client');

    // A outra metade da promessa: o comportamento volta ao provedor.
    expect(criarClienteDoProvedor).toHaveBeenCalledTimes(1);

    // E o cliente exportado não é o do adaptador local — a distinção é de COMPORTAMENTO: o
    // substituto devolve vazio, e o armazenamento local nunca é tocado.
    const pacientes = await base44.entities.Patient.listOwned(ESCOPO_DO_DEMO);
    expect(pacientes).toEqual([]);
    expect(localStorage.getItem(PREFIXO + 'Patient')).toBeNull();
  });
});
