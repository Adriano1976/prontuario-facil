import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Appointments from '../Appointments';
import {
  PROXIMA_SEGUNDA,
  agendamento,
  horaLocal,
  medico,
  paciente,
} from '@/test/appointmentsFixtures';
import type { Appointment, Doctor, Patient } from '@/types';
import type { ReactNode } from 'react';

/**
 * Prova de TELA da situação do agendamento em `Appointments`.
 *
 * POR QUE PELA TELA: a situação de um agendamento só muda por decisão do usuário dentro
 * do diálogo de detalhes. Provar a mutação isolada não diria nada sobre o clique que a
 * oferece, sobre o diálogo que a dispara, nem sobre o que a lista passa a mostrar — que
 * é o único lugar onde a transição (ou a ausência dela) existe para quem usa o sistema.
 */

const { armazem, atualizarAgendamento, listarAgendamentos, listarMedicos, listarPacientes } =
  vi.hoisted(() => ({
    armazem: {
      agendamentos: [] as Appointment[],
      medicos: [] as Doctor[],
      pacientes: [] as Patient[],
    },
    atualizarAgendamento: vi.fn(),
    listarAgendamentos: vi.fn(),
    listarMedicos: vi.fn(),
    listarPacientes: vi.fn(),
  }));

/**
 * Consulta vinculada, já CONCLUÍDA.
 *
 * É a premissa do caso mais importante deste arquivo: o atendimento já terminou. O
 * vínculo existe no domínio como `Appointment.consultation_id`, e não há — em tela
 * alguma — quem derive a situação do agendamento a partir da consulta. É essa ausência
 * que a prova registra, afirmando sempre o VALOR que o usuário veria.
 */
const consultaConcluida = { id: 'consulta-1', status: 'concluida' };

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
      Appointment: {
        listOwned: listarAgendamentos,
        update: atualizarAgendamento,
      },
      Doctor: { list: listarMedicos },
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
 * Dublê das leituras e da gravação.
 *
 * As leituras saem do armazém, e a gravação é aplicada a ele: assim a persistência pode
 * ser lida de VOLTA pela tela numa segunda renderização — sem isso, a única evidência
 * possível seria o formato da chamada, que não é o que o usuário vê.
 */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: string[] }) => {
    const colecao = options.queryKey[0];
    if (colecao === 'appointments') return { data: armazem.agendamentos, isLoading: false };
    if (colecao === 'doctors') return { data: armazem.medicos, isLoading: false };
    if (colecao === 'patients') return { data: armazem.pacientes, isLoading: false };
    return { data: undefined, isLoading: false };
  },
  useMutation: (options: {
    mutationFn: (variaveis: { id: string; status: string }) => Promise<unknown>;
    onSuccess?: () => void;
  }) => ({
    mutate: (variaveis: { id: string; status: string }) => {
      void options.mutationFn(variaveis).then(() => options.onSuccess?.());
    },
    isPending: false,
  }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

/**
 * Dublê do módulo de seleção, no padrão de `PatientForm.test.tsx`.
 *
 * Motivo: o seletor real monta as opções num portal e depende de eventos de ponteiro
 * que o DOM simulado não reproduz — abri-lo aqui levaria o `userEvent` a estourar o
 * tempo limite. Com o dublê, as opções existem como `<option>` de um `<select>` nativo,
 * e o que se mede é a decisão do diálogo: qual valor a tela mostra e qual valor ela
 * envia ao gravar.
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

function renderizarTela() {
  return render(
    <MemoryRouter>
      <Appointments />
    </MemoryRouter>,
  );
}

/**
 * Abre a aba de lista. É lá que a situação aparece por extenso, ao lado do paciente — a
 * aba de calendário só a expressa por cor, e a cor não é afirmável.
 */
async function abrirLista(user: User) {
  await user.click(screen.getByRole('tab', { name: 'Lista' }));
}

/** Abre o diálogo de detalhes clicando no agendamento do paciente indicado. */
async function abrirDetalhes(user: User, nomeDoPaciente: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(nomeDoPaciente) }));
  const dialogo = await screen.findByRole('dialog');
  expect(within(dialogo).getByRole('heading', { name: 'Detalhes do Agendamento' })).toBeInTheDocument();
  return dialogo;
}

/** O seletor de situação do diálogo. `Appointments` tem exatamente um. */
function seletorDeSituacao(dialogo: HTMLElement) {
  return within(dialogo).getByRole('combobox', { name: 'Seletor' });
}

describe('Appointments — situação do agendamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.agendamentos.length = 0;
    armazem.medicos.length = 0;
    armazem.pacientes.length = 0;
    armazem.medicos.push(medico());
    armazem.pacientes.push(paciente());
    // `clearAllMocks` não devolve a implementação ao estado inicial: a gravação é
    // rearmada em cada teste para que nenhum caso herde o armazém do anterior.
    atualizarAgendamento.mockReset();
    atualizarAgendamento.mockImplementation(
      async (id: string, alteracoes: Partial<Appointment>) => {
        const registro = armazem.agendamentos.find((item) => item.id === id);
        if (registro) Object.assign(registro, alteracoes);
        return registro;
      },
    );
  });

  it('mostra o agendamento recém-criado com a situação agendado', async () => {
    const user = userEvent.setup();
    // `agendamento()` nasce com a situação padrão da criação — a mesma que
    // `NewAppointment` envia ao gravar.
    armazem.agendamentos.push(agendamento());

    renderizarTela();
    await abrirLista(user);

    expect(screen.getByText('1 agendamentos próximos')).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Dra. Helena Prado - Clínica Geral')).toBeInTheDocument();
    expect(screen.getByText('Agendado')).toBeInTheDocument();

    const dialogo = await abrirDetalhes(user, 'Ana Souza');
    expect(seletorDeSituacao(dialogo)).toHaveValue('agendado');
  });

  it('grava a transição para confirmado pelo diálogo aberto no clique do agendamento', async () => {
    const user = userEvent.setup();
    armazem.agendamentos.push(agendamento());

    const { unmount } = renderizarTela();
    await abrirLista(user);

    const dialogo = await abrirDetalhes(user, 'Ana Souza');
    // Ponto de partida afirmado como valor: o diálogo abre mostrando a situação gravada.
    expect(seletorDeSituacao(dialogo)).toHaveValue('agendado');

    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));

    await vi.waitFor(() =>
      expect(atualizarAgendamento).toHaveBeenCalledWith('agendamento-1', { status: 'confirmado' }),
    );
    // A confirmação se vê na tela: o diálogo se fecha quando a gravação é aceita.
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // Segunda renderização: a tela relê o armazém já gravado. É o valor persistido que
    // aparece para quem usa o sistema — não a chamada que o produziu.
    unmount();
    renderizarTela();
    await abrirLista(user);

    expect(screen.getByText('Confirmado')).toBeInTheDocument();
    const segundoDialogo = await abrirDetalhes(user, 'Ana Souza');
    expect(seletorDeSituacao(segundoDialogo)).toHaveValue('confirmado');
  });

  it('persiste a saída para cancelado: o agendamento deixa a lista de próximos', async () => {
    const user = userEvent.setup();
    armazem.agendamentos.push(agendamento());

    const { unmount } = renderizarTela();
    await abrirLista(user);
    const dialogo = await abrirDetalhes(user, 'Ana Souza');

    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    await vi.waitFor(() =>
      expect(atualizarAgendamento).toHaveBeenCalledWith('agendamento-1', { status: 'cancelado' }),
    );

    unmount();
    renderizarTela();
    await abrirLista(user);

    // O cancelado sai da contagem de próximos (filtro da própria tela): o agendamento
    // some da lista, e é isso que o usuário vê depois de cancelar.
    expect(screen.getByText('0 agendamentos próximos')).toBeInTheDocument();
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument();
  });

  it('persiste a saída para faltou pelo seletor de situação', async () => {
    const user = userEvent.setup();
    armazem.agendamentos.push(agendamento());

    const { unmount } = renderizarTela();
    await abrirLista(user);
    const dialogo = await abrirDetalhes(user, 'Ana Souza');

    // 'faltou' não tem botão próprio no diálogo: o único caminho de tela até ela é o
    // seletor, que oferece o conjunto fechado de situações.
    await user.selectOptions(seletorDeSituacao(dialogo), 'faltou');

    await vi.waitFor(() =>
      expect(atualizarAgendamento).toHaveBeenCalledWith('agendamento-1', { status: 'faltou' }),
    );

    unmount();
    renderizarTela();
    await abrirLista(user);

    // 'faltou' não é saída de lista: o registro continua entre os próximos, com a
    // situação nova escrita na tela.
    expect(screen.getByText('1 agendamentos próximos')).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Faltou')).toBeInTheDocument();
  });

  it('não transiciona o agendamento quando a consulta vinculada já está concluída', async () => {
    const user = userEvent.setup();
    armazem.agendamentos.push(
      agendamento({ status: 'em_atendimento', consultation_id: consultaConcluida.id }),
    );

    renderizarTela();
    await abrirLista(user);

    // A prova é o VALOR: a consulta terminou e a situação continua a que foi gravada.
    expect(screen.getByText('Em Atendimento')).toBeInTheDocument();
    // Os rótulos que a tela mostraria se houvesse transição automática não estão lá.
    // (Conferido antes de abrir o diálogo: lá dentro eles existem como opções do seletor.)
    expect(screen.queryByText('Concluído')).not.toBeInTheDocument();
    expect(screen.queryByText('Confirmado')).not.toBeInTheDocument();

    const dialogo = await abrirDetalhes(user, 'Ana Souza');
    expect(seletorDeSituacao(dialogo)).toHaveValue('em_atendimento');
  });

  it('as flags de lembrete não alteram a situação', async () => {
    const user = userEvent.setup();
    armazem.agendamentos.push(
      agendamento({
        status: 'agendado',
        reminder_sent: true,
        reminder_sent_date: horaLocal(PROXIMA_SEGUNDA, 8, 0).toISOString(),
      }),
    );

    renderizarTela();
    await abrirLista(user);

    // Lembrete enviado é apenas registro: não promove o agendamento a confirmado nem o
    // move para atendimento.
    expect(screen.getByText('Agendado')).toBeInTheDocument();
    expect(screen.queryByText('Confirmado')).not.toBeInTheDocument();
    expect(screen.queryByText('Em Atendimento')).not.toBeInTheDocument();

    const dialogo = await abrirDetalhes(user, 'Ana Souza');
    expect(seletorDeSituacao(dialogo)).toHaveValue('agendado');
  });
});
