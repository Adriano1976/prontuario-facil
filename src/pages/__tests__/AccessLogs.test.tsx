import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccessLogs from '../AccessLogs';
import {
  CONJUNTO_DE_INDICADORES,
  DIA_DE_PROVA,
  INDICADORES_ESPERADOS,
  diasAtras,
  horaLocal,
  registro,
  registroEm,
  registroFuturo,
  semDetalhes,
} from '@/test/auditFixtures';
import type { AccessLog } from '@/types';
import type { ReactNode } from 'react';

/**
 * Prova de TELA da página de auditoria em `AccessLogs`.
 *
 * O QUE SE MEDE AQUI: o pedido de leitura com limite e ordenação, a ausência de paginação e
 * de reconsulta, os três filtros, a aritmética dos indicadores, o recorte de data sem teto,
 * e a página como superfície somente leitura.
 *
 * TRÊS RESSALVAS DECLARADAS, e as três importam para não ler cobertura onde não há:
 *
 * 1. **A leitura DECLARA escopo administrativo desde 2026-09-24** (correção do F-04). Até
 *    então ela era pedida sem escopo nenhum, por decisão D-03, e esta prova afirmava a
 *    omissão — `asAdmin` era espionado justamente para ser encontrado sem uso. A restrição
 *    de leitura a administrador continua sendo **RLS do servidor**, e a prova segue
 *    **declarando** isso em vez de afirmá-lo: o que a camada entrega é a obrigatoriedade de
 *    contrato, não a autorização.
 * 2. **O teto de 500 registros é paridade congelada** (AMB-004, `handoff.md`). A ausência de
 *    paginação é promessa provada, não lacuna desta feature.
 * 3. **O filtro é do cliente.** Mudar filtro não reconsulta o servidor, e é isso que a prova
 *    afirma — junto com o fato de que a busca não escala, que a extração já registrava.
 */

const {
  armazem,
  cacheDeConsultas,
  listar,
  filtrar,
  asUser,
  asAdmin,
  sessao,
} = vi.hoisted(() => ({
  armazem: { logs: [] as AccessLog[] },
  cacheDeConsultas: new Map<string, boolean>(),
  listar: vi.fn(),
  filtrar: vi.fn(),
  asUser: vi.fn(),
  asAdmin: vi.fn(),
  /** A sessão que `auth.me` devolve. A prova troca o papel para medir os dois caminhos. */
  sessao: { valor: null as Record<string, unknown> | null },
}));

/**
 * O repositório do transporte, com as cinco operações.
 *
 * `asUser` e `asAdmin` existem **e são espiados** de propósito: a prova afirma QUAL das
 * duas formas de acesso a página usa — e a resposta mudou em 2026-09-24, com a correção
 * do F-04 (antes, nenhuma das duas era usada).
 */
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: vi.fn(async () => sessao.valor) },
    entities: {
      AccessLog: {
        list: listar,
        filter: filtrar,
        asUser,
        asAdmin,
      },
    },
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (opcoes: { queryKey: unknown[]; queryFn?: () => unknown }) => {
    // ⚠️ O DUBLÊ MODEL A O CACHE, e não chama a consulta a cada renderização. Um dublê que
    // chama sempre mede RENDERS, não pedidos — e a diferença é justamente o que esta prova
    // precisa medir: como os filtros não entram na chave da consulta, o cliente pede UMA vez
    // e filtra em memória. Se a página passasse a incluir os filtros na chave, cada mudança
    // produziria uma chave nova e a contagem denunciaria a reconsulta.
    const chave = JSON.stringify(opcoes.queryKey);
    if (!cacheDeConsultas.has(chave)) {
      void opcoes.queryFn?.();
      cacheDeConsultas.set(chave, true);
    }
    return { data: armazem.logs, isLoading: false };
  },
}));

/** O cache é por verificação: sem isto, a massa de uma vazaria para a seguinte. */
beforeEach(() => {
  cacheDeConsultas.clear();
  // A trilha é admin-only (BR-MIGRAR-024), então a sessão padrão desta prova é de
  // administrador. As duas formas de acesso com escopo entregam o mesmo repositório
  // dublado; a verificação do fim do arquivo troca a sessão para medir o outro caminho.
  sessao.valor = { id: 'admin-1', email: 'admin@medrecord.local', role: 'admin' };
  asUser.mockImplementation(() => ({ list: listar, filter: filtrar }));
  asAdmin.mockImplementation(() => ({ list: listar, filter: filtrar }));
});

/**
 * Dublê dos seletores, no padrão já adotado nas features 002 a 005. A página tem **dois**
 * seletores — o de ação e o de data —, e eles são acessados por índice, com a contagem
 * afirmada a cada acesso.
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

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <AccessLogs />
    </MemoryRouter>,
  );
}

function seletores(): HTMLSelectElement[] {
  return screen.getAllByRole('combobox') as HTMLSelectElement[];
}

/** O seletor de ação é o primeiro declarado na página. */
function seletorDeAcao(): HTMLSelectElement {
  const todos = seletores();
  expect(todos).toHaveLength(2);
  return todos[0];
}

/** O seletor de data é o segundo declarado na página. */
function seletorDeData(): HTMLSelectElement {
  const todos = seletores();
  expect(todos).toHaveLength(2);
  return todos[1];
}

function campoDeBusca(): HTMLInputElement {
  return screen.getByPlaceholderText(
    'Buscar por usuário ou paciente...',
  ) as HTMLInputElement;
}

/** O número exibido ao lado do rótulo de um dos quatro indicadores. */
function indicador(rotulo: string): string {
  const elemento = screen.getByText(rotulo).nextElementSibling;
  if (!elemento) throw new Error(`o indicador "${rotulo}" não foi encontrado`);
  return elemento.textContent ?? '';
}

/** Quantas linhas de dados a tabela está exibindo, fora o cabeçalho. */
function linhasDeDados(): number {
  return within(screen.getByRole('table')).getAllByRole('row').length - 1;
}

function reporArmazem(...logs: AccessLog[]): void {
  armazem.logs.length = 0;
  armazem.logs.push(...logs);
}

describe('AccessLogs — o pedido de leitura', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(registro());
    listar.mockImplementation(async () => armazem.logs);
  });

  it('pede os registros com a ordenação e o limite exatos, e declara o escopo administrativo', async () => {
    renderizarPagina();
    await screen.findByText('Acesso de prova');

    // Argumentos EXATOS: a ordenação por criação decrescente e o teto de 500. É o que
    // `PT-007.4` promete, e o teto é paridade congelada (AMB-004) — a correção do F-04 não
    // tocou nem no limite nem na ordenação.
    expect(listar).toHaveBeenCalledWith('-created_date', 500);

    // O escopo passou a ser DECLARADO (correção do F-04, 2026-09-24). A trilha é admin-only
    // (BR-MIGRAR-024), então a forma usada é a administrativa, e a de dono não é usada. A
    // restrição continua sendo aplicada pelo servidor; o que mudou é que a omissão deixou
    // de ser possível em silêncio.
    expect(asAdmin).toHaveBeenCalledWith({ kind: 'admin' });
    expect(asUser).not.toHaveBeenCalled();
  });

  it('não pergunta ao servidor quando a sessão não é de administrador', async () => {
    // O caminho de quem não é admin precisava ser DITO — era o que a omissão escondia:
    // "admin lendo a trilha" e "qualquer um lendo a trilha" eram o mesmo código.
    sessao.valor = { id: 'user-1', email: 'user@medrecord.local' };

    renderizarPagina();
    await screen.findByText('Acesso de prova');

    // ⚠️ O dublê de `useQuery` devolve o armazém, e não o retorno da consulta — por isso a
    // asserção é sobre o TRANSPORTE, que é onde a diferença existe: para quem não é admin, a
    // leitura responde vazio **sem chegar a pedir**.
    expect(asAdmin).not.toHaveBeenCalled();
    expect(listar).not.toHaveBeenCalled();
  });

  it('não oferece controle de paginação e não reconsulta quando um filtro muda', async () => {
    const user = userEvent.setup();
    renderizarPagina();
    await screen.findByText('Acesso de prova');

    expect(listar).toHaveBeenCalledTimes(1);

    // Nenhum controle de paginação existe: nem botão de avançar, nem de voltar, nem seletor
    // de tamanho de página.
    expect(
      screen.queryByRole('button', { name: /próxim|anterior|avançar|voltar página/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /pagina/i })).not.toBeInTheDocument();

    await user.selectOptions(seletorDeAcao(), 'login');
    await user.selectOptions(seletorDeData(), 'week');
    await user.type(campoDeBusca(), 'ana');

    // O filtro é do cliente: os três controles mudaram e o servidor foi consultado UMA vez.
    expect(listar).toHaveBeenCalledTimes(1);
  });
});

describe('AccessLogs — os três filtros', () => {
  const DA_ANA = registro({ id: 'a', details: 'DETALHE-ana', patient_name: 'Ana Souza' });
  const DO_BRUNO = registro({
    id: 'b',
    details: 'DETALHE-bruno',
    user_email: 'outro@medrecord.local',
    patient_name: 'Bruno Lima',
    action: 'login',
  });
  const DA_ANA_BRUNO = registro({
    id: 'c',
    details: 'DETALHE-ana-bruno',
    patient_name: 'Bruno Lima',
    action: 'edit_patient',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(DA_ANA, DO_BRUNO, DA_ANA_BRUNO);
    listar.mockImplementation(async () => armazem.logs);
  });

  it('busca por usuário e por paciente sem diferenciar maiúsculas', async () => {
    const user = userEvent.setup();
    renderizarPagina();
    await screen.findByText('DETALHE-ana');

    expect(linhasDeDados()).toBe(3);

    await user.type(campoDeBusca(), 'BRUNO');
    // O termo casa com o PACIENTE de dois registros, e com o usuário de nenhum.
    expect(screen.getByText('DETALHE-bruno')).toBeInTheDocument();
    expect(screen.getByText('DETALHE-ana-bruno')).toBeInTheDocument();
    expect(screen.queryByText('DETALHE-ana')).not.toBeInTheDocument();

    await user.clear(campoDeBusca());
    await user.type(campoDeBusca(), 'outro@');
    // Agora o termo casa com o USUÁRIO de um só.
    expect(screen.getByText('DETALHE-bruno')).toBeInTheDocument();
    expect(screen.queryByText('DETALHE-ana-bruno')).not.toBeInTheDocument();
    expect(linhasDeDados()).toBe(1);
  });

  it('filtra por ação com igualdade exata', async () => {
    const user = userEvent.setup();
    renderizarPagina();
    await screen.findByText('DETALHE-ana');

    await user.selectOptions(seletorDeAcao(), 'edit_patient');

    expect(screen.getByText('DETALHE-ana-bruno')).toBeInTheDocument();
    expect(screen.queryByText('DETALHE-ana')).not.toBeInTheDocument();
    expect(screen.queryByText('DETALHE-bruno')).not.toBeInTheDocument();
    expect(linhasDeDados()).toBe(1);
  });
});

describe('AccessLogs — recorte de data sem teto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(horaLocal(DIA_DE_PROVA, 12, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('um registro com data FUTURA entra nos recortes de semana e de mês', async () => {
    const user = userEvent.setup();
    reporArmazem(
      registroEm(horaLocal(DIA_DE_PROVA, 10, 0), 'view_patient', {
        id: 'hoje',
        details: 'DETALHE-hoje',
      }),
      registroEm(horaLocal(diasAtras(3), 10, 0), 'edit_patient', {
        id: 'tres-dias',
        details: 'DETALHE-tres-dias',
      }),
      registroFuturo({ details: 'DETALHE-futuro' }),
      registroEm(horaLocal(diasAtras(20), 10, 0), 'delete_record', {
        id: 'vinte-dias',
        details: 'DETALHE-vinte-dias',
      }),
    );
    listar.mockImplementation(async () => armazem.logs);

    renderizarPagina();
    await screen.findByText('DETALHE-hoje');
    expect(linhasDeDados()).toBe(4);

    await user.selectOptions(seletorDeData(), 'week');

    // O recorte compara apenas o PISO (`>= hoje - 7 dias`), sem teto: o registro de três
    // dias à frente entra, e o de vinte dias atrás não. É a mesma forma do defeito que a
    // feature 004 provou no recorte de consultas.
    expect(screen.getByText('DETALHE-hoje')).toBeInTheDocument();
    expect(screen.getByText('DETALHE-tres-dias')).toBeInTheDocument();
    expect(screen.getByText('DETALHE-futuro')).toBeInTheDocument();
    expect(screen.queryByText('DETALHE-vinte-dias')).not.toBeInTheDocument();
    expect(linhasDeDados()).toBe(3);

    await user.selectOptions(seletorDeData(), 'month');

    // No mês, o de vinte dias atrás também entra — e o futuro continua entrando.
    expect(screen.getByText('DETALHE-vinte-dias')).toBeInTheDocument();
    expect(screen.getByText('DETALHE-futuro')).toBeInTheDocument();
    expect(linhasDeDados()).toBe(4);
  });

  it('o recorte de hoje compara o dia, e um registro sem detalhes não quebra a tabela', async () => {
    const user = userEvent.setup();
    reporArmazem(
      registroEm(horaLocal(DIA_DE_PROVA, 9, 0), 'view_patient', {
        id: 'hoje-manha',
        details: 'DETALHE-hoje-manha',
      }),
      semDetalhes({ id: 'sem-detalhes' }),
      registroFuturo({ details: 'DETALHE-futuro' }),
    );
    listar.mockImplementation(async () => armazem.logs);

    renderizarPagina();
    await screen.findByText('DETALHE-hoje-manha');

    // O registro com `details` nulo é a forma que o seed offline produz; a tabela mostra o
    // traço de ausência no lugar de quebrar.
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);

    await user.selectOptions(seletorDeData(), 'today');

    expect(screen.getByText('DETALHE-hoje-manha')).toBeInTheDocument();
    expect(screen.queryByText('DETALHE-futuro')).not.toBeInTheDocument();
    // `semDetalhes` é do dia de prova, então permanece.
    expect(linhasDeDados()).toBe(2);
  });
});

describe('AccessLogs — os quatro indicadores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(...CONJUNTO_DE_INDICADORES);
    listar.mockImplementation(async () => armazem.logs);
  });

  it('conta por heurística de substring, e a soma NÃO fecha com o total', async () => {
    renderizarPagina();
    await screen.findByText('Evento login');

    // Cada indicador conferido contra o conjunto desenhado, que tem uma ação de cada
    // família: duas de visualização, cinco de edição ou criação, uma de exclusão, e quatro
    // que não entram em categoria nenhuma.
    expect(indicador('Total de Logs')).toBe(String(INDICADORES_ESPERADOS.total));
    expect(indicador('Visualizações')).toBe(String(INDICADORES_ESPERADOS.visualizacoes));
    expect(indicador('Edições')).toBe(String(INDICADORES_ESPERADOS.edicoes));
    expect(indicador('Exclusões')).toBe(String(INDICADORES_ESPERADOS.exclusoes));

    // A heurística é por substring, e o efeito é duplo: `create_prescription` entra como
    // "Edição", e `login`, `logout`, `upload_exam` e `export_data` não entram em categoria
    // nenhuma. A soma dos três indicadores é menor que o total, e é isso que a prova afirma.
    const soma =
      INDICADORES_ESPERADOS.visualizacoes +
      INDICADORES_ESPERADOS.edicoes +
      INDICADORES_ESPERADOS.exclusoes;

    expect(soma).toBe(INDICADORES_ESPERADOS.somaDosIndicadores);
    expect(soma).not.toBe(INDICADORES_ESPERADOS.total);
    expect(INDICADORES_ESPERADOS.total - soma).toBe(4);
  });
});

describe('AccessLogs — a página é somente leitura', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(...CONJUNTO_DE_INDICADORES);
    listar.mockImplementation(async () => armazem.logs);
  });

  it('nenhuma linha oferece editar ou excluir, e nenhum controle fica dentro da tabela', async () => {
    renderizarPagina();
    await screen.findByText('Evento login');

    const tabela = screen.getByRole('table');

    // A trilha é somente inserção pelo cliente: a página exibe e não oferece operação
    // nenhuma sobre o registro. A asserção é sobre a AUSÊNCIA de controles dentro da
    // tabela, e não sobre a ausência de uma chamada — a página não tem como alterar.
    expect(within(tabela).queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /editar|excluir|remover/i })).not.toBeInTheDocument();

    // Controle positivo do instrumento: as doze linhas estão lá, então a tabela foi
    // renderizada de fato e a ausência acima não é vacuidade.
    expect(linhasDeDados()).toBe(INDICADORES_ESPERADOS.total);
  });
});
