import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewConsultation from '../NewConsultation';
import {
  ROTULO_DA_SITUACAO,
  SITUACOES,
  consulta,
  consultaSemSituacao,
  paciente,
} from '@/test/consultationsFixtures';
import type { Consultation, Patient } from '@/types';
import type { ReactNode } from 'react';

/**
 * Prova de TELA do formulário de consulta em `NewConsultation`.
 *
 * O QUE SE MEDE AQUI: a situação inicial da consulta, a troca de situação, o conjunto de
 * situações oferecido, o portão do salvamento e a ausência do envio acidental.
 *
 * DUAS RESSALVAS DECLARADAS, e as duas importam para não ler cobertura onde não há:
 *
 * 1. **O seletor é dublado** (decisão D-03). O seletor real monta as opções num portal e
 *    levava o `userEvent` a estourar o tempo limite no DOM simulado. O que se mede é o que
 *    a **tela** decide oferecer, não o que o componente de interface desenha.
 * 2. **A metade do schema não é provável aqui** (decisão D-06). O default `agendada` é
 *    aplicado pelo servidor. O que o cliente mostra é o oposto: o formulário grava
 *    `em_andamento` e o modo edição cai em `em_andamento` quando o registro não tem
 *    situação. As duas metades observáveis são provadas; a do schema é **declarada**.
 */

const {
  armazem,
  criarLog,
  criarConsulta,
  atualizarConsulta,
  navegar,
} = vi.hoisted(() => ({
  armazem: {
    pacientes: [] as Patient[],
    consultas: [] as Consultation[],
  },
  criarLog: vi.fn(),
  criarConsulta: vi.fn(),
  atualizarConsulta: vi.fn(),
  navegar: vi.fn(),
}));

/** Mesmos dublês de `PatientDetail.test.tsx`, aplicados ao formulário de consulta. */
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'demo-user-001',
        email: 'demo@medrecord.local',
      }),
    },
    entities: {
      Patient: { filterOwned: vi.fn(), filterAsAdmin: vi.fn() },
      Consultation: {
        filterOwned: vi.fn(),
        filterAsAdmin: vi.fn(),
        create: criarConsulta,
        update: atualizarConsulta,
      },
      AccessLog: { asUser: () => ({ create: criarLog }) },
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
 * ⚠️ AS LISTAS SÃO DEVOLVIDAS POR IDENTIDADE, e não recriadas a cada chamada. O formulário
 * tem `existingConsultation` nas dependências de um efeito que chama `setFormData`; um
 * array novo a cada render faria o efeito rodar para sempre, travando o processo antes de
 * qualquer limite de tempo poder disparar. As listas vivem no armazém justamente para que
 * a identidade seja estável entre renderizações.
 */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: unknown[] }) => {
    const colecao = options.queryKey[0];
    if (colecao === 'patients') return { data: armazem.pacientes, isLoading: false };
    if (colecao === 'consultation') return { data: armazem.consultas, isLoading: false };
    return { data: [], isLoading: false };
  },
  useMutation: (options: {
    mutationFn: (dados: unknown) => Promise<unknown>;
    onSuccess?: () => void;
    onError?: (erro: unknown) => void;
  }) => ({
    mutate: (dados: unknown) => {
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
  return { ...actual, useNavigate: () => navegar };
});

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

const ID_DA_CONSULTA = 'consulta-1';
const DATA_DE_PROVA = '2026-09-21T12:00:00.000Z';

function renderizarFormulario() {
  return render(
    <MemoryRouter>
      <NewConsultation />
    </MemoryRouter>,
  );
}

/** O único seletor do formulário é o de situação — os sinais vitais são só campos. */
function seletorDeSituacao(): HTMLSelectElement {
  const encontrados = screen.getAllByRole('combobox') as HTMLSelectElement[];
  expect(encontrados).toHaveLength(1);
  return encontrados[0];
}

function botaoSalvar() {
  return screen.getByRole('button', { name: /Salvar Consulta/i });
}

function campoDeData(container: HTMLElement): HTMLInputElement {
  const campo = container.querySelector<HTMLInputElement>('input[type="datetime-local"]');
  if (!campo) throw new Error('campo de data e hora não encontrado');
  return campo;
}

/** Escolhe o paciente pela busca, como o usuário faz. */
async function escolherPaciente(user: User, nome = 'Ana Souza') {
  await user.type(screen.getByPlaceholderText('Buscar paciente por nome ou CPF...'), nome);
  await user.click(await screen.findByRole('button', { name: new RegExp(nome) }));
}

describe('NewConsultation — situação inicial e situações oferecidas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.pacientes.length = 0;
    armazem.consultas.length = 0;
    armazem.pacientes.push(paciente());
    criarConsulta.mockImplementation(async (dados: Record<string, unknown>) => ({
      id: 'consulta-2',
      created_date: DATA_DE_PROVA,
      ...dados,
    }));
    window.history.replaceState({}, '', '/NewConsultation');
  });

  it('a consulta criada pelo formulário nasce em andamento, e não agendada', async () => {
    const user = userEvent.setup();
    renderizarFormulario();
    await escolherPaciente(user);

    await user.click(botaoSalvar());

    await vi.waitFor(() => expect(criarConsulta).toHaveBeenCalledTimes(1));
    // O valor gravado é `em_andamento`, e não o `agendada` que o cenário PT-005.1 afirma e
    // que o schema documenta. É o comportamento real do código, provado como está.
    expect(criarConsulta).toHaveBeenCalledWith(
      expect.objectContaining({
        patient_id: 'paciente-1',
        status: 'em_andamento',
      }),
    );
  });

  it('editando um registro sem situação, o formulário cai em em_andamento', async () => {
    armazem.consultas.push(consultaSemSituacao({ id: ID_DA_CONSULTA }));
    window.history.replaceState({}, '', `/NewConsultation?id=${ID_DA_CONSULTA}`);
    renderizarFormulario();

    await vi.waitFor(() => expect(seletorDeSituacao()).toHaveValue('em_andamento'));
    // Segunda manifestação da MESMA divergência: o fallback do cliente para um registro
    // sem situação também é `em_andamento`, e não o `agendada` do schema.
    expect(seletorDeSituacao()).toHaveValue('em_andamento');
  });

  it('o seletor oferece as quatro situações do enum, sem exceção', async () => {
    armazem.consultas.push(consulta({ id: ID_DA_CONSULTA, status: 'cancelada' }));
    window.history.replaceState({}, '', `/NewConsultation?id=${ID_DA_CONSULTA}`);
    renderizarFormulario();

    await vi.waitFor(() => expect(seletorDeSituacao()).toHaveValue('cancelada'));

    // A consulta está CANCELADA e, ainda assim, as quatro situações são oferecidas. Não há
    // guarda de transição: "concluida" consta da lista, e o cenário PT-005.3 afirma o
    // contrário. A prova registra o comportamento real.
    const valores = Array.from(seletorDeSituacao().options).map((o) => o.value);
    expect(valores).toEqual([...SITUACOES]);

    const rotulos = Array.from(seletorDeSituacao().options).map((o) => o.textContent);
    expect(rotulos).toEqual(SITUACOES.map((s) => ROTULO_DA_SITUACAO[s]));
    expect(rotulos).toContain(ROTULO_DA_SITUACAO.concluida);
  });
});

describe('NewConsultation — troca de situação persistida', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.pacientes.length = 0;
    armazem.consultas.length = 0;
    armazem.pacientes.push(paciente());
    armazem.consultas.push(consulta({ id: ID_DA_CONSULTA, status: 'em_andamento' }));
    atualizarConsulta.mockImplementation(async (id: string, alteracoes: Record<string, unknown>) => ({
      id,
      ...alteracoes,
    }));
    window.history.replaceState({}, '', `/NewConsultation?id=${ID_DA_CONSULTA}`);
  });

  it('escolher concluída e salvar persiste o novo valor', async () => {
    const user = userEvent.setup();
    renderizarFormulario();

    await vi.waitFor(() => expect(seletorDeSituacao()).toHaveValue('em_andamento'));

    await user.selectOptions(seletorDeSituacao(), 'concluida');
    expect(seletorDeSituacao()).toHaveValue('concluida');

    await user.click(botaoSalvar());

    await vi.waitFor(() => expect(atualizarConsulta).toHaveBeenCalledTimes(1));
    expect(atualizarConsulta).toHaveBeenCalledWith(
      ID_DA_CONSULTA,
      expect.objectContaining({ status: 'concluida' }),
    );
  });
});

describe('NewConsultation — portão do salvamento e envio acidental', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.pacientes.length = 0;
    armazem.consultas.length = 0;
    armazem.pacientes.push(paciente());
    criarConsulta.mockImplementation(async (dados: Record<string, unknown>) => ({
      id: 'consulta-2',
      created_date: DATA_DE_PROVA,
      ...dados,
    }));
    window.history.replaceState({}, '', '/NewConsultation');
  });

  it('o portão exige paciente, e o campo de data é obrigatório no próprio controle', async () => {
    const user = userEvent.setup();
    const { container } = renderizarFormulario();

    expect(botaoSalvar()).toBeDisabled();

    await escolherPaciente(user);
    expect(botaoSalvar()).toBeEnabled();

    // O PORTÃO em JavaScript olha apenas o paciente — é o que o `disabled` afirma. Mas o
    // campo de data carrega `required` no próprio controle, e é o navegador que barra o
    // envio sem ele. As duas coisas são verdadeiras ao mesmo tempo, e a prova registra as
    // duas: afirmar só a primeira faria parecer que o formulário aceita consulta sem data.
    //
    // NÃO SE TESTA o envio com a data apagada de propósito: o DOM simulado não implementa
    // a validação de restrição do navegador, então o envio passaria aqui e não passaria
    // num navegador de verdade. Uma verificação assim mediria a limitação do ambiente.
    expect(campoDeData(container)).toHaveAttribute('required');
    expect(campoDeData(container)).not.toHaveValue('');
  });

  it('nenhum controle interno grava antes do salvamento deliberado', async () => {
    const user = userEvent.setup();
    const { container } = renderizarFormulario();

    // Percorre os controles internos que poderiam disparar envio se não declarassem o
    // próprio tipo: a busca de paciente, o resultado da busca, o seletor de situação e os
    // campos de texto. Nenhum deles pode gravar.
    await escolherPaciente(user);
    await user.selectOptions(seletorDeSituacao(), 'concluida');
    await user.type(screen.getByPlaceholderText('Descreva a queixa principal do paciente...'), 'Cefaleia');
    // O campo de data é alterado por evento direto, e não por digitação: `user.type` num
    // `datetime-local` faz o `userEvent` escrever componente a componente e travar no DOM
    // simulado. O que a promessa pede é que ALTERAR o controle não grave — e o evento
    // direto altera o controle do mesmo jeito.
    fireEvent.change(campoDeData(container), { target: { value: '2026-09-21T09:00' } });
    expect(campoDeData(container)).toHaveValue('2026-09-21T09:00');

    expect(criarConsulta).not.toHaveBeenCalled();

    // O salvamento deliberado é ato do clique, e acontece UMA vez. A contagem é o que
    // impede o placebo: uma verificação que nunca chegasse a gravar falharia aqui.
    await user.click(botaoSalvar());
    await vi.waitFor(() => expect(criarConsulta).toHaveBeenCalledTimes(1));
    expect(criarConsulta).toHaveBeenCalledTimes(1);
  });

  it('o botão de cancelar não grava nem salva', async () => {
    const user = userEvent.setup();
    renderizarFormulario();
    await escolherPaciente(user);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(criarConsulta).not.toHaveBeenCalled();
    expect(navegar).toHaveBeenCalled();
  });
});
