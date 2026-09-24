import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { queryClientInstance } from '@/lib/query-client';
import App from '../App';

/**
 * Prova de APLICAÇÃO do achado **F-02** — o que o contexto não alcança.
 *
 * O QUE SE MEDE AQUI: o tratamento dos dois casos de sessão no `App`. Uma **falha de
 * verificação** (rede fora, servidor indisponível) exibe um estado distinguível e **não**
 * chama o redirecionamento ao login; uma **ausência de sessão** continua levando ao login.
 *
 * POR QUE ELA EXISTE EM ARQUIVO PRÓPRIO: `AuthContext.test.tsx` prova o que o contexto
 * decide — que a verificação é tentada, e que o tipo de erro é distinguível do de ausência
 * de sessão. O que **não** se prova ali é o que o cenário de aceitação afirma: que a
 * aplicação **exibe** o estado em vez de redirecionar. Essa decisão vive em `App.tsx`, no
 * tratamento de `authError`, e é a diferença entre "corrigi o achado" e "troquei um erro de
 * rede por um logout que o usuário não pediu".
 *
 * COMO: a camada de sessão é substituída por um estado controlado, para que a prova meça o
 * TRATAMENTO e não a verificação — que tem prova própria. O registro de páginas é
 * substituído por uma página de mentira, pelo mesmo motivo.
 */

const { estado, navigateToLogin, checkAppState } = vi.hoisted(() => ({
  estado: { authError: null as { type: string; message: string } | null },
  navigateToLogin: vi.fn(),
  checkAppState: vi.fn(async () => undefined),
}));

vi.mock('@/lib/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: estado.authError,
    navigateToLogin,
    checkAppState,
  }),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: vi.fn(async () => null), logout: vi.fn(), redirectToLogin: vi.fn() },
    appLogs: { logUserInApp: vi.fn(async () => undefined) },
    entities: { User: { delete: vi.fn() } },
  },
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toasts: [], toast: vi.fn() }),
}));

vi.mock('../pages.config', () => ({
  pagesConfig: {
    mainPage: 'Dashboard',
    Layout: ({ children }: { children: ReactNode }) => <>{children}</>,
    Pages: { Dashboard: () => <p>tela do painel</p> },
  },
}));

const FALHA_DE_VERIFICACAO = { type: 'session_check_failed', message: 'sem rede' };
const SEM_SESSAO = { type: 'auth_required', message: 'Authentication required' };
const TITULO_DO_ESTADO = 'Não foi possível verificar a sessão';

describe('App — falha de verificação não vira logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.authError = null;
    queryClientInstance.clear();
    window.history.replaceState({}, '', '/');
  });

  it('exibe o estado distinguível e NÃO chama o redirecionamento quando a verificação falha', async () => {
    estado.authError = FALHA_DE_VERIFICACAO;

    render(<App />);

    expect(await screen.findByText(TITULO_DO_ESTADO)).toBeInTheDocument();
    // A metade que separa "estado distinguível" de "redirecionou assim mesmo".
    expect(navigateToLogin).not.toHaveBeenCalled();
    // E a aplicação NÃO renderiza por baixo do estado de falha.
    expect(screen.queryByText('tela do painel')).not.toBeInTheDocument();
  });

  it('continua levando ao login quando a sessão está AUSENTE', async () => {
    estado.authError = SEM_SESSAO;

    render(<App />);

    // O contraste com o caso anterior é o que separa os dois estados: aqui o
    // redirecionamento acontece, e é ele que leva o visitante ao login.
    await waitFor(() => expect(navigateToLogin).toHaveBeenCalled());
    expect(screen.queryByText(TITULO_DO_ESTADO)).not.toBeInTheDocument();
  });

  it('renderiza a aplicação quando não há erro de sessão', async () => {
    render(<App />);

    expect(await screen.findByText('tela do painel')).toBeInTheDocument();
    expect(navigateToLogin).not.toHaveBeenCalled();
  });

  it('o botão de tentar novamente reexecuta a verificação, em vez de recarregar a página', async () => {
    estado.authError = FALHA_DE_VERIFICACAO;

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(checkAppState).toHaveBeenCalled();
  });
});
