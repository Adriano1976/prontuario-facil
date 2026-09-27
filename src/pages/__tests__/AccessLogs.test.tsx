import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccessLogs from '../AccessLogs';
import {
  CONJUNTO_DE_INDICADORES,
  CONJUNTO_PAGINADO,
  DIA_DE_PROVA,
  INDICADORES_ESPERADOS,
  RECORTE_DE_PROVA,
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
  cacheDeConsultas: new Map<string, unknown>(),
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

vi.mock('@tanstack/react-query', async () => {
  const { useEffect, useState } = await import('react');
  return {
    /**
     * O dublê devolve **o que o transporte respondeu**, por chave de cache.
     *
     * ⚠️ ISTO MUDOU NA FEATURE 017, e a mudança era obrigatória. A forma anterior devolvia o
     * ARMAZÉM inteiro, ignorando o retorno da consulta — o que tornava a paginação
     * **inobservável por construção**: a tela recebia os 1.200 registros em qualquer página, e
     * nenhuma prova conseguiria distinguir o recorte 1 do recorte 2.
     *
     * O que a forma anterior media continua sendo medido: como os filtros NÃO entram na chave da
     * consulta, o cliente pede uma vez por recorte e filtra em memória. Se a página passasse a
     * incluir os filtros na chave, cada mudança produziria uma chave nova e a contagem de
     * chamadas denunciaria a reconsulta.
     */
    useQuery: (opcoes: { queryKey: unknown[]; queryFn?: () => unknown }) => {
      const chave = JSON.stringify(opcoes.queryKey);
      const [, forcarAtualizacao] = useState(0);

      useEffect(() => {
        if (cacheDeConsultas.has(chave)) return;
        let vivo = true;
        void Promise.resolve(opcoes.queryFn?.()).then((dados) => {
          if (!vivo) return;
          cacheDeConsultas.set(chave, dados);
          forcarAtualizacao((versao) => versao + 1);
        });
        return () => {
          vivo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- uma execução por chave, de propósito
      }, [chave]);

      const carregada = cacheDeConsultas.has(chave);
      return { data: cacheDeConsultas.get(chave), isLoading: !carregada };
    },
  };
});

/** O cache é por verificação: sem isto, a massa de uma vazaria para a seguinte. */
beforeEach(() => {
  cacheDeConsultas.clear();
  // A trilha é admin-only (BR-MIGRAR-024), então a sessão padrão desta prova é de
  // administrador. As duas formas de acesso com escopo entregam o mesmo repositório
  // dublado; a verificação do fim do arquivo troca a sessão para medir o outro caminho.
  sessao.valor = { id: 'admin-1', email: 'admin@medrecord.local', role: 'admin' };
  asUser.mockImplementation(() => ({ list: listar, filter: filtrar }));
  asAdmin.mockImplementation(() => ({ list: listar, filter: filtrar }));
  // Padrão do arquivo: a leitura devolve o armazém inteiro. Quem precisa de recorte — o bloco
  // da feature 017 — sobrepõe com um transporte que modela a janela.
  listar.mockImplementation(async () => armazem.logs);
  filtrar.mockImplementation(async () => armazem.logs);
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

/**
 * Um botão de navegação, pelo texto.
 *
 * ⚠️ POR QUE NÃO `getByRole('button', { name })`. Medido: sobre um DOM de 1.200 linhas, a consulta
 * por papel **com nome acessível** levava cerca de 90 s por chamada — ela computa o nome de todos
 * os elementos. A consulta por texto não computa nome acessível e resolve em milissegundos. A
 * asserção continua sendo sobre o mesmo elemento: o `<button>` que contém o rótulo.
 */
function botaoDeNavegacao(rotulo: string): HTMLButtonElement {
  const elemento = screen.getByText(rotulo).closest('button');
  if (!elemento) throw new Error(`o botão "${rotulo}" não foi encontrado`);
  return elemento;
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

  it('pede UM REGISTRO A MAIS do que exibe, e descarta o excedente', async () => {
    // O pedido mudou com a feature 017. O recorte continua sendo o do legado (500, `RN-08`), mas
    // agora se pede **um a mais**: o excedente é o que diz que há página seguinte, porque o
    // contrato não tem operação de contagem e esta feature não a criou (`RN-07`, `D-06`).
    reporArmazem(...CONJUNTO_PAGINADO.slice(0, RECORTE_DE_PROVA + 1));
    renderizarPagina();
    await screen.findByText('Evento 1');

    expect(listar).toHaveBeenCalledWith('-created_date', RECORTE_DE_PROVA + 1, 0);

    // 501 registros na fonte, 500 na tela: o excedente foi LIDO e não exibido. Sem esta segunda
    // metade, a asserção de argumento passaria mesmo que a tela renderizasse os 501.
    expect(linhasDeDados()).toBe(RECORTE_DE_PROVA);

    // O escopo continua DECLARADO (correção do F-04, 2026-09-24). A trilha é admin-only
    // (BR-MIGRAR-024), então a forma usada é a administrativa, e a de dono não é usada. A
    // restrição continua sendo aplicada pelo servidor; o que mudou é que a omissão deixou
    // de ser possível em silêncio.
    expect(asAdmin).toHaveBeenCalledWith({ kind: 'admin' });
    expect(asUser).not.toHaveBeenCalled();
  });

  it('não pergunta ao servidor quando a sessão não é de administrador, e não exibe registro nenhum', async () => {
    // O caminho de quem não é admin precisava ser DITO — era o que a omissão escondia:
    // "admin lendo a trilha" e "qualquer um lendo a trilha" eram o mesmo código.
    sessao.valor = { id: 'user-1', email: 'user@medrecord.local' };

    renderizarPagina();
    await screen.findByText('Nenhum log encontrado');

    // Para quem não é admin, a leitura responde vazio **sem chegar a pedir**.
    expect(asAdmin).not.toHaveBeenCalled();
    expect(listar).not.toHaveBeenCalled();

    // ⚠️ ESTA METADE É NOVA, e o dublê anterior a escondia. Ele devolvia o armazém em vez do
    // retorno da consulta, de modo que a tela exibia o registro da trilha mesmo para quem não é
    // admin — a asserção de transporte passava enquanto a de tela teria falhado. Com o dublê
    // fiel, o conjunto vazio aparece e o registro NÃO.
    expect(screen.queryByText('Acesso de prova')).toBeNull();
  });

  it('não reconsulta o servidor quando um filtro muda, e agora oferece a navegação', async () => {
    const user = userEvent.setup();
    renderizarPagina();
    await screen.findByText('Acesso de prova');

    expect(listar).toHaveBeenCalledTimes(1);

    // A navegação entre recortes passa a EXISTIR — é a entrega da feature 017, e a asserção
    // anterior (ausência de controle) foi invertida de propósito (`D-13`).
    expect(botaoDeNavegacao('Anterior')).toBeDisabled();
    expect(botaoDeNavegacao('Próxima')).toBeDisabled();

    await user.selectOptions(seletorDeAcao(), 'login');
    await user.selectOptions(seletorDeData(), 'week');
    await user.type(campoDeBusca(), 'ana');

    // O que NÃO mudou, e é o que esta verificação guarda desde a feature 006: o filtro é do
    // cliente. Os três controles mudaram e o servidor continua tendo sido consultado uma vez.
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
    expect(indicador('Logs neste recorte')).toBe(String(INDICADORES_ESPERADOS.total));
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

describe('017 — a leitura é paginada', () => {
  /**
   * O dublê do transporte passa a modelar a JANELA, e não só devolver o armazém inteiro.
   *
   * É deliberado e é fiel ao contrato: a feature `017` estendeu `EntityRepository` com `skip`
   * (`D-02`), o adaptador repassa os três argumentos (`T005`) e o cliente de modo offline recorta
   * depois de ordenar (`T004`). Um dublê que ignorasse `skip` tornaria a navegação **inobservável**
   * — a página 2 mostraria a página 1, e a prova não teria como distinguir.
   */
  function transporteComJanela(): void {
    listar.mockImplementation(async (_sort?: string, limit?: number, skip?: number) => {
      const inicio = skip ?? 0;
      return armazem.logs.slice(inicio, inicio + (limit ?? armazem.logs.length));
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    reporArmazem(...CONJUNTO_PAGINADO);
    transporteComJanela();
  });

  it('avançar alcança registros que NÃO estavam na primeira página', async () => {
    const usuario = userEvent.setup();
    renderizarPagina();
    await screen.findByText('Evento 1');

    expect(linhasDeDados()).toBe(RECORTE_DE_PROVA);
    // O 501º registro mais recente não está na primeira página — é o que a tela antiga tornava
    // inalcançável, e é a entrega central da feature.
    expect(screen.queryByText('Evento 501')).toBeNull();

    await usuario.click(botaoDeNavegacao('Próxima'));

    await screen.findByText('Evento 501');
    expect(screen.queryByText('Evento 1')).toBeNull();
    // A segunda página do conjunto de prova tem UM registro — o mínimo que prova a existência
    // dela. O recorte cheio está na primeira, que é onde ele é medido.
    expect(linhasDeDados()).toBe(1);

    // A segunda leitura sai com o deslocamento de um recorte, e continua pedindo um a mais.
    expect(listar).toHaveBeenCalledWith(
      '-created_date',
      RECORTE_DE_PROVA + 1,
      RECORTE_DE_PROVA,
    );
  });

  it('retroceder volta ao recorte anterior, e o retrocesso desabilita no primeiro', async () => {
    const usuario = userEvent.setup();
    renderizarPagina();
    await screen.findByText('Evento 1');

    expect(botaoDeNavegacao('Anterior')).toBeDisabled();

    await usuario.click(botaoDeNavegacao('Próxima'));
    await screen.findByText('Evento 501');
    expect(botaoDeNavegacao('Anterior')).toBeEnabled();

    await usuario.click(botaoDeNavegacao('Anterior'));
    await screen.findByText('Evento 1');
    expect(botaoDeNavegacao('Anterior')).toBeDisabled();
  });

  it('a última página é a incompleta, e o avanço desabilita nela', async () => {
    const usuario = userEvent.setup();
    renderizarPagina();
    await screen.findByText('Evento 1');

    expect(botaoDeNavegacao('Próxima')).toBeEnabled();

    await usuario.click(botaoDeNavegacao('Próxima'));
    await screen.findByText('Evento 501');

    // 501 registros em páginas de 500: a segunda tem 1, e é a última. O avanço desabilita porque
    // a leitura devolveu MENOS que o recorte — é o excedente que decide, e não um total.
    expect(linhasDeDados()).toBe(1);
    expect(botaoDeNavegacao('Próxima')).toBeDisabled();
  });

  it('nenhum indicador afirma ser o total da trilha', async () => {
    renderizarPagina();
    await screen.findByText('Evento 1');

    // O rótulo antigo media o conjunto carregado e se chamava "Total". Com 1200 registros na
    // trilha e 500 na tela, chamá-lo de total era a afirmação falsa mais direta da página.
    expect(screen.queryByText('Total de Logs')).toBeNull();
    expect(indicador('Logs neste recorte')).toBe(String(RECORTE_DE_PROVA));
  });

  it('a tela declara que a busca alcança o recorte, e não a trilha', async () => {
    renderizarPagina();
    await screen.findByText('Evento 1');

    expect(screen.getByText(/busca alcança/i)).toBeInTheDocument();
  });

  it('a mesma busca devolve números diferentes em páginas diferentes', async () => {
    const usuario = userEvent.setup();
    renderizarPagina();
    await screen.findByText('Evento 1');

    // Na primeira página, 'Ana Souza' aparece a cada cinco registros de 0 a 499 → 100.
    await usuario.type(campoDeBusca(), 'Ana Souza');
    const naPrimeira = linhasDeDados();
    expect(naPrimeira).toBe(100);

    await usuario.clear(campoDeBusca());
    await usuario.click(botaoDeNavegacao('Próxima'));
    await screen.findByText('Evento 501');

    // Na segunda, só `i = 500` é múltiplo de 5 → 1. É o comportamento DECIDIDO (`Q3.a` + `Q1.a`):
    // a busca é do cliente e alcança o recorte. O que a declaração impede é o auditor concluir
    // que o registro não existe.
    await usuario.type(campoDeBusca(), 'Ana Souza');
    expect(linhasDeDados()).toBe(1);
    expect(linhasDeDados()).not.toBe(naPrimeira);
  });
}, 30_000);
