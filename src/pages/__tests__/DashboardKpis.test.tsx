import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from '../Dashboard';
import { USUARIO_DA_SESSAO } from '@/test/auditFixtures';
import {
  AGENDAMENTOS_HOJE,
  PACIENTES_ATIVOS,
  PRESCRICOES,
  agendamento,
  agendamentosDeHoje,
  cenarioDeProximos,
  consultasDeHoje,
  diasAFrente,
  diasAtras,
  horaLocal,
  pacientesMistos,
  prescricoesEmitidas,
} from '@/test/dashboardFixtures';
import type { Appointment, Consultation, Patient, Prescription } from '@/types';

/**
 * Prova de TELA dos KPIs do Dashboard — os cinco cenários de `PT-008` e as regras que os sustentam.
 *
 * O QUE SE MEDE AQUI: o valor que cada cartão **exibe**, com massa mista, mais os argumentos com
 * que as quatro leituras são emitidas. Nada de comportamento de aplicação é alterado por esta
 * feature: ela transforma em asserção o que era promessa.
 *
 * | Requisito | Cenário / regra | Como é provado |
 * |-----------|-----------------|----------------|
 * | `RF-01` | `PT-008.1` · `BR-MIGRAR-027` | valor do cartão "Pacientes Ativos" |
 * | `RF-02` | `PT-008.2` · `BR-MIGRAR-028` | valor do cartão "Agendamentos Hoje", com as bordas |
 * | `RF-03` | `PT-008.3` · `AMB-002` | **ausência**: o painel tem quatro cartões, e nenhum é contador de consultas |
 * | `RF-04` | `PT-008.4` · `AMB-001` | valor do cartão "Taxa de Atendimento" e ausência de tendência |
 * | `RF-05` | `PT-008.5` · `BR-MIGRAR-030` | a lista "Próximos Agendamentos" e o estado vazio |
 * | `RF-06` | `BR-MIGRAR-029` | valor do cartão "Documentos Emitidos", com massa e sem massa |
 * | `RF-07` | `BR-MIGRAR-033` | os limites das quatro leituras, no transporte |
 * | `RF-08` | `BR-MIGRAR-033` | o escopo declarado nas quatro leituras, no transporte |
 *
 * ⚠️ DOIS ACHADOS FICAM REGISTRADOS AQUI, e **não** viram verificação — nenhuma asserção de tela
 * sustenta as duas afirmações abaixo, e escrevê-las como teste produziria um teste que mede a si
 * mesmo:
 *
 * 1. **O quarto cartão não é uma contagem de consultas.** `Dashboard.tsx:83-92` calcula
 *    `todayConsultations` e `upcomingConsultations` e **descarta os dois**: nenhum cartão os
 *    consome. O critério divergente de `AMB-002` está preservado em CÓDIGO MORTO — o critério
 *    existe, a superfície não. Por isso `PT-008.3` é provado pela ausência (`RF-03`): o painel
 *    exibe exatamente os quatro cartões do legado, e nenhum deles é um contador de consultas de
 *    hoje. A massa de consultas entra nos testes para tornar o descarte **observável**.
 * 2. **A constante de `AMB-001` nunca existiu.** A decisão humana registrou "manter `94%` como
 *    constante explícita e tipada (`TAXA_ATENDIMENTO_MOCK = 94`)", mas não há símbolo com esse
 *    nome em `src/`: o valor é o literal `"94%"` em `Dashboard.tsx:173`. O que esta prova trava é
 *    o **comportamento** — o valor exibido —, e a divergência entre o decidido e o implementado
 *    fica registrada, não corrigida.
 *
 * ⚠️ O DUBLÊ DE CONSULTA MODELA A CACHE, e isso é deliberado. Um dublê que executasse a função de
 * consulta a cada renderização contaria **renderizações**, não pedidos — armadilha medida na
 * feature 006, onde a contagem saiu 6× maior que o real. Como `RF-07` afirma **uma** chamada por
 * leitura, um dublê ingênuo faria a verificação falhar por culpa do arnês. A cache é limpa entre
 * verificações, senão a massa de um caso vaza para o seguinte.
 *
 * ⚠️ A SESSÃO E O ESCOPO NÃO SÃO DUBLADOS (`D-03`). `toSessionUser` e `resolveScope` correm de
 * verdade; substitui-se apenas o transporte e a chamada de sessão. Dublar a resolução de escopo
 * faria `RF-08` comparar o dublê consigo mesmo — armadilha medida na feature 005.
 *
 * ⚠️ A LEITURA DO CARTÃO ANCORA NA ESTRUTURA (`D-04`, risco `R-02`). O cartão renderiza
 * `<p>título</p><p>valor</p>` no mesmo contêiner. O acoplamento vive num único auxiliar; se o
 * cartão mudar de forma, a quebra é um diagnóstico claro, e não um erro espalhado.
 */

/** Os quatro cartões do legado, na ordem em que a página os renderiza. */
const CARTOES_DO_LEGADO = [
  'Pacientes Ativos',
  'Agendamentos Hoje',
  'Documentos Emitidos',
  'Taxa de Atendimento',
] as const;

const { buscarUsuario, lerPacientes, lerConsultas, lerPrescricoes, lerAgendamentos, cacheDeConsultas } =
  vi.hoisted(() => ({
    buscarUsuario: vi.fn(),
    lerPacientes: vi.fn(),
    lerConsultas: vi.fn(),
    lerPrescricoes: vi.fn(),
    lerAgendamentos: vi.fn(),
    cacheDeConsultas: new Map<string, unknown>(),
  }));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: buscarUsuario },
    entities: {
      Patient: { listOwned: lerPacientes },
      Consultation: { listOwned: lerConsultas },
      Prescription: { listOwned: lerPrescricoes },
      Appointment: { listOwned: lerAgendamentos },
      // O transporte da auditoria é substituído; o módulo `AccessLogger` corre de verdade.
      AccessLog: { asUser: () => ({ create: vi.fn().mockResolvedValue({}) }) },
    },
  },
}));

/**
 * Dublê de consulta de dados com **cache por chave**.
 *
 * A função roda **uma vez por chave** e o resultado é guardado; a atualização de estado existe
 * para que a página re-renderize quando o dado chega — sem ela, o valor nunca apareceria e a
 * verificação mediria o carregamento, não o KPI.
 */
vi.mock('@tanstack/react-query', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useQuery: ({ queryKey, queryFn }: { queryKey: unknown[]; queryFn: () => Promise<unknown> }) => {
      const chave = JSON.stringify(queryKey);
      const [, forcarAtualizacao] = useState(0);

      useEffect(() => {
        if (cacheDeConsultas.has(chave)) return;
        let vivo = true;
        void queryFn().then((dados) => {
          if (!vivo) return;
          cacheDeConsultas.set(chave, dados);
          forcarAtualizacao((versao) => versao + 1);
        });
        return () => {
          vivo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- uma execução por chave, de propósito
      }, [chave]);

      return { data: cacheDeConsultas.get(chave), isLoading: !cacheDeConsultas.has(chave) };
    },
  };
});

/** Os dois componentes pesados não participam de nenhum requisito desta feature. */
vi.mock('@/components/medical/PatientSearch', () => ({ default: () => null }));
vi.mock('@/components/medical/ReportsView', () => ({ default: () => null }));

interface MassaDeProva {
  pacientes?: Patient[];
  consultas?: Consultation[];
  prescricoes?: Prescription[];
  agendamentos?: Appointment[];
}

/** Liga as quatro leituras à massa do caso. O que não é informado chega vazio. */
function configurar(massa: MassaDeProva = {}) {
  lerPacientes.mockResolvedValue(massa.pacientes ?? []);
  lerConsultas.mockResolvedValue(massa.consultas ?? []);
  lerPrescricoes.mockResolvedValue(massa.prescricoes ?? []);
  lerAgendamentos.mockResolvedValue(massa.agendamentos ?? []);
}

/**
 * Os cartões de KPI, na ordem em que a página os renderiza.
 *
 * A âncora é a **grade** que contém os cartões, e não a classe do título: subir do título até o
 * ancestral com `grid` é estável mesmo que a estilização do cartão mude. Cada cartão é um filho da
 * grade, e dentro dele os parágrafos são, nesta ordem, o título e o valor.
 */
function cartoesDeKpi(): { titulo: string; valor: string }[] {
  const grade = screen.getByText(CARTOES_DO_LEGADO[0]).closest('div.grid');
  if (!grade) throw new Error('A grade de cartões de KPI não foi encontrada.');

  return Array.from(grade.children).map((cartao) => {
    const paragrafos = cartao.querySelectorAll('p');
    return {
      titulo: paragrafos[0]?.textContent ?? '',
      valor: paragrafos[1]?.textContent ?? '',
    };
  });
}

/** O valor exibido por um cartão, pelo título. */
function valorDoCartao(titulo: string): string {
  const cartao = cartoesDeKpi().find((candidato) => candidato.titulo === titulo);
  if (!cartao) throw new Error(`O cartão "${titulo}" não foi renderizado.`);
  return cartao.valor;
}

/** Espera o cartão exibir o valor esperado — a primeira pintura acontece antes do dado chegar. */
async function esperarCartao(titulo: string, valor: string): Promise<void> {
  await waitFor(() => expect(valorDoCartao(titulo)).toBe(valor));
}

function renderizarDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard — KPIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheDeConsultas.clear();
    buscarUsuario.mockResolvedValue({ ...USUARIO_DA_SESSAO });
  });

  describe('PT-008.1 — Pacientes Ativos conta apenas status "ativo"', () => {
    it('ignora os pacientes inativos', async () => {
      configurar({ pacientes: pacientesMistos() });
      renderizarDashboard();

      await esperarCartao('Pacientes Ativos', String(PACIENTES_ATIVOS));
    });
  });

  describe('PT-008.2 — Agendamentos Hoje exclui cancelados', () => {
    it('exclui o cancelado de hoje e ignora os de outra data', async () => {
      // A massa tem dois válidos, um cancelado de hoje, um de ontem e um de amanhã — todos os
      // três últimos NÃO podem entrar. Se o critério ignorasse o status, o cartão diria 4; se
      // ignorasse a data, diria 4 também.
      configurar({ agendamentos: agendamentosDeHoje() });
      renderizarDashboard();

      await esperarCartao('Agendamentos Hoje', String(AGENDAMENTOS_HOJE));
    });

    it('não exclui o que não é cancelado', async () => {
      // O critério do legado exclui APENAS `cancelado`. `faltou`, `concluido` e `confirmado`
      // continuam contando — é o que separa "exclui cancelados" de "conta só os agendados".
      configurar({
        agendamentos: [
          agendamento({ id: 'faltou', status: 'faltou' }),
          agendamento({ id: 'concluido', status: 'concluido' }),
          agendamento({ id: 'confirmado', status: 'confirmado' }),
        ],
      });
      renderizarDashboard();

      await esperarCartao('Agendamentos Hoje', '3');
    });

    it('exibe zero quando não há agendamento hoje', async () => {
      configurar({
        agendamentos: [
          agendamento({ id: 'ontem', date: horaLocal(diasAtras(1), 10, 0).toISOString() }),
          agendamento({ id: 'amanha', date: horaLocal(diasAFrente(1), 10, 0).toISOString() }),
        ],
      });
      renderizarDashboard();

      await esperarCartao('Agendamentos Hoje', '0');
    });
  });

  describe('PT-008.3 — Divergência de Consultas de Hoje é preservada', () => {
    it('não expõe nenhum contador de consultas de hoje', async () => {
      // A divergência de `AMB-002` está preservada em CÓDIGO MORTO: os dois agregados de consulta
      // são calculados e descartados, e o critério não tem superfície. O que é medível — e o que
      // esta verificação trava — é o conjunto de cartões.
      configurar({
        pacientes: pacientesMistos(),
        consultas: consultasDeHoje(),
        prescricoes: prescricoesEmitidas(),
        agendamentos: agendamentosDeHoje(),
      });
      renderizarDashboard();

      await esperarCartao('Pacientes Ativos', String(PACIENTES_ATIVOS));

      // 1. Os quatro cartões do legado, e exatamente eles.
      expect(cartoesDeKpi().map((cartao) => cartao.titulo)).toEqual([...CARTOES_DO_LEGADO]);

      // 2. Os valores são os das quatro regras — o número de consultas de hoje não aparece em
      //    cartão nenhum, embora a leitura de consultas tenha acontecido com massa.
      expect(cartoesDeKpi().map((cartao) => cartao.valor)).toEqual([
        String(PACIENTES_ATIVOS),
        String(AGENDAMENTOS_HOJE),
        String(PRESCRICOES),
        '94%',
      ]);

      // 3. E nenhum texto do painel fala de um contador de consultas de hoje.
      expect(screen.queryByText(/consultas de hoje/i)).toBeNull();
    });
  });

  describe('PT-008.4 — Taxa de Atendimento permanece como constante mock "94%"', () => {
    it('exibe a constante, sem fórmula e sem tendência', async () => {
      // A massa é construída de modo que uma fórmula plausível — concluídos sobre o total de
      // agendamentos — daria um valor diferente de 94%. Se alguma fórmula influenciasse o cartão,
      // o valor exibido não seria a constante.
      configurar({
        pacientes: pacientesMistos(),
        consultas: consultasDeHoje(),
        prescricoes: prescricoesEmitidas(),
        agendamentos: agendamentosDeHoje(),
      });
      renderizarDashboard();

      await esperarCartao('Taxa de Atendimento', '94%');

      // Apenas UM percentual em todo o painel, e é a constante.
      const valores = cartoesDeKpi().map((cartao) => cartao.valor);
      expect(valores.filter((valor) => valor.includes('%'))).toEqual(['94%']);

      // Sem sparkline nem barra: o cartão aceita uma tendência opcional, e ela não foi usada.
      expect(screen.queryByText(/este mês/i)).toBeNull();
    });
  });

  describe('PT-008.5 — Próximos agendamentos lista até 5 futuros não cancelados', () => {
    it('limita a lista a cinco', async () => {
      const { agendamentos, pacientes } = cenarioDeProximos();
      configurar({ agendamentos, pacientes });
      renderizarDashboard();

      // Seis futuros válidos na massa: a lista corta em cinco.
      await waitFor(() => expect(screen.getAllByText(/^Futuro \d$/)).toHaveLength(5));
    });

    it('ignora o passado e o cancelado', async () => {
      const { agendamentos, pacientes } = cenarioDeProximos();
      configurar({ agendamentos, pacientes });
      renderizarDashboard();

      await waitFor(() => expect(screen.getAllByText(/^Futuro \d$/)).toHaveLength(5));

      expect(screen.getByText('Futuro 1')).toBeInTheDocument();
      expect(screen.queryByText('Cancelado Futuro')).toBeNull();
      expect(screen.queryByText('Passado')).toBeNull();
    });

    it('exibe o estado vazio com o atalho de agendamento', async () => {
      configurar({
        agendamentos: [
          agendamento({ id: 'passado', date: horaLocal(diasAtras(2), 10, 0).toISOString() }),
        ],
      });
      renderizarDashboard();

      await screen.findByText('Nenhum agendamento');
      expect(screen.getByRole('button', { name: 'Agendar consulta' })).toBeInTheDocument();
    });
  });

  describe('BR-MIGRAR-029 — KPI Documentos Emitidos', () => {
    it('reflete o tamanho da leitura de prescrições', async () => {
      configurar({ prescricoes: prescricoesEmitidas() });
      renderizarDashboard();

      await esperarCartao('Documentos Emitidos', String(PRESCRICOES));
    });

    it('exibe zero quando a leitura vem vazia', async () => {
      // O cartão usa `prescriptions?.length || 0`: com conjunto vazio ele precisa dizer zero, e
      // nunca ficar em branco. Sem este caso, o anterior passaria mesmo com a leitura quebrada.
      configurar({ prescricoes: [] });
      renderizarDashboard();

      await esperarCartao('Documentos Emitidos', '0');
    });
  });

  describe('BR-MIGRAR-033 — limites e escopo das quatro leituras', () => {
    it('emite cada leitura com a ordenação e o limite do legado', async () => {
      configurar({
        pacientes: pacientesMistos(),
        consultas: consultasDeHoje(),
        prescricoes: prescricoesEmitidas(),
        agendamentos: agendamentosDeHoje(),
      });
      renderizarDashboard();

      await esperarCartao('Taxa de Atendimento', '94%');

      // UMA chamada por leitura, e não uma por renderização — é o que confirma que o dublê modela
      // a cache. Uma contagem maior aqui significa que a asserção abaixo estaria medindo renders.
      expect(lerPacientes).toHaveBeenCalledTimes(1);
      expect(lerConsultas).toHaveBeenCalledTimes(1);
      expect(lerPrescricoes).toHaveBeenCalledTimes(1);
      expect(lerAgendamentos).toHaveBeenCalledTimes(1);

      expect(lerPacientes.mock.calls[0].slice(1)).toEqual(['-created_date', 100]);
      expect(lerConsultas.mock.calls[0].slice(1)).toEqual(['-date', 50]);
      expect(lerPrescricoes.mock.calls[0].slice(1)).toEqual(['-created_date', 100]);
      expect(lerAgendamentos.mock.calls[0].slice(1)).toEqual(['-date', 100]);
    });

    it('declara o escopo da sessão nas quatro leituras', async () => {
      // `resolveScope` NÃO é dublado: o escopo comparado abaixo é o que a resolução real produz a
      // partir do usuário da sessão. Comparar contra um dublê mediria o dublê.
      const escopoEsperado = { kind: 'user', user_id: USUARIO_DA_SESSAO.id };

      configurar({ pacientes: pacientesMistos() });
      renderizarDashboard();

      await esperarCartao('Pacientes Ativos', String(PACIENTES_ATIVOS));

      for (const leitura of [lerPacientes, lerConsultas, lerPrescricoes, lerAgendamentos]) {
        expect(leitura).toHaveBeenCalledWith(escopoEsperado, expect.any(String), expect.any(Number));
      }
    });
  });
});
