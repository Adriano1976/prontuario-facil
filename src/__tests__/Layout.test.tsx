import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from '../Layout';
import { USUARIO_ADMIN, USUARIO_DA_SESSAO } from '@/test/auditFixtures';

/**
 * Prova de TELA da navegação principal, em `Layout`.
 *
 * O QUE SE MEDE AQUI: `RF-10` — o item de auditoria é oferecido ao usuário **sem** papel de
 * administrador. A extração afirma que "somente admins veem a tela de auditoria"
 * (`code-analysis.md#5.1`), e a prova demonstra que a primeira metade dessa nota é
 * **imprecisa**: a navegação não consulta papel nenhum.
 *
 * ⚠️ A afirmação é sobre o que o usuário VÊ, e por isso exige renderizar em vez de ler o
 * arquivo (decisão D-04). A prova de que a leitura da trilha é restrita a admin é da RLS, e
 * fica **declarada**, não afirmada aqui.
 *
 * ⚠️ Os menus suspensos e os diálogos do `Layout` são Radix e ficam **fechados**: a
 * verificação afirma o item de navegação e não abre menu nenhum (risco R-02).
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
 * O elo de navegação do item de auditoria.
 *
 * ⚠️ O `Layout` desenha **duas** navegações: a do topo e a inferior, exclusiva de tela
 * estreita. A segunda duplica os quatro primeiros itens no DOM — o jsdom não aplica o CSS
 * que a esconderia. O item de auditoria é o sétimo, e por isso aparece **uma vez só**; a
 * contagem é afirmada para que essa propriedade não se perca em silêncio.
 */
function itemDeAuditoria(): HTMLElement {
  const encontrados = screen.getAllByRole('link', { name: /Logs de Acesso/i });
  expect(encontrados).toHaveLength(1);
  return encontrados[0];
}

describe('Layout — a navegação não consulta papel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('oferece o item de auditoria ao usuário sem papel de administrador', () => {
    // Sem `role`: é o usuário comum. A tela de auditoria tem leitura admin-only na RLS, e
    // ainda assim o item aparece na navegação.
    usuarioAtual.valor = { kind: 'authenticated', ...USUARIO_DA_SESSAO };

    renderizarLayout();

    expect(itemDeAuditoria()).toBeInTheDocument();
    expect(itemDeAuditoria()).toHaveAttribute('href', '/AccessLogs');
  });

  it('oferece o mesmo item ao administrador, sem diferença de navegação', () => {
    usuarioAtual.valor = { kind: 'authenticated', ...USUARIO_ADMIN };

    renderizarLayout();

    // O contraste é o que torna a afirmação precisa: o item aparece nos DOIS casos, o que
    // prova que a condição de papel não participa da decisão.
    expect(itemDeAuditoria()).toHaveAttribute('href', '/AccessLogs');
  });

  it('mostra os demais itens de navegação ao mesmo usuário, e a página é renderizada', () => {
    usuarioAtual.valor = { kind: 'authenticated', ...USUARIO_DA_SESSAO };

    renderizarLayout();

    // Controle do instrumento: o menu foi desenhado de fato, e a presença do item de
    // auditoria não é efeito de uma navegação que não renderizou. "Pacientes" é o segundo
    // item e aparece nas DUAS navegações, por isso a consulta é por conjunto.
    expect(
      screen.getAllByRole('link', { name: /Pacientes/i }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
  });
});
