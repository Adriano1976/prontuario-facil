import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PrescriptionEditor from '../PrescriptionEditor';
import type { PrescriptionInitialData, PrescriptionPayload } from '../PrescriptionEditor';
import {
  CPF_DO_PACIENTE,
  DATA_CURTA,
  DATA_POR_EXTENSO,
  DIA_DE_PROVA,
  MARCACAO_ESCAPADA,
  MARCACAO_LITERAL,
  MARCADOR_DE_AFASTAMENTO,
  MODELO_ATESTADO,
  MODELO_COM_AFASTAMENTO,
  MODELO_COM_MARCACAO,
  MODELO_COM_VARIAVEIS,
  MODELO_INATIVO,
  MODELO_RECEITA,
  NOME_DO_PACIENTE,
  TIPOS_DE_DOCUMENTO,
  TIPOS_DE_RECEITA,
  TIPOS_SEM_RECEITA,
  horaLocal,
  paciente,
  pacienteSemCpf,
} from '@/test/templateFixtures';
import type { MockInstance } from 'vitest';
import type { PrescriptionType, Template } from '@/types';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Prova de COMPONENTE da emissão de documento com modelo em `PrescriptionEditor`.
 *
 * O QUE SE MEDE AQUI: os quatro cenários de `PT-006` e os achados laterais. A prova ancora
 * no componente, e não nas telas que o montam (`Consultation`, `PatientDetail`) — o
 * encanamento a partir delas não é coberto aqui (decisão D-01, §4.1 do roadmap).
 *
 * QUATRO RESSALVAS DECLARADAS, e todas importam para não ler cobertura onde não há:
 *
 * 1. **O seletor é dublado** (padrão firmado na feature 002). O seletor real monta as opções
 *    num portal e levava o `userEvent` a estourar o tempo limite no DOM simulado. O que se
 *    mede é o que a **tela** decide oferecer, não o que o componente de interface desenha.
 * 2. **O filtro de modelos é predicado do SERVIDOR** (decisão D-06). O cliente envia
 *    `{ type, is_active: true }` e consome o resultado sem re-filtrar. A prova cobre o
 *    **pedido**, e a verificação de re-filtro existe justamente para tornar a ressalva
 *    visível: sem ela, o verde de `PT-006.2` e `PT-006.4` sugeriria cobertura que não há.
 * 3. **O `jsdom` não implementa `window.open`** (decisão D-05). Ele registra
 *    "Not implemented" e devolve `null`, e o `handlePrint` sai pela guarda
 *    `if (!printWindow) return`. Sem o duplo, o caminho de impressão é **inalcançável** e a
 *    verificação ficaria verde sem exercitar uma linha. Há uma verificação negativa
 *    dedicada a demonstrar exatamente isso.
 * 4. **AMB-006 é preservação deliberada, não expectativa de produto.** As asserções de
 *    marcação literal **travam a paridade**: no dia em que alguém corrigir a substituição ou
 *    a impressão, estas verificações falham — e quem corrigir precisa mudar a prova de
 *    propósito (decisão D-08). O risco é documentado, não corrigido.
 */

const { armazem, filtroDeModelos, aoSalvar, aoMudarAbertura } = vi.hoisted(() => ({
  armazem: { modelos: [] as Template[] },
  filtroDeModelos: vi.fn(),
  aoSalvar: vi.fn(),
  aoMudarAbertura: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      Template: { filter: filtroDeModelos },
    },
  },
}));

/**
 * Dublê da consulta de modelos.
 *
 * ⚠️ ELE CHAMA a função de consulta: é a única coisa que o cliente faz de fato, e sem
 * chamá-la o pedido não seria observável (RF-04, RF-05). O que é devolvido é o conteúdo do
 * armazém, **por identidade** — um array novo a cada renderização travaria o processo quando
 * a tela colocasse esse array na dependência de um efeito que chama `setState`, que é a
 * armadilha registrada na feature 004.
 */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opcoes: { queryKey: unknown[]; queryFn?: () => unknown }) => {
    void opcoes.queryFn?.();
    return { data: armazem.modelos, isLoading: false };
  },
}));

/**
 * Dublê dos seletores, no padrão já adotado em `PatientForm.test.tsx`,
 * `Appointments.test.tsx` e `NewConsultation.test.tsx`.
 *
 * O editor tem **dois** seletores — o de tipo de documento e o de modelo — e o dublê não
 * recebe rótulo nenhum para distingui-los. Por isso eles são acessados por **índice**, na
 * ordem em que o componente os declara, e cada acesso afirma que existem exatamente dois.
 * Se a ordem mudar, a verificação falha com a contagem errada em vez de medir o seletor
 * errado em silêncio.
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
    <select value={value} onChange={(evento) => onValueChange(evento.target.value)}>
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
 * Dados iniciais estáveis, por necessidade e não por estilo.
 *
 * O componente tem `initialData` nas dependências de um efeito que chama `setFormData` e
 * `setMedications`. Um objeto literal criado dentro do `render` seria uma identidade nova a
 * cada renderização, o efeito rodaria de novo, `setMedications` receberia um array novo e o
 * processo travaria antes de qualquer limite de tempo poder disparar.
 */
const CONTEUDO_INICIAL = 'Texto que já estava no documento.';
const DADOS_INICIAIS: PrescriptionInitialData = {
  type: 'receita_simples',
  content: CONTEUDO_INICIAL,
  medications: [],
  notes: '',
};

function renderizarEditor(
  propriedades: Partial<ComponentProps<typeof PrescriptionEditor>> = {},
) {
  return render(
    <PrescriptionEditor
      open
      onOpenChange={aoMudarAbertura}
      patient={paciente()}
      consultationId="consulta-1"
      onSave={aoSalvar}
      {...propriedades}
    />,
  );
}

/**
 * Espera os dois seletores aparecerem. O diálogo real monta o conteúdo num portal, então a
 * primeira consulta ao DOM é assíncrona; as demais podem ser síncronas.
 */
async function esperarSeletores(): Promise<void> {
  const todos = await screen.findAllByRole('combobox');
  expect(todos).toHaveLength(2);
}

function seletores(): HTMLSelectElement[] {
  return screen.getAllByRole('combobox') as HTMLSelectElement[];
}

/** O seletor de tipo é o primeiro declarado no componente. */
function seletorDeTipo(): HTMLSelectElement {
  const todos = seletores();
  expect(todos).toHaveLength(2);
  return todos[0];
}

/** O seletor de modelo é o segundo declarado no componente. */
function seletorDeModelo(): HTMLSelectElement {
  const todos = seletores();
  expect(todos).toHaveLength(2);
  return todos[1];
}

function campoDeConteudo(): HTMLTextAreaElement {
  return screen.getByPlaceholderText(
    'Digite o conteúdo do documento...',
  ) as HTMLTextAreaElement;
}

function campoDeAfastamento(): HTMLInputElement {
  return screen.getByPlaceholderText('Ex: 3') as HTMLInputElement;
}

function botaoSalvar(): HTMLElement {
  return screen.getByRole('button', { name: /Salvar/ });
}

function botaoImprimir(): HTMLElement {
  return screen.getByRole('button', { name: /Imprimir/ });
}

function botaoAdicionar(): HTMLElement {
  return screen.getByRole('button', { name: /Adicionar/ });
}

async function escolherTipo(user: User, tipo: PrescriptionType): Promise<void> {
  await user.selectOptions(seletorDeTipo(), tipo);
  expect(seletorDeTipo()).toHaveValue(tipo);
}

async function aplicarModelo(user: User, id: string): Promise<void> {
  await user.selectOptions(seletorDeModelo(), id);
}

async function adicionarMedicamento(user: User, nome: string): Promise<void> {
  await user.click(botaoAdicionar());
  await user.type(screen.getByPlaceholderText('Nome do medicamento'), nome);
}

/** O documento entregue ao salvamento. A gravação é síncrona no clique. */
function gravacao(indice = 0): PrescriptionPayload {
  const chamada = aoSalvar.mock.calls[indice];
  if (!chamada) throw new Error(`a gravação de índice ${indice} não aconteceu`);
  return chamada[0] as PrescriptionPayload;
}

function reporArmazem(...modelos: Template[]): void {
  armazem.modelos.length = 0;
  armazem.modelos.push(...modelos);
}

describe('PrescriptionEditor — seção de medicamentos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(MODELO_RECEITA);
    filtroDeModelos.mockImplementation(async () => armazem.modelos);
  });

  it('a seção de medicamentos aparece nos dois tipos que contêm "receita"', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    for (const tipo of TIPOS_DE_RECEITA) {
      await escolherTipo(user, tipo);
      expect(screen.getByText('Medicamentos')).toBeInTheDocument();
      expect(botaoAdicionar()).toBeInTheDocument();
    }
  });

  it('a seção de medicamentos não aparece em nenhum dos quatro tipos restantes', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    // Adiciona um medicamento ANTES de trocar o tipo: sem isso a verificação não seria
    // sensível à seção, porque o campo não existiria de qualquer forma.
    await adicionarMedicamento(user, 'Dipirona 500mg');
    expect(screen.getByPlaceholderText('Nome do medicamento')).toBeInTheDocument();

    for (const tipo of TIPOS_SEM_RECEITA) {
      await escolherTipo(user, tipo);
      expect(screen.queryByText('Medicamentos')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Adicionar/ })).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Nome do medicamento')).not.toBeInTheDocument();
    }
  });

  it('a seção de medicamentos oferece os cinco campos do cenário', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await user.click(botaoAdicionar());

    // Quatro entradas de texto e uma área de instruções — os cinco campos que PT-006.1
    // enumera: Nome, Dosagem, Frequência, Duração e Instruções.
    expect(screen.getByPlaceholderText('Nome do medicamento')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dosagem (ex: 500mg)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Frequência (ex: 8/8h)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Duração (ex: 7 dias)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Instruções especiais...')).toBeInTheDocument();
  });

  it('o medicamento digitado é barrado no payload quando o tipo não é receita — e volta quando é', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await escolherTipo(user, 'receita_controlada');
    await adicionarMedicamento(user, 'Dipirona 500mg');

    // Metade positiva: com receita, o medicamento chega ao documento.
    await user.click(botaoSalvar());
    expect(gravacao(0).type).toBe('receita_controlada');
    expect(gravacao(0).medications).toHaveLength(1);
    expect(gravacao(0).medications?.[0]?.name).toBe('Dipirona 500mg');

    // Metade negativa: sem receita, a lista é barrada na montagem do payload.
    await escolherTipo(user, 'solicitacao_exame');
    expect(screen.queryByText('Medicamentos')).not.toBeInTheDocument();

    await user.click(botaoSalvar());
    expect(gravacao(1).type).toBe('solicitacao_exame');
    expect(gravacao(1).medications).toEqual([]);

    // A terceira gravação prova que o portão é a MONTAGEM, e não uma limpeza do estado ao
    // ocultar a seção: o medicamento digitado continua lá e volta ao payload.
    await escolherTipo(user, 'receita_simples');
    await user.click(botaoSalvar());
    expect(gravacao(2).medications).toHaveLength(1);
    expect(gravacao(2).medications?.[0]?.name).toBe('Dipirona 500mg');
  });
});

describe('PrescriptionEditor — pedido de modelos e ausência de re-filtro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(MODELO_RECEITA);
    filtroDeModelos.mockImplementation(async () => armazem.modelos);
  });

  it('a consulta de modelos é pedida com o tipo do documento e apenas com ativos', async () => {
    renderizarEditor();
    await esperarSeletores();

    // Asserção sobre os argumentos EXATOS do pedido, e não sobre o que a tela desenhou: o
    // filtro é aplicado no servidor, então o pedido é a única coisa que o cliente faz.
    expect(filtroDeModelos).toHaveBeenCalledWith({
      type: 'receita_simples',
      is_active: true,
    });
  });

  it('trocar o tipo do documento reemite a consulta com o tipo novo', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await escolherTipo(user, 'atestado');

    expect(filtroDeModelos).toHaveBeenLastCalledWith({
      type: 'atestado',
      is_active: true,
    });
  });

  it('o cliente oferece o que o servidor devolver, sem re-filtrar', async () => {
    // O dublê representa o SERVIDOR: ele devolve um modelo de outro tipo e um desativado,
    // contrariando o pedido. É exatamente o que a extração não podia afirmar.
    reporArmazem(MODELO_ATESTADO, MODELO_INATIVO);
    renderizarEditor();
    await esperarSeletores();

    expect(filtroDeModelos).toHaveBeenCalledWith({
      type: 'receita_simples',
      is_active: true,
    });

    const opcoes = Array.from(seletorDeModelo().options).map((o) => o.value);
    const rotulos = Array.from(seletorDeModelo().options).map((o) => o.textContent);

    // Os dois são oferecidos. O cliente PEDE certo e CONFIA inteiramente: não há segunda
    // linha de defesa na tela. É esta verificação que torna a ressalva do veredito
    // obrigatória — sem ela, PT-006.2 e PT-006.4 pareceriam cobertos.
    expect(opcoes).toEqual([MODELO_ATESTADO.id, MODELO_INATIVO.id]);
    expect(rotulos).toEqual([MODELO_ATESTADO.name, MODELO_INATIVO.name]);
  });
});

describe('PrescriptionEditor — substituição de variáveis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(MODELO_COM_VARIAVEIS);
    filtroDeModelos.mockImplementation(async () => armazem.modelos);

    // Congela só o `Date` (decisão D-04): temporizadores reais preservam as esperas
    // assíncronas de interface, que foi o conflito da feature 003.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(horaLocal(DIA_DE_PROVA, 12, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aplicar o modelo substitui as quatro variáveis, com o dia congelado', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await aplicarModelo(user, MODELO_COM_VARIAVEIS.id);

    const conteudo = campoDeConteudo().value;
    expect(conteudo).toContain(`Paciente: ${NOME_DO_PACIENTE}`);
    expect(conteudo).toContain(`CPF: ${CPF_DO_PACIENTE}`);
    expect(conteudo).toContain(`Data: ${DATA_CURTA}`);
    expect(conteudo).toContain(`Extenso: ${DATA_POR_EXTENSO}`);
    expect(conteudo).not.toContain('{PACIENTE_NOME}');
  });

  it('o conteúdo editado depois do modelo é o que se persiste', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await aplicarModelo(user, MODELO_COM_VARIAVEIS.id);
    expect(campoDeConteudo().value).toContain(NOME_DO_PACIENTE);

    await user.clear(campoDeConteudo());
    await user.type(campoDeConteudo(), 'Texto revisado pelo médico.');
    await user.click(botaoSalvar());

    // A substituição acontece na ESCOLHA do modelo, não no salvamento: o que se persiste é
    // o campo como ele estiver. É a metade que corrige a redação de PT-006.3 (RN-02).
    expect(gravacao(0).content).toBe('Texto revisado pelo médico.');
    expect(gravacao(0).content).not.toContain(NOME_DO_PACIENTE);
  });

  it('a variável de dias de afastamento permanece literal, mesmo com o campo preenchido', async () => {
    const user = userEvent.setup();
    reporArmazem(MODELO_COM_AFASTAMENTO);
    renderizarEditor();
    await esperarSeletores();

    await escolherTipo(user, 'atestado');
    await user.type(campoDeAfastamento(), '5');
    await aplicarModelo(user, MODELO_COM_AFASTAMENTO.id);

    // Asserção POSITIVA de que o marcador está lá. Afirmar que o `replace` não foi chamado
    // passaria por vacuidade e seria placebo com aparência de prova (decisão D-03).
    expect(campoDeConteudo().value).toContain(MARCADOR_DE_AFASTAMENTO);

    await user.click(botaoSalvar());

    expect(gravacao(0).content).toContain(MARCADOR_DE_AFASTAMENTO);
    // O agravante: o editor COLETA os dias e os envia no payload, e ainda assim deixa o
    // marcador no texto. A variável anunciada na administração nunca é resolvida.
    expect(gravacao(0).valid_days).toBe(5);
  });

  it('paciente sem CPF resolve a variável para vazio, em silêncio', async () => {
    const user = userEvent.setup();
    renderizarEditor({ patient: pacienteSemCpf() });
    await esperarSeletores();

    await aplicarModelo(user, MODELO_COM_VARIAVEIS.id);

    const conteudo = campoDeConteudo().value;
    expect(conteudo).not.toContain('{PACIENTE_CPF}');
    expect(conteudo).toContain('CPF: \n');
    // As outras variáveis seguem resolvidas: a tela não quebrou nem abortou a substituição.
    expect(conteudo).toContain(`Paciente: ${NOME_DO_PACIENTE}`);
  });

  it('a marcação do modelo não é escapada, no conteúdo e no payload', async () => {
    const user = userEvent.setup();
    reporArmazem(MODELO_COM_MARCACAO);
    renderizarEditor();
    await esperarSeletores();

    await aplicarModelo(user, MODELO_COM_MARCACAO.id);

    expect(campoDeConteudo().value).toContain(MARCACAO_LITERAL);
    expect(campoDeConteudo().value).not.toContain(MARCACAO_ESCAPADA);

    await user.click(botaoSalvar());

    expect(gravacao(0).content).toContain(MARCACAO_LITERAL);
    expect(gravacao(0).content).not.toContain(MARCACAO_ESCAPADA);
  });
});

/** A janela que o duplo de `window.open` devolve, e o que ela registra. */
function janelaFalsa() {
  return {
    document: { write: vi.fn(), close: vi.fn() },
    print: vi.fn(),
  };
}

describe('PrescriptionEditor — impressão e AMB-006', () => {
  let janela: ReturnType<typeof janelaFalsa>;
  let abrirJanela: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(MODELO_COM_MARCACAO);
    filtroDeModelos.mockImplementation(async () => armazem.modelos);

    janela = janelaFalsa();
    // Substitui APENAS `window.open`: trocar o objeto `window` inteiro quebra o `history`
    // do jsdom e produz falhas sem relação com a prova (risco R-02 da investigação).
    abrirJanela = vi.spyOn(window, 'open').mockReturnValue(janela as unknown as Window);
  });

  afterEach(() => {
    abrirJanela.mockRestore();
  });

  it('o HTML impresso recebe a marcação do modelo sem escape', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await aplicarModelo(user, MODELO_COM_MARCACAO.id);
    await user.click(botaoImprimir());

    expect(abrirJanela).toHaveBeenCalledWith('', '_blank');
    // A contagem é o que impede o placebo: se a guarda `if (!printWindow) return` tivesse
    // disparado, nada teria sido escrito e a verificação falharia aqui.
    expect(janela.document.write).toHaveBeenCalledTimes(1);

    const html = janela.document.write.mock.calls[0][0] as string;
    expect(html).toContain(MARCACAO_LITERAL);
    expect(html).not.toContain(MARCACAO_ESCAPADA);
    expect(html).toContain(NOME_DO_PACIENTE);

    expect(janela.document.close).toHaveBeenCalled();
    expect(janela.print).toHaveBeenCalledTimes(1);
  });

  it('sem o duplo, o caminho de impressão não escreveria nada — a prova do arnês', async () => {
    const user = userEvent.setup();
    // Devolve `null`, que é EXATAMENTE o que o `window.open` do jsdom devolve — ele registra
    // "Not implemented" e retorna `null`. O duplo modela a resposta, sem repetir o log do
    // jsdom a cada execução. É a demonstração de que a verificação anterior mede o código, e
    // não a sorte: com `null`, o editor sai pela guarda e a impressão fica inalcançável.
    abrirJanela.mockReturnValue(null);

    renderizarEditor();
    await esperarSeletores();
    await aplicarModelo(user, MODELO_COM_MARCACAO.id);
    await user.click(botaoImprimir());

    expect(janela.document.write).not.toHaveBeenCalled();
    expect(janela.print).not.toHaveBeenCalled();
  });
});

describe('PrescriptionEditor — procedência e contrato de enum', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(MODELO_RECEITA);
    filtroDeModelos.mockImplementation(async () => armazem.modelos);
  });

  it('a procedência grava o nome do modelo aplicado, e não o identificador', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await aplicarModelo(user, MODELO_RECEITA.id);
    await user.click(botaoSalvar());

    expect(gravacao(0).template_name).toBe(MODELO_RECEITA.name);
  });

  it('sem modelo aplicado, a procedência é nula', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await user.click(botaoSalvar());

    expect(gravacao(0).template_name).toBeNull();
  });

  it('trocar o tipo depois de aplicar um modelo deixa conteúdo obsoleto e procedência nula', async () => {
    const user = userEvent.setup();
    renderizarEditor();
    await esperarSeletores();

    await aplicarModelo(user, MODELO_RECEITA.id);
    expect(campoDeConteudo().value).toBe(MODELO_RECEITA.content);

    // O dublê representa o servidor: agora ele responde ao filtro do tipo novo e deixa de
    // devolver o modelo de receita. O CONTEÚDO já aplicado permanece no campo, e é ele que
    // vai para o documento — o schema copia o conteúdo, não referencia o modelo.
    reporArmazem(MODELO_ATESTADO);
    await escolherTipo(user, 'atestado');

    await user.click(botaoSalvar());

    expect(gravacao(0).type).toBe('atestado');
    expect(gravacao(0).content).toBe(MODELO_RECEITA.content);
    expect(gravacao(0).template_name).toBeNull();
  });

  it('abrir o editor com dados iniciais não recupera o modelo de origem', async () => {
    const user = userEvent.setup();
    renderizarEditor({ initialData: DADOS_INICIAIS });
    await esperarSeletores();

    expect(campoDeConteudo()).toHaveValue(CONTEUDO_INICIAL);

    // NÃO se afirma o `value` do seletor de modelo aqui. O dublê do seletor não desenha o
    // `SelectValue` — e é ele que, no componente real, mostra o texto de espera quando não há
    // escolha. Sem esse elemento, um `<select value="">` que só tem a opção do modelo cai na
    // PRIMEIRA opção, e a asserção mediria o dublê em vez do componente. O instrumento certo
    // é o payload: com o modelo disponível na lista e nenhum escolhido, a procedência nula
    // só pode vir de o editor ter aberto sem modelo selecionado.
    await user.click(botaoSalvar());

    // A procedência não sobrevive a uma reedição: não há campo de modelo nos dados iniciais,
    // então o documento reemitido perde o vínculo com o modelo que o originou.
    expect(gravacao(0).template_name).toBeNull();
  });

  it('o seletor de tipo oferece exatamente os seis tipos do schema, sem anamnese', async () => {
    renderizarEditor();
    await esperarSeletores();

    const valores = Array.from(seletorDeTipo().options).map((o) => o.value);

    // Confronto com o conjunto do enum de `Prescription`, e não com uma lista solta que
    // poderia envelhecer em silêncio. `anamnese` existe em `Template` e NÃO gera documento.
    expect(valores).toEqual([...TIPOS_DE_DOCUMENTO]);
    expect(valores).toHaveLength(6);
    expect(valores).not.toContain('anamnese');
  });
});
