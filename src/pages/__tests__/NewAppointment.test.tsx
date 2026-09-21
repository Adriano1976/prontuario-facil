import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewAppointment from '../NewAppointment';
import {
  DURACAO_PADRAO,
  PROXIMA_SEGUNDA,
  PROXIMO_SABADO,
  agendamento,
  horaLocal,
  medico,
  paciente,
} from '@/test/appointmentsFixtures';
import type { Appointment, Doctor, Patient } from '@/types';
import type { ReactNode } from 'react';

/**
 * Prova de TELA da criação de agendamento em `NewAppointment`.
 *
 * O que se mede aqui é o que a tela decide: quando libera o salvamento, o que manda
 * gravar, se revalida ou não o horário já escolhido e em que ordem o e-mail e a
 * confirmação de sucesso acontecem. Nenhuma verificação chama a mutação por fora do
 * clique — o caminho exercitado é o do usuário.
 */

const { armazem, conflitos, eventos, criarAgendamento, enviarEmail, navigate } = vi.hoisted(
  () => ({
    armazem: {
      pacientes: [] as Patient[],
      medicos: [] as Doctor[],
    },
    /** Agendamentos já gravados, por médico — é o que a consulta de conflito devolve. */
    conflitos: {} as Record<string, Appointment[]>,
    /** Ordem observada dos efeitos: o que aconteceu, na sequência em que aconteceu. */
    eventos: [] as string[],
    criarAgendamento: vi.fn(),
    enviarEmail: vi.fn(),
    navigate: vi.fn(),
  }),
);

/** Mesmos dublês de `PatientDetail.test.tsx`, aplicados ao formulário de agendamento. */
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'demo-user-001',
        email: 'demo@medrecord.local',
      }),
    },
    entities: {
      Patient: {
        filterOwned: vi.fn(),
        filterAsAdmin: vi.fn(),
      },
      Doctor: {
        filter: vi.fn(),
      },
      Appointment: {
        filterOwned: vi.fn(),
        filterAsAdmin: vi.fn(),
        create: criarAgendamento,
      },
    },
    integrations: {
      Core: {
        SendEmail: enviarEmail,
      },
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
 * A chave da consulta distingue o que a tela pede, e os conflitos são separados POR
 * MÉDICO: é essa separação que faz a troca de médico na tela revelar o conflito do
 * médico escolhido depois, sem inventar nenhum estado que o servidor não teria.
 *
 * `mutate` reproduz o contrato do gancho real: dispara a gravação e, quando ela resolve,
 * chama `onSuccess`. É por esse caminho que a ordem dos efeitos fica observável.
 */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: unknown[] }) => {
    const [colecao, doctorId] = options.queryKey;
    if (colecao === 'appointments') {
      return { data: conflitos[String(doctorId)] ?? [], isLoading: false };
    }
    if (colecao === 'doctors') return { data: armazem.medicos, isLoading: false };
    if (colecao === 'patients') return { data: armazem.pacientes, isLoading: false };
    return { data: undefined, isLoading: false };
  },
  useMutation: (options: {
    mutationFn: (dados: Record<string, unknown>) => Promise<unknown>;
    onSuccess?: () => void;
    onError?: (erro: unknown) => void;
  }) => ({
    mutate: (dados: Record<string, unknown>) => {
      void options.mutationFn(dados).then(
        () => options.onSuccess?.(),
        (erro: unknown) => options.onError?.(erro),
      );
    },
    isPending: false,
  }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

/**
 * Dublê do módulo de seleção, no padrão de `PatientForm.test.tsx`.
 *
 * Motivo: o seletor real monta as opções num portal e depende de eventos de ponteiro que
 * o DOM simulado não reproduz — abri-lo aqui levava o `userEvent` a estourar o tempo
 * limite. Com o dublê, escolher paciente, médico e tipo é uma operação de `<select>`
 * nativo, e o que se mede é o que a tela decide com essa escolha.
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

/**
 * Dublê do calendário.
 *
 * Motivo: o calendário real é operado por ponteiro sobre uma grade de dias, e o que
 * interessa nesta prova não é o desenho dele, e sim a data exata que ele entrega ao
 * formulário. Os dois botões entregam exatamente as datas derivadas da massa de prova —
 * a segunda-feira (dia de atendimento) e o sábado (fora da jornada).
 *
 * As datas vêm de `import()` dentro da fábrica porque `vi.mock` é içado acima dos
 * imports: ler a massa de prova no momento da chamada evita a zona morta da ligação.
 */
vi.mock('@/components/ui/calendar', async () => {
  const { PROXIMA_SEGUNDA: segunda, PROXIMO_SABADO: sabado } = await import(
    '@/test/appointmentsFixtures'
  );
  return {
    Calendar: ({ onSelect }: { onSelect: (dia: Date) => void }) => (
      <div>
        <button type="button" onClick={() => onSelect(segunda)}>
          Escolher próxima segunda
        </button>
        <button type="button" onClick={() => onSelect(sabado)}>
          Escolher próximo sábado
        </button>
      </div>
    ),
  };
});

type User = ReturnType<typeof userEvent.setup>;

function renderizarFormulario() {
  return render(
    <MemoryRouter>
      <NewAppointment />
    </MemoryRouter>,
  );
}

/**
 * Localiza um seletor pela opção que ele oferece.
 *
 * O dublê do seletor não recebe rótulo próprio (na tela o rótulo é um `<Label>` irmão,
 * não uma propriedade do controle), então o que distingue paciente, médico e tipo de
 * consulta no documento é o conjunto de opções de cada um.
 */
function seletorComOpcao(textoDaOpcao: string): HTMLSelectElement {
  const encontrado = screen
    .getAllByRole('combobox')
    .find((elemento) =>
      Array.from((elemento as HTMLSelectElement).options).some((opcao) =>
        (opcao.textContent ?? '').includes(textoDaOpcao),
      ),
    );
  expect(encontrado).toBeDefined();
  return encontrado as HTMLSelectElement;
}

function botaoSalvar() {
  return screen.getByRole('button', { name: /Confirmar Agendamento/i });
}

/** Escolhe paciente, médico, a próxima segunda-feira e o horário indicado. */
async function preencherAteOHorario(user: User, horario = '10:00') {
  await user.selectOptions(seletorComOpcao('Ana Souza'), 'paciente-1');
  await user.selectOptions(seletorComOpcao('Dra. Helena Prado'), 'medico-1');
  await user.click(screen.getByRole('button', { name: 'Escolher próxima segunda' }));
  await user.click(screen.getByRole('button', { name: horario }));
}

describe('NewAppointment — criação do agendamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.pacientes.length = 0;
    armazem.medicos.length = 0;
    armazem.pacientes.push(paciente());
    armazem.medicos.push(medico());
    for (const chave of Object.keys(conflitos)) {
      delete conflitos[chave];
    }
    eventos.length = 0;
    window.history.replaceState({}, '', '/NewAppointment');
    // `clearAllMocks` não devolve as implementações ao estado inicial: os três dublês
    // abaixo são rearmados para que nenhum teste herde o desfecho do anterior.
    criarAgendamento.mockReset();
    enviarEmail.mockReset();
    navigate.mockReset();
    criarAgendamento.mockImplementation(async (dados: Record<string, unknown>) => {
      eventos.push('gravacao-aceita');
      return { id: 'agendamento-2', ...dados };
    });
    enviarEmail.mockImplementation(async () => {
      eventos.push('email-enviado');
      return { success: true };
    });
    navigate.mockImplementation(() => {
      eventos.push('confirmacao-de-sucesso');
    });
  });

  it('cria o agendamento a partir da tela e confirma o sucesso', async () => {
    const user = userEvent.setup();

    renderizarFormulario();
    await preencherAteOHorario(user);
    await user.click(botaoSalvar());

    await vi.waitFor(() => expect(criarAgendamento).toHaveBeenCalledTimes(1));
    expect(criarAgendamento).toHaveBeenCalledWith(
      expect.objectContaining({
        patient_id: 'paciente-1',
        doctor_id: 'medico-1',
        date: horaLocal(PROXIMA_SEGUNDA, 10, 0).toISOString(),
        duration: DURACAO_PADRAO,
        type: 'primeira_consulta',
        status: 'agendado',
      }),
    );
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/Appointments'));
  });

  it('libera o salvamento apenas com paciente, médico e data', async () => {
    const user = userEvent.setup();

    renderizarFormulario();
    expect(botaoSalvar()).toBeDisabled();

    await user.selectOptions(seletorComOpcao('Ana Souza'), 'paciente-1');
    expect(botaoSalvar()).toBeDisabled();

    await user.selectOptions(seletorComOpcao('Dra. Helena Prado'), 'medico-1');
    expect(botaoSalvar()).toBeDisabled();

    // O cartão de data e horário só existe depois do médico escolhido: é ele que abre o
    // calendário, e escolher o dia sozinho ainda não informa horário algum.
    await user.click(screen.getByRole('button', { name: 'Escolher próxima segunda' }));
    expect(botaoSalvar()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '10:00' }));
    // Chegar ao estado liberado não grava nada: o salvamento é ato do clique.
    expect(botaoSalvar()).toBeEnabled();
    expect(criarAgendamento).not.toHaveBeenCalled();
  });

  it('não revalida a jornada ao salvar: grava o horário sob um dia sem atendimento', async () => {
    const user = userEvent.setup();

    renderizarFormulario();
    await preencherAteOHorario(user);

    // A tela passa a mostrar o sábado, dia fora da jornada do médico...
    await user.click(screen.getByRole('button', { name: 'Escolher próximo sábado' }));
    expect(screen.getByText('Médico não atende neste dia')).toBeInTheDocument();

    // ...e, ainda assim, o salvamento continua liberado com o horário da segunda-feira
    // que ficou guardado. O portão do botão é só paciente + médico + data preenchida.
    expect(botaoSalvar()).toBeEnabled();
    await user.click(botaoSalvar());

    await vi.waitFor(() => expect(criarAgendamento).toHaveBeenCalledTimes(1));
    expect(criarAgendamento).toHaveBeenCalledWith(
      expect.objectContaining({
        doctor_id: 'medico-1',
        date: horaLocal(PROXIMA_SEGUNDA, 10, 0).toISOString(),
      }),
    );
    // A gravação foi aceita: o usuário recebe a confirmação e sai da tela.
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/Appointments'));
  });

  it('não revalida conflito ao salvar: grava o horário que a tela marca como ocupado', async () => {
    const user = userEvent.setup();
    armazem.medicos.push(
      medico({ id: 'medico-2', full_name: 'Dr. Otávio Ramos', specialty: 'Cardiologia' }),
    );
    // O segundo médico já tem consulta às 10:00 da próxima segunda-feira.
    conflitos['medico-2'] = [
      agendamento({
        id: 'agendamento-2',
        doctor_id: 'medico-2',
        date: horaLocal(PROXIMA_SEGUNDA, 10, 0).toISOString(),
      }),
    ];

    renderizarFormulario();
    await user.selectOptions(seletorComOpcao('Ana Souza'), 'paciente-1');
    await user.selectOptions(seletorComOpcao('Dra. Helena Prado'), 'medico-1');
    await user.click(screen.getByRole('button', { name: 'Escolher próxima segunda' }));
    await user.click(screen.getByRole('button', { name: '10:00' }));

    // Trocar de médico não descarta o horário escolhido: ele passa a apontar para o
    // horário que o novo médico já tem ocupado — e a própria tela o desabilita.
    await user.selectOptions(seletorComOpcao('Dr. Otávio Ramos'), 'medico-2');
    expect(screen.getByRole('button', { name: '10:00' })).toBeDisabled();

    // Mesmo assim o salvamento segue liberado, e o conflito é gravado como escolhido.
    expect(botaoSalvar()).toBeEnabled();
    await user.click(botaoSalvar());

    await vi.waitFor(() => expect(criarAgendamento).toHaveBeenCalledTimes(1));
    expect(criarAgendamento).toHaveBeenCalledWith(
      expect.objectContaining({
        doctor_id: 'medico-2',
        date: horaLocal(PROXIMA_SEGUNDA, 10, 0).toISOString(),
      }),
    );
  });

  it('envia o e-mail antes de confirmar o sucesso da gravação', async () => {
    const user = userEvent.setup();

    renderizarFormulario();
    await preencherAteOHorario(user);
    await user.click(botaoSalvar());

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/Appointments'));
    // A ordem é a prova: a confirmação de sucesso (a navegação que o usuário vê) só
    // acontece DEPOIS do envio do e-mail. Se o e-mail não sai, ela não acontece.
    expect(eventos).toEqual(['gravacao-aceita', 'email-enviado', 'confirmacao-de-sucesso']);
    expect(enviarEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@exemplo.test',
        subject: 'Confirmação de Agendamento',
      }),
    );
  });

  it('mantém o agendamento gravado e não confirma sucesso quando o e-mail falha', async () => {
    const user = userEvent.setup();
    enviarEmail.mockImplementation(async () => {
      eventos.push('email-enviado');
      throw new Error('Servidor de e-mail indisponível');
    });

    renderizarFormulario();
    await preencherAteOHorario(user);
    await user.click(botaoSalvar());

    await vi.waitFor(() => expect(enviarEmail).toHaveBeenCalledTimes(1));

    // O pedido de gravação já tinha sido aceito antes do e-mail: o agendamento ficou
    // gravado, e nada o desfaz.
    expect(criarAgendamento).toHaveBeenCalledTimes(1);
    expect(eventos).toEqual(['gravacao-aceita', 'email-enviado']);

    // E o usuário não recebe confirmação alguma: fica no formulário, preenchido, sem
    // aviso nenhum — a tela não trata esse erro.
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Novo Agendamento' })).toBeInTheDocument();
    expect(botaoSalvar()).toBeEnabled();
  });
});
