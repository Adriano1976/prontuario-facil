import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCESS_ACTIONS, logAccess } from '../AccessLogger';
import { ACOES, EMAIL_DA_SESSAO, USUARIO_DA_SESSAO } from '@/test/auditFixtures';
import type { AccessLog } from '@/types';

/**
 * Prova de COMPONENTE do módulo de auditoria em `AccessLogger`.
 *
 * O QUE SE MEDE AQUI: os campos que o logger preenche sozinho, a inserção como única
 * operação da trilha, a **falha aberta** nos dois caminhos em que ela acontece, e o contrato
 * do enum de ações.
 *
 * ⚠️ O MÓDULO NÃO É DUBLADO (decisão D-02 do roadmap). `AccessLogger` corre de verdade e o
 * que se substitui é o **transporte**, `base44.entities.AccessLog`. Se a verificação
 * trocasse `logAccess`, mediria a própria substituição — foi assim que o defeito da feature
 * 004 passou despercebido.
 *
 * ⚠️ A TRILHA FALHA ABERTA, E OS DOIS CAMINHOS SÃO DIFERENTES (decisão D-05). Se a
 * identificação do usuário **falha**, o erro cai no `catch` e é impresso em `console.error`;
 * se ela devolve **usuário vazio**, o módulo sai por um `return` antecipado e **nem isso**
 * acontece. A prova cobre os dois, e a diferença entre eles é afirmada.
 */

const {
  buscarUsuario,
  criarRegistro,
  atualizarRegistro,
  excluirRegistro,
  listarRegistros,
  filtrarRegistros,
} = vi.hoisted(() => ({
  buscarUsuario: vi.fn(),
  criarRegistro: vi.fn(),
  atualizarRegistro: vi.fn(),
  excluirRegistro: vi.fn(),
  listarRegistros: vi.fn(),
  filtrarRegistros: vi.fn(),
}));

/**
 * O transporte da trilha completa: as cinco operações que o repositório expõe.
 *
 * Todas existem no dublê de propósito. Se só a inserção estivesse aqui, a verificação de
 * "nenhuma outra operação" não teria como falhar.
 */
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: buscarUsuario },
    entities: {
      AccessLog: {
        asUser: () => ({
          create: criarRegistro,
          update: atualizarRegistro,
          delete: excluirRegistro,
          list: listarRegistros,
          filter: filtrarRegistros,
        }),
      },
    },
  },
}));

vi.mock('@/api/sessionScope', () => ({
  asUserScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
}));

/**
 * Dublê da conversão de sessão que devolve `undefined` para entrada vazia — é assim que a
 * prova alcança o caminho do `return` antecipado, e não o do `catch`.
 */
vi.mock('@/lib/session', () => ({
  toSessionUser: vi.fn((usuario) =>
    usuario ? { kind: 'authenticated', ...usuario } : undefined,
  ),
}));

/** O documento entregue ao transporte. */
function gravacao(indice = 0): Record<string, unknown> {
  const chamada = criarRegistro.mock.calls[indice];
  if (!chamada) throw new Error(`a gravação de índice ${indice} não aconteceu`);
  return chamada[0] as Record<string, unknown>;
}

describe('AccessLogger — campos que o logger preenche', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarUsuario.mockResolvedValue({ ...USUARIO_DA_SESSAO });
    criarRegistro.mockResolvedValue({} as AccessLog);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('grava o e-mail da sessão, o endereço literal e o agente do navegador', async () => {
    await logAccess(ACCESS_ACTIONS.VIEW_PATIENT, 'Patient', 'paciente-1', 'Ana Souza');

    expect(criarRegistro).toHaveBeenCalledTimes(1);
    const documento = gravacao();

    expect(documento.user_email).toBe(EMAIL_DA_SESSAO);
    expect(documento.action).toBe('view_patient');
    expect(documento.entity_type).toBe('Patient');
    expect(documento.entity_id).toBe('paciente-1');
    expect(documento.patient_name).toBe('Ana Souza');

    // O endereço de rede é o LITERAL, e não um endereço: o navegador não tem acesso ao
    // endereço real do cliente. A asserção negativa é o que separa "gravou o literal" de
    // "gravou algum texto que parece um endereço".
    expect(documento.ip_address).toBe('client-side');
    expect(String(documento.ip_address)).not.toMatch(/^\d+\.\d+\.\d+\.\d+$/);

    expect(documento.user_agent).toBe(navigator.userAgent);
  });

  it('entrega os campos de entidade ausentes quando o evento não tem entidade', async () => {
    await logAccess(ACCESS_ACTIONS.LOGIN, null, null, null, 'Acesso ao dashboard');

    const documento = gravacao();

    // Ausentes, e não vazios: o módulo converte `null` em `undefined` antes de gravar.
    expect(documento.entity_type).toBeUndefined();
    expect(documento.entity_id).toBeUndefined();
    expect(documento.patient_name).toBeUndefined();

    expect(documento.action).toBe('login');
    expect(documento.details).toBe('Acesso ao dashboard');
  });

  it('tolera paciente sem nome e entrega o campo ausente', async () => {
    await logAccess(ACCESS_ACTIONS.VIEW_PATIENT, 'Patient', 'paciente-1', null);

    expect(criarRegistro).toHaveBeenCalledTimes(1);
    expect(gravacao().patient_name).toBeUndefined();
  });
});

describe('AccessLogger — a trilha é somente inserção', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarUsuario.mockResolvedValue({ ...USUARIO_DA_SESSAO });
    criarRegistro.mockResolvedValue({} as AccessLog);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('grava uma vez e não pede leitura, alteração nem exclusão', async () => {
    await logAccess(ACCESS_ACTIONS.EDIT_PATIENT, 'Patient', 'paciente-1', 'Ana Souza');

    // A asserção POSITIVA vem primeiro, e é o que impede o placebo: sem ela, a verificação
    // passaria mesmo se o arranjo nunca tivesse chegado a gravar (risco R-04).
    expect(criarRegistro).toHaveBeenCalledTimes(1);

    expect(atualizarRegistro).not.toHaveBeenCalled();
    expect(excluirRegistro).not.toHaveBeenCalled();
    expect(listarRegistros).not.toHaveBeenCalled();
    expect(filtrarRegistros).not.toHaveBeenCalled();
  });
});

describe('AccessLogger — a gravação falha aberta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarUsuario.mockResolvedValue({ ...USUARIO_DA_SESSAO });
    criarRegistro.mockResolvedValue({} as AccessLog);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('com a identificação recusada, não grava nada e não propaga o erro', async () => {
    // Caminho feliz afirmado ANTES, na mesma verificação: é o que garante que o arranjo
    // grava, e que a ausência adiante é do sistema e não do dublê.
    await logAccess(ACCESS_ACTIONS.LOGIN);
    expect(criarRegistro).toHaveBeenCalledTimes(1);
    criarRegistro.mockClear();

    const erroNoConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
    buscarUsuario.mockRejectedValue(new Error('sessão indisponível'));

    // O erro NÃO chega a quem chamou: o módulo engole por decisão registrada.
    await expect(logAccess(ACCESS_ACTIONS.LOGIN)).resolves.toBeUndefined();

    expect(criarRegistro).not.toHaveBeenCalled();
    // O único vestígio deste caminho é a linha no console.
    expect(erroNoConsole).toHaveBeenCalledTimes(1);
  });

  it('com usuário vazio, não grava nada e não imprime nem propaga', async () => {
    await logAccess(ACCESS_ACTIONS.LOGIN);
    expect(criarRegistro).toHaveBeenCalledTimes(1);
    criarRegistro.mockClear();

    const erroNoConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
    buscarUsuario.mockResolvedValue(null);

    await expect(logAccess(ACCESS_ACTIONS.LOGIN)).resolves.toBeUndefined();

    expect(criarRegistro).not.toHaveBeenCalled();
    // ESTA é a diferença entre os dois caminhos, e é o que torna este o mais silencioso dos
    // modos de perda: nenhum registro, nenhum erro, e nem uma linha no console.
    expect(erroNoConsole).not.toHaveBeenCalled();
  });
});

describe('AccessLogger — contrato do enum de ações', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * SOBRE O INSTRUMENTO, e por que ele basta.
   *
   * O módulo declara o catálogo com `as const satisfies Record<string, AccessLogAction>`, e
   * é o **typecheck** que garante que nenhum valor sai do enum. O que resta provar em
   * execução é a outra direção — que nenhuma das doze **falta** —, e é o que a contagem e a
   * igualdade contra o conjunto fazem.
   *
   * A leitura do `AccessLog.jsonc` seria o instrumento errado: provaria o conteúdo de um
   * arquivo, não o comportamento do sistema (decisão D-03 do roadmap).
   */
  it('declara as doze ações do enum, sem nenhuma faltando nem sobrando', () => {
    const valores = Object.values(ACCESS_ACTIONS);

    expect(valores).toHaveLength(12);
    expect(new Set(valores).size).toBe(12);
    expect([...valores].sort()).toEqual([...ACOES].sort());
  });
});
