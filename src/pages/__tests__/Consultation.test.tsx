import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Consultation from '../Consultation';
import {
  ROTULO_DA_SITUACAO,
  SITUACOES,
  consulta,
  consultaSemSituacao,
  paciente,
} from '@/test/consultationsFixtures';
import type { Consultation as Consulta, Exam, Patient, Prescription } from '@/types';
import type { ReactNode } from 'react';

/**
 * Prova de TELA do detalhe da consulta em `Consultation`.
 *
 * TRÊS PROMESSAS VIVEM AQUI, e as três são sobre o que o usuário vê depois de agir:
 *
 * 1. A legenda de situação — inclusive a **ausência** dela, quando o registro não tem
 *    situação.
 * 2. A ausência de transição automática: emitir documento ou anexar exame **não** move a
 *    situação. A afirmação é sobre o VALOR exibido depois, e nunca sobre a ausência de
 *    chamadas — asserção negativa passa mesmo quando a verificação não exercita o caminho
 *    certo (decisão D-12 do roadmap).
 * 3. A **assimetria de auditoria** (decisão D-02): emitir documento não grava trilha e
 *    anexar exame grava.
 *
 * SOBRE A AUDITORIA — O MÓDULO NÃO É DUBLADO DE PROPÓSITO. `AccessLogger` corre de
 * verdade; o que é substituído é o **transporte**, `base44.entities.AccessLog`. A
 * diferença é a que separa provar o encanamento de provar uma imitação dele: se a
 * verificação trocasse o `logAccess`, mediria a própria substituição e o defeito
 * continuaria invisível — que é exatamente como ele passou despercebido até agora.
 *
 * E O OBSERVADOR É PROVADO ANTES DE SER USADO. O carregamento da tela já grava
 * `view_consultation`. A verificação confirma que essa gravação aconteceu, zera a
 * contagem, e só então mede os dois fluxos. Sem esse passo, "não gravou" seria
 * indistinguível de "a espiã está quebrada".
 *
 * SOBRE OS DIÁLOGOS — SÃO OS REAIS. O `ExamUploader` **não pode** ser dublado: a
 * gravação de auditoria do exame vive dentro dele. O `PrescriptionEditor` também é o
 * real, para que os dois fluxos percorram o mesmo caminho que o usuário percorre.
 */

const {
  armazem,
  criarLog,
  criarPrescricao,
  criarExame,
  enviarArquivo,
  navegar,
} = vi.hoisted(() => ({
  armazem: {
    consulta: null as Consulta | null,
    paciente: null as Patient | null,
    prescricoes: [] as Prescription[],
    exames: [] as Exam[],
  },
  criarLog: vi.fn(),
  criarPrescricao: vi.fn(),
  criarExame: vi.fn(),
  enviarArquivo: vi.fn(),
  navegar: vi.fn(),
}));

/** Mesmos dublês de `PatientDetail.test.tsx`, aplicados ao detalhe da consulta. */
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'demo-user-001',
        email: 'demo@medrecord.local',
      }),
    },
    entities: {
      Consultation: { filterOwned: vi.fn(), filterAsAdmin: vi.fn() },
      Patient: { filterOwned: vi.fn(), filterAsAdmin: vi.fn() },
      Prescription: { filterOwned: vi.fn(), filterAsAdmin: vi.fn(), create: criarPrescricao },
      Exam: { filterOwned: vi.fn(), filterAsAdmin: vi.fn(), create: criarExame },
      // O TRANSPORTE da auditoria é o que se substitui — nunca o módulo `AccessLogger`.
      AccessLog: { asUser: () => ({ create: criarLog }) },
      Template: { filter: vi.fn().mockResolvedValue([]) },
    },
    integrations: {
      Core: { UploadFile: enviarArquivo },
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
 * Dublê das leituras e das gravações. As leituras saem do armazém e a gravação é aplicada
 * a ele, para que a persistência possa ser lida de VOLTA pela tela — sem isso, a única
 * evidência possível seria o formato da chamada, que não é o que o usuário vê.
 */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: unknown[] }) => {
    const colecao = options.queryKey[0];
    if (colecao === 'consultation') return { data: armazem.consulta ? [armazem.consulta] : [] };
    if (colecao === 'patient') return { data: armazem.paciente ? [armazem.paciente] : [] };
    if (colecao === 'prescriptions') return { data: armazem.prescricoes };
    if (colecao === 'exams') return { data: armazem.exames };
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

/**
 * Dublê do módulo de seleção, no padrão de `PatientForm.test.tsx`. O seletor real monta
 * as opções num portal e o `userEvent` estourava o tempo limite ao abri-lo no DOM
 * simulado (66 s até o limite, na feature 002).
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

const ID_DA_CONSULTA = 'consulta-1';

/**
 * Data de criação dos registros que a prova grava.
 *
 * `created_date` é campo de `BaseEntity` e o backend sempre o preenche — a seção
 * "Documentos Emitidos" da tela o formata, e um registro sem ele quebraria a renderização
 * com `Invalid time value`. A massa o informa para que o dublê espelhe o contrato real em
 * vez de produzir um registro que o servidor nunca produziria.
 */
const DATA_DE_PROVA = '2026-09-21T12:00:00.000Z';

function renderizarDetalhe() {
  return render(
    <MemoryRouter>
      <Consultation />
    </MemoryRouter>,
  );
}

/** Abre um diálogo pelo botão que o oferece e devolve o diálogo montado. */
async function abrirDialogo(user: User, nomeDoBotao: string) {
  await user.click(screen.getByRole('button', { name: nomeDoBotao }));
  return screen.findByRole('dialog');
}

/** Aguarda o diálogo sumir — é o que `onOpenChange(false)` produz depois de salvar. */
async function aguardarFechamento() {
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}

/** A legenda de situação exibida no cabeçalho, ou `null` quando não há nenhuma. */
function legendaExibida(): string | null {
  const encontrado = SITUACOES.map((s) => ROTULO_DA_SITUACAO[s]).find((rotulo) =>
    screen.queryByText(rotulo) !== null,
  );
  return encontrado ?? null;
}

/**
 * Zera a contagem da espiã de auditoria depois de provar que ela disparou no
 * carregamento. Sem esse passo, "não gravou" seria indistinguível de "espiã quebrada".
 */
async function espiarAuditoriaComObservadorProvado() {
  await waitFor(() => expect(criarLog).toHaveBeenCalled());
  expect(criarLog).toHaveBeenCalledWith(
    expect.objectContaining({ action: 'view_consultation' }),
  );
  criarLog.mockClear();
  criarPrescricao.mockClear();
  criarExame.mockClear();
}

describe('Consultation — legenda de situação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.consulta = consulta({ id: ID_DA_CONSULTA, status: 'em_andamento' });
    armazem.paciente = paciente();
    armazem.prescricoes.length = 0;
    armazem.exames.length = 0;
    window.history.replaceState({}, '', `/Consultation?id=${ID_DA_CONSULTA}`);
  });

  it('mostra o rótulo da situação gravada no cabeçalho', async () => {
    renderizarDetalhe();

    expect(await screen.findByRole('heading', { name: 'Consulta' })).toBeInTheDocument();
    expect(legendaExibida()).toBe('Em Andamento');
  });

  it('registro sem situação não exibe legenda nenhuma, e a tela não quebra', async () => {
    armazem.consulta = consultaSemSituacao({ id: ID_DA_CONSULTA });
    renderizarDetalhe();

    // A tela renderiza normalmente...
    expect(await screen.findByRole('heading', { name: 'Consulta' })).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();

    // ...e nenhuma das quatro legendas aparece: a ausência é preservada em vez de virar
    // um rótulo inventado ou um erro.
    expect(legendaExibida()).toBeNull();
  });
});

describe('Consultation — ausência de transição automática', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.consulta = consulta({ id: ID_DA_CONSULTA, status: 'em_andamento' });
    armazem.paciente = paciente();
    armazem.prescricoes.length = 0;
    armazem.exames.length = 0;
    criarPrescricao.mockImplementation(async (dados: Record<string, unknown>) => {
      armazem.prescricoes.push({ id: 'prescricao-1', created_date: DATA_DE_PROVA, ...dados } as unknown as Prescription);
      return { id: 'prescricao-1', ...dados };
    });
    criarExame.mockImplementation(async (dados: Record<string, unknown>) => {
      armazem.exames.push({ id: 'exame-1', created_date: DATA_DE_PROVA, ...dados } as unknown as Exam);
      return { id: 'exame-1', ...dados };
    });
    enviarArquivo.mockResolvedValue({ file_url: 'https://exemplo.test/exame.pdf' });
    window.history.replaceState({}, '', `/Consultation?id=${ID_DA_CONSULTA}`);
  });

  it('emitir um documento mantém a situação anterior', async () => {
    const user = userEvent.setup();
    renderizarDetalhe();
    expect(legendaExibida()).toBe('Em Andamento');

    const dialogo = await abrirDialogo(user, 'Nova Receita');
    await user.click(within(dialogo).getByRole('button', { name: /^Salvar$/ }));
    await aguardarFechamento();

    await waitFor(() => expect(criarPrescricao).toHaveBeenCalledTimes(1));
    // O documento foi emitido — e a situação continua a MESMA. É o valor exibido que se
    // afirma, não a ausência de uma chamada.
    expect(legendaExibida()).toBe('Em Andamento');
  });

  it('anexar um exame mantém a situação anterior', async () => {
    const user = userEvent.setup();
    renderizarDetalhe();
    expect(legendaExibida()).toBe('Em Andamento');

    const dialogo = await abrirDialogo(user, 'Exame');
    await anexarExame(user, dialogo);
    await aguardarFechamento();

    await waitFor(() => expect(criarExame).toHaveBeenCalledTimes(1));
    expect(legendaExibida()).toBe('Em Andamento');
  });
});

/**
 * Anexa um exame no diálogo real.
 *
 * O campo de arquivo é escondido e aberto por `document.getElementById('exam-file').click()`
 * — o seletor nativo do sistema, que o DOM simulado não tem. Por isso o arquivo é entregue
 * ao campo pelo evento de mudança, mantendo o resto da interação pelo `userEvent`.
 *
 * O arquivo é um PDF, e não uma imagem, para que o caminho de leitura de imagem
 * (`FileReader`) não seja exercitado: ele não é objeto desta promessa.
 */
async function anexarExame(user: User, dialogo: HTMLElement) {
  const campoDeArquivo = dialogo.querySelector<HTMLInputElement>('#exam-file');
  if (!campoDeArquivo) throw new Error('campo de arquivo do exame não encontrado');

  const arquivo = new File(['conteúdo de prova'], 'hemograma.pdf', { type: 'application/pdf' });
  fireEvent.change(campoDeArquivo, { target: { files: [arquivo] } });

  await user.type(
    within(dialogo).getByPlaceholderText('Ex: Hemograma Completo'),
    'Hemograma Completo',
  );
  await user.click(within(dialogo).getByRole('button', { name: /Salvar Exame/i }));
}

describe('Consultation — assimetria de auditoria', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armazem.consulta = consulta({ id: ID_DA_CONSULTA, status: 'em_andamento' });
    armazem.paciente = paciente();
    armazem.prescricoes.length = 0;
    armazem.exames.length = 0;
    criarPrescricao.mockImplementation(async (dados: Record<string, unknown>) => {
      armazem.prescricoes.push({ id: 'prescricao-1', created_date: DATA_DE_PROVA, ...dados } as unknown as Prescription);
      return { id: 'prescricao-1', ...dados };
    });
    criarExame.mockImplementation(async (dados: Record<string, unknown>) => {
      armazem.exames.push({ id: 'exame-1', created_date: DATA_DE_PROVA, ...dados } as unknown as Exam);
      return { id: 'exame-1', ...dados };
    });
    enviarArquivo.mockResolvedValue({ file_url: 'https://exemplo.test/exame.pdf' });
    window.history.replaceState({}, '', `/Consultation?id=${ID_DA_CONSULTA}`);
  });

  it('o carregamento da tela grava a trilha — o observador funciona', async () => {
    renderizarDetalhe();

    await waitFor(() => expect(criarLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'view_consultation', entity_type: 'Consultation' }),
    ));
    // Quantas vezes a trilha dispara no carregamento não é a promessa; o que importa é
    // que ela é capaz de disparar. Esta verificação existe para sustentar as duas
    // seguintes: sem ela, uma espiã quebrada faria "não gravou" passar por prova.
    expect(criarLog.mock.calls.length).toBeGreaterThan(0);
  });

  it('emitir um documento NÃO grava trilha de auditoria', async () => {
    const user = userEvent.setup();
    renderizarDetalhe();
    await espiarAuditoriaComObservadorProvado();

    const dialogo = await abrirDialogo(user, 'Nova Receita');
    await user.click(within(dialogo).getByRole('button', { name: /^Salvar$/ }));
    await aguardarFechamento();

    // A prescrição FOI criada — a ausência de trilha não é ausência de operação.
    await waitFor(() => expect(criarPrescricao).toHaveBeenCalledTimes(1));
    expect(criarLog).not.toHaveBeenCalled();
  });

  it('anexar um exame GRAVA trilha de auditoria com a ação própria', async () => {
    const user = userEvent.setup();
    renderizarDetalhe();
    await espiarAuditoriaComObservadorProvado();

    const dialogo = await abrirDialogo(user, 'Exame');
    await anexarExame(user, dialogo);
    await aguardarFechamento();

    await waitFor(() => expect(criarExame).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(criarLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'upload_exam', entity_type: 'Exam' }),
      ),
    );
  });

  it('os dois fluxos, na mesma sessão: um grava e o outro não', async () => {
    const user = userEvent.setup();
    renderizarDetalhe();
    await espiarAuditoriaComObservadorProvado();

    // Documento: nenhuma trilha.
    const dialogoDocumento = await abrirDialogo(user, 'Nova Receita');
    await user.click(within(dialogoDocumento).getByRole('button', { name: /^Salvar$/ }));
    await aguardarFechamento();
    await waitFor(() => expect(criarPrescricao).toHaveBeenCalledTimes(1));
    expect(criarLog).not.toHaveBeenCalled();

    // Exame: trilha. É esta metade que impede a verificação de passar por espiã quebrada.
    const dialogoExame = await abrirDialogo(user, 'Exame');
    await anexarExame(user, dialogoExame);
    await aguardarFechamento();
    await waitFor(() => expect(criarExame).toHaveBeenCalledTimes(1));

    const acoes = criarLog.mock.calls.map(
      ([registro]) => (registro as { action?: string }).action,
    );
    expect(acoes).toContain('upload_exam');
    expect(acoes).not.toContain('create_prescription');
  });
});
