import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { queryClientInstance } from '@/lib/query-client';
import App from '../App';

/**
 * Prova de ROTA da correção do achado F-01.
 *
 * O QUE SE MEDE AQUI: a guarda de papel está ligada **na rota certa**. `Layout.test.tsx`
 * prova o que o menu mostra; esta prova mede o encanamento — que a rota da trilha de
 * auditoria é a única que exige `admin` (BR-MIGRAR-024) e que Médicos e Templates seguem
 * alcançáveis por quem não é admin (BR-MIGRAR-017/020).
 *
 * POR QUE ELA EXISTE: sem esta prova, alguém poderia devolver `'Doctors'` à lista de rotas
 * guardadas — ou tirar `'AccessLogs'` dela — sem quebrar verificação nenhuma. A prova do
 * menu não veria isso, porque a navegação e o roteamento são decididos em lugares
 * diferentes.
 *
 * COMO: o registro de páginas é substituído por páginas de mentira, para que a prova meça
 * o ROTEAMENTO e não o conteúdo de cada tela. A sessão vem de `base44.auth.me`, e não de
 * um dublê da camada de sessão — assim a conversão de `toSessionUser` também participa, e
 * um papel ausente é tratado como papel ausente de verdade.
 */

const { sessao, toastMock } = vi.hoisted(() => ({
  sessao: { valor: null as Record<string, unknown> | null },
  toastMock: vi.fn(),
}));

vi.mock('@/lib/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    navigateToLogin: vi.fn(),
  }),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: vi.fn(async () => sessao.valor), logout: vi.fn() },
    appLogs: { logUserInApp: vi.fn(async () => undefined) },
    entities: { User: { delete: vi.fn() } },
  },
}));

// `toasts` é exigido pelo `Toaster` montado na raiz do `App`; `toast` é o que a guarda
// chama. O dublê precisa dos dois, senão a árvore quebra antes de a guarda ser exercitada.
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toasts: [], toast: toastMock }),
}));

/** Registro de páginas de mentira: cada rota se anuncia pelo que é, e nada mais. */
vi.mock('../pages.config', () => ({
  pagesConfig: {
    mainPage: 'Dashboard',
    Layout: ({ children }: { children: ReactNode; currentPageName?: string }) => <>{children}</>,
    Pages: {
      Dashboard: () => <p>tela do painel</p>,
      AccessLogs: () => <p>tela da trilha</p>,
      Doctors: () => <p>tela de médicos</p>,
      Templates: () => <p>tela de modelos</p>,
    },
  },
}));

/** A forma que o servidor devolve — crua, para que a conversão da sessão seja exercitada. */
const SESSAO_SEM_PAPEL = {
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
};
const SESSAO_ADMIN = { ...SESSAO_SEM_PAPEL, role: 'admin' };

function abrirRota(path: string): void {
  window.history.pushState({}, '', path);
}

describe('Rotas administrativas — a guarda está ligada na rota certa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // O cliente de consulta é um só para o processo inteiro: sem limpar, a sessão de um
    // caso vazaria para o seguinte e a prova mediria o cache em vez da guarda.
    queryClientInstance.clear();
    abrirRota('/');
  });

  it('recusa a trilha de auditoria a quem não tem papel, e avisa', async () => {
    sessao.valor = SESSAO_SEM_PAPEL;
    abrirRota('/AccessLogs');

    render(<App />);

    expect(await screen.findByText('tela do painel')).toBeInTheDocument();
    expect(screen.queryByText('tela da trilha')).not.toBeInTheDocument();

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Acesso Negado' }),
      ),
    );
  });

  it('entrega a trilha de auditoria ao administrador', async () => {
    sessao.valor = SESSAO_ADMIN;
    abrirRota('/AccessLogs');

    render(<App />);

    // O contraste com o caso anterior é o que separa "a guarda recusa" de "a rota não
    // existe": aqui a MESMA rota entrega a tela.
    expect(await screen.findByText('tela da trilha')).toBeInTheDocument();
  });

  it('entrega Médicos a quem não é admin, porque a leitura é livre', async () => {
    sessao.valor = SESSAO_SEM_PAPEL;
    abrirRota('/Doctors');

    render(<App />);

    // BR-MIGRAR-017: leitura livre para autenticados. A restrição de escrita é da tela
    // (`Doctors.tsx`), e a guarda de rota não pode antecipá-la.
    expect(await screen.findByText('tela de médicos')).toBeInTheDocument();
  });

  it('entrega Templates a quem não é admin, porque a leitura é livre', async () => {
    sessao.valor = SESSAO_SEM_PAPEL;
    abrirRota('/Templates');

    render(<App />);

    // BR-MIGRAR-020: leitura dos ativos liberada; a criação/exclusão é que é de admin.
    expect(await screen.findByText('tela de modelos')).toBeInTheDocument();
  });
});
