import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from '../Layout';
import { USUARIO_ADMIN, USUARIO_DA_SESSAO } from '@/test/auditFixtures';

/**
 * Prova de TELA da navegação principal, em `Layout`.
 *
 * O QUE SE MEDE AQUI, e são duas metades do mesmo achado:
 *
 * 1. o item da trilha de auditoria é oferecido **apenas** ao administrador — a leitura de
 *    `AccessLog` é restrita a admin (BR-MIGRAR-024), e o achado F-01 era exatamente que a
 *    navegação não consultava papel nenhum;
 * 2. Médicos e Templates continuam oferecidos a **todos** — a leitura deles é livre para
 *    autenticados (BR-MIGRAR-017/020), e o que é restrito ali é a escrita. Sem esta
 *    metade, a correção do F-01 poderia virar restrição indevida sem quebrar prova.
 *
 * ⚠️ ESTA PROVA AFIRMAVA O CONTRÁRIO até a correção. Ela media que o item de auditoria
 * aparecia para quem não tinha papel, e que a navegação não consultava papel nenhum — o
 * que era fiel ao código de então. O texto foi **reescrito, não apagado**: a inversão do
 * comportamento é o próprio objeto da prova, e o registro da afirmação antiga vive em
 * `_reversa_sdd/code-spec-matrix.md`.
 *
 * ⚠️ A afirmação é sobre o que o usuário VÊ, e por isso exige renderizar em vez de ler o
 * arquivo (decisão D-04). A restrição de LEITURA da trilha é da regra do servidor, e
 * fica **declarada** aqui, não afirmada.
 *
 * ⚠️ Os menus suspensos e os diálogos do `Layout` são Radix e ficam **fechados**: a
 * verificação afirma os elos de navegação e não abre menu nenhum (risco R-02).
 */

const { usuarioAtual, sair } = vi.hoisted(() => ({
  usuarioAtual: { valor: null as Record<string, unknown> | null },
  sair: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: vi.fn(), logout: sair },
    entities: { User: { delete: vi.fn() } },
  },
}));

/** A sessão da vez, já convertida — é o que o `Layout` lê para desenhar o menu do usuário. */
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: usuarioAtual.valor }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function renderizarLayout() {
  return render(
    <MemoryRouter>
      <Layout currentPageName="AccessLogs">
        <p>conteúdo da página</p>
      </Layout>
    </MemoryRouter>,
  );
}

/**
 * Os elos de navegação com o nome acessível dado.
 *
 * ⚠️ O `Layout` desenha **duas** navegações: a do topo e a inferior, exclusiva de tela
 * estreita. A segunda repete os quatro primeiros itens no DOM — o jsdom não aplica o CSS
 * que a esconderia. Por isso cada caso afirma a CONTAGEM, e não apenas a presença.
 */
function itens(nome: RegExp): HTMLElement[] {
  return screen.queryAllByRole('link', { name: nome });
}

describe('Layout — a navegação consulta papel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('esconde o item de auditoria de quem não é administrador', () => {
    // Sem `role`: é o usuário comum. A tela de auditoria tem leitura admin-only na regra
    // do servidor, e o item deixa de ser oferecido na navegação.
    usuarioAtual.valor = { kind: 'authenticated', ...USUARIO_DA_SESSAO };

    renderizarLayout();

    expect(itens(/Logs de Acesso/i)).toHaveLength(0);
  });

  it('oferece Médicos e Templates a quem não é admin, porque a leitura é livre', () => {
    usuarioAtual.valor = { kind: 'authenticated', ...USUARIO_DA_SESSAO };

    renderizarLayout();

    // BR-MIGRAR-017 (médicos) e BR-MIGRAR-020 (templates): leitura livre para
    // autenticados. Esconder estes dois restringiria mais do que a regra permite — é a
    // segunda metade da prova, e a que protege contra uma correção excessiva.
    expect(itens(/Médicos/i)).toHaveLength(1);
    expect(itens(/Templates/i)).toHaveLength(1);
  });

  it('oferece o item de auditoria ao administrador', () => {
    usuarioAtual.valor = { kind: 'authenticated', ...USUARIO_ADMIN };

    renderizarLayout();

    // O contraste é o que torna a afirmação precisa: o mesmo item que faltou no primeiro
    // caso aparece aqui. Uma vez só — a navegação inferior repete apenas os quatro
    // primeiros itens, e a auditoria é o sétimo.
    expect(itens(/Logs de Acesso/i)).toHaveLength(1);
    expect(itens(/Logs de Acesso/i)[0]).toHaveAttribute('href', '/AccessLogs');
  });

  it('mostra os demais itens de navegação, e a página é renderizada', () => {
    usuarioAtual.valor = { kind: 'authenticated', ...USUARIO_DA_SESSAO };

    renderizarLayout();

    // Controle do instrumento: o menu foi desenhado de fato, e a ausência do item de
    // auditoria não é efeito de uma navegação que não renderizou. "Pacientes" é o segundo
    // item e aparece nas DUAS navegações, por isso a consulta é por conjunto.
    expect(itens(/Pacientes/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
  });
});
