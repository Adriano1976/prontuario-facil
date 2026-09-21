import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Consultations from '../Consultations';
import {
  consulta,
  consultaEm,
  consultaSemSituacao,
  diasAtras,
  diasAFrente,
  hoje,
  horaLocal,
  paciente,
} from '@/test/consultationsFixtures';
import type { Consultation, Patient } from '@/types';
import type { ReactNode } from 'react';

/**
 * Prova de TELA da listagem de consultas em `Consultations`.
 *
 * O QUE SE MEDE AQUI: o filtro por situação e os quatro recortes de intervalo de data.
 * Nos dois casos a afirmação é sobre o que a lista **mostra** — a contagem e os nomes que
 * aparecem —, e não sobre a chamada do filtro. Um predicado correto que não chegasse à
 * tela não seria prova de nada para quem usa o sistema.
 *
 * SOBRE O RECORTE DE DATA: o valor de "hoje" decide o resultado, então o `Date` é
 * congelado nas verificações de recorte (decisão D-04 do roadmap). Congela-se **apenas**
 * o `Date`, com temporizadores reais: o conflito que a feature 003 encontrou foi com
 * temporizadores falsos, não com a data, e as esperas do `userEvent` continuam
 * funcionando.
 */

const { armazem, listarConsultas, listarPacientes } = vi.hoisted(() => ({
  armazem: {
    consultas: [] as Consultation[],
    pacientes: [] as Patient[],
  },
  listarConsultas: vi.fn(),
  listarPacientes: vi.fn(),
}));

/** Mesmos dublês de `PatientDetail.test.tsx`: sessão, escopo, entidades e react-query. */
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'demo-user-001',
        email: 'demo@medrecord.local',
      }),
    },
    entities: {
      Consultation: { listOwned: listarConsultas },
      Patient: { listOwned: listarPacientes },
    },
  },
}));

vi.mock('@/api/sessionScope', () => ({
  asUserScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
  resolveScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
}));

vi.mock('@/lib/session', () => ({
  toSessionUser: vi.fn((user) => ({
    kind: 'authenticated',
    ...user,
  })),
}));

/**
 * Dublê das duas leituras. As duas chaves que a tela pede são conhecidas: a lista de
 * consultas e a de pacientes, ambas já escopadas pela tela.
 */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: string[] }) => {
    const colecao = options.queryKey[0];
    if (colecao === 'consultations') return { data: armazem.consultas, isLoading: false };
    if (colecao === 'patients') return { data: armazem.pacientes, isLoading: false };
    return { data: undefined, isLoading: false };
  },
}));

/**
 * Dublê do módulo de seleção, no padrão de `PatientForm.test.tsx`.
 *
 * Motivo: o seletor real monta as opções num portal e depende de eventos de ponteiro que
 * o DOM simulado não reproduz — abri-lo levava o `userEvent` a estourar o tempo limite na
 * feature 002. Com o dublê, escolher uma opção é operação de `<select>` nativo.
 *
 * RESSALVA DECLARADA: o que se mede é o que a **tela** decide oferecer e como ela reage à
 * escolha, e não o que o componente de interface desenha. É a mesma ressalva registrada
 * para a prova do tipo sanguíneo na feature 002.
 */
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <select
      aria-label="Seletor"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

type User = ReturnType<typeof userEvent.setup>;

/**
 * Os dois seletores da tela, por posição: **situação** e depois **data**.
 *
 * O dublê não recebe rótulo próprio — na tela o rótulo é irmão, não propriedade do
 * controle —, então o que os distingue é a ordem no documento. A contagem é afirmada a
 * cada chamada para que um terceiro seletor introduzido depois **falhe alto**, em vez de
 * fazer a verificação medir o controle errado em silêncio.
 */
function seletores(): HTMLSelectElement[] {
  const encontrados = screen.getAllByRole('combobox') as HTMLSelectElement[];
  expect(encontrados).toHaveLength(2);
  return encontrados;
}

const seletorDeSituacao = () => seletores()[0];
const seletorDeData = () => seletores()[1];

function renderizarTela() {
  return render(
    <MemoryRouter>
      <Consultations />
    </MemoryRouter>,
  );
}

/** Preenche o armazém com cinco consultas, uma por situação, mais uma sem situação. */
function armazemComUmaDeCada() {
  const nomes = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Alves', 'Elisa Prado'];
  nomes.forEach((nome, indice) => {
    armazem.pacientes.push(paciente({ id: `paciente-${indice + 1}`, full_name: nome }));
  });

  armazem.consultas.push(
    consulta({ id: 'c-agendada', patient_id: 'paciente-1', status: 'agendada' }),
    consulta({ id: 'c-andamento', patient_id: 'paciente-2', status: 'em_andamento' }),
    consulta({ id: 'c-concluida', patient_id: 'paciente-3', status: 'concluida' }),
    consulta({ id: 'c-cancelada', patient_id: 'paciente-4', status: 'cancelada' }),
    consultaSemSituacao({ id: 'c-sem-situacao', patient_id: 'paciente-5' }),
  );
}

describe('Consultations — filtro por situação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.consultas.length = 0;
    armazem.pacientes.length = 0;
    armazemComUmaDeCada();
  });

  it('sem filtro, mostra as cinco consultas, inclusive a que não tem situação', async () => {
    const user = userEvent.setup();
    renderizarTela();

    expect(seletorDeSituacao()).toHaveValue('all');
    expect(screen.getByText('5 consultas encontradas')).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Elisa Prado')).toBeInTheDocument();
  });

  it('filtrando por uma situação, mostra apenas os registros daquela situação', async () => {
    const user = userEvent.setup();
    renderizarTela();

    await user.selectOptions(seletorDeSituacao(), 'concluida');

    expect(screen.getByText('1 consultas encontradas')).toBeInTheDocument();
    expect(screen.getByText('Carla Dias')).toBeInTheDocument();
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument();
    expect(screen.queryByText('Bruno Lima')).not.toBeInTheDocument();
    expect(screen.queryByText('Diego Alves')).not.toBeInTheDocument();
  });

  it('o registro sem situação não aparece em filtro específico nenhum', async () => {
    const user = userEvent.setup();
    renderizarTela();

    // Percorre as quatro situações do enum: em nenhuma delas o registro sem situação
    // pode aparecer, porque a comparação é de igualdade estrita com o valor do filtro.
    for (const situacao of ['agendada', 'em_andamento', 'concluida', 'cancelada'] as const) {
      await user.selectOptions(seletorDeSituacao(), situacao);
      expect(
        screen.queryByText('Elisa Prado'),
        `o registro sem situação apareceu no filtro ${situacao}`,
      ).not.toBeInTheDocument();
    }

    // E volta a aparecer quando o filtro é limpo — a ausência acima é do filtro, não do
    // registro, que continua carregado na tela.
    await user.selectOptions(seletorDeSituacao(), 'all');
    expect(screen.getByText('Elisa Prado')).toBeInTheDocument();
  });

  it('filtro sem resultado exibe o estado vazio orientando a ajustar os filtros', async () => {
    const user = userEvent.setup();
    // Remove a única cancelada para que o filtro por essa situação fique vazio.
    armazem.consultas.splice(
      armazem.consultas.findIndex((c) => c.id === 'c-cancelada'),
      1,
    );
    renderizarTela();

    await user.selectOptions(seletorDeSituacao(), 'cancelada');

    expect(screen.getByText('0 consultas encontradas')).toBeInTheDocument();
    expect(screen.getByText('Tente ajustar os filtros de busca')).toBeInTheDocument();
  });
});

/**
 * Os quatro recortes de intervalo, com o `Date` congelado no dia 2026-09-21 às 12:00 —
 * um dia de semana, com hora no meio da tarde, para que "hoje pela manhã" e "hoje à
 * tarde" sejam distinguíveis pelo recorte de "próximas".
 */
describe('Consultations — recorte por intervalo de data', () => {
  const DIA = new Date(2026, 8, 21);

  beforeEach(() => {
    vi.clearAllMocks();
    armazem.consultas.length = 0;
    armazem.pacientes.length = 0;
    armazem.pacientes.push(paciente({ id: 'paciente-1', full_name: 'Ana Souza' }));

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(horaLocal(DIA, 12, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Seis consultas desenhadas para separar cada recorte do seguinte. Todas às 10:00,
   * exceto a segunda de hoje — que é às 15:00 justamente para separar o recorte de
   * "hoje", que compara o dia, do de "próximas", que compara o instante completo.
   */
  function armazemDeRecortes() {
    armazem.consultas.push(
      consultaEm(horaLocal(DIA, 10, 0), 'agendada', { id: 'hoje-manha' }),
      consultaEm(horaLocal(DIA, 15, 0), 'agendada', { id: 'hoje-tarde' }),
      consultaEm(horaLocal(diasAtras(3), 10, 0), 'agendada', { id: 'tres-dias-atras' }),
      consultaEm(horaLocal(diasAtras(20), 10, 0), 'agendada', { id: 'vinte-dias-atras' }),
      consultaEm(horaLocal(diasAtras(40), 10, 0), 'agendada', { id: 'quarenta-dias-atras' }),
      consultaEm(horaLocal(diasAFrente(3), 10, 0), 'agendada', { id: 'tres-dias-a-frente' }),
    );
  }

  it('o recorte "hoje" usa o dia, e não a hora', async () => {
    const user = userEvent.setup();
    armazemDeRecortes();
    renderizarTela();

    await user.selectOptions(seletorDeData(), 'today');

    // As duas de hoje entram, a da manhã inclusive: o recorte compara o DIA.
    expect(screen.getByText('2 consultas encontradas')).toBeInTheDocument();
  });

  it('o recorte "última semana" inclui os sete dias anteriores — e também o futuro', async () => {
    const user = userEvent.setup();
    armazemDeRecortes();
    renderizarTela();

    await user.selectOptions(seletorDeData(), 'week');

    // Esperado: as duas de hoje, a de três dias atrás e a de três dias à frente. O
    // recorte é uma comparação `>=` com sete dias atrás, sem limite superior — então ele
    // NÃO é "última semana" no sentido de passado, e a consulta futura entra. É o
    // comportamento real do código, e a prova o registra como verdadeiro.
    expect(screen.getByText('4 consultas encontradas')).toBeInTheDocument();
  });

  it('o recorte "último mês" alcança trinta dias atrás e não além', async () => {
    const user = userEvent.setup();
    armazemDeRecortes();
    renderizarTela();

    await user.selectOptions(seletorDeData(), 'month');

    // Todas menos a de quarenta dias atrás.
    expect(screen.getByText('5 consultas encontradas')).toBeInTheDocument();
  });

  it('o recorte "próximas" compara o instante completo, e não o dia', async () => {
    const user = userEvent.setup();
    armazemDeRecortes();
    renderizarTela();

    await user.selectOptions(seletorDeData(), 'upcoming');

    // Só a de hoje às 15:00 e a de três dias à frente. A de hoje às 10:00 fica de fora
    // porque o instante já passou — é a consequência documentada em
    // `_reversa_sdd/code-analysis.md#4.2 Filtro de Intervalo de Data`.
    expect(screen.getByText('2 consultas encontradas')).toBeInTheDocument();
  });

  it('sem recorte, as seis aparecem', async () => {
    const user = userEvent.setup();
    armazemDeRecortes();
    renderizarTela();

    expect(seletorDeData()).toHaveValue('all');
    expect(screen.getByText('6 consultas encontradas')).toBeInTheDocument();
  });
});
