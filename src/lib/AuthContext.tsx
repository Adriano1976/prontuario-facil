import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { base44, hasSessionToken } from '@/api/base44Client';
import { toSessionUser } from '@/lib/session';
import { OFFLINE_USER } from '@/api/mockClient';
import type { User } from '@/types';

/**
 * Sessão da aplicação.
 *
 * PARIDADE: comportamento idêntico ao anterior. Continuam iguais: o modo offline entra
 * direto sem consultar o servidor, a verificação de configurações públicas acontece
 * antes da de usuário, o token decide se a sessão é verificada, e cada motivo de erro
 * do servidor vira o mesmo tipo de erro no estado.
 *
 * O que mudou é a FORMA, em dois pontos que reduzem acoplamento:
 *
 * 1. O acesso ao servidor passa pela camada de dados (`getPublicSettings`), em vez de
 *    o contexto criar um cliente de requisição importando um caminho interno de
 *    terceiro. Se o SDK mudar esse caminho, a correção fica num lugar só.
 * 2. O usuário da sessão passa por `toSessionUser`, ponto único de conversão para o
 *    tipo de domínio. É ali que a ausência de papel fica explícita.
 */

/** Erro de sessão, como o restante do sistema o consome. */
interface AuthError {
  type: string;
  message: string;
}

/** Forma do contexto exposto por este provedor. */
export interface AuthContextValue {
  /** Usuário da sessão, no tipo de domínio. */
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  /** Erro de sessão, quando houver. */
  authError: AuthError | null;
  /** Configurações públicas da aplicação, como o servidor as devolveu. */
  appPublicSettings: unknown;
  /** Encerra a sessão; por padrão redireciona para a autenticação. */
  logout: (shouldRedirect?: boolean) => void;
  /** Redireciona para a autenticação, voltando ao endereço atual. */
  navigateToLogin: () => void;
  /** Reexecuta a verificação de estado da aplicação. */
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Extrai o motivo do erro devolvido pelo servidor.
 *
 * O servidor informa o motivo num campo aninhado; esta função apenas lê essa forma sem
 * prometer que ela existe, devolvendo `undefined` quando não existe.
 */
function motivoDoErro(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return undefined;
  const extra = (data as { extra_data?: unknown }).extra_data;
  if (!extra || typeof extra !== 'object') return undefined;
  const reason = (extra as { reason?: unknown }).reason;
  return typeof reason === 'string' ? reason : undefined;
}

/** Extrai o código de situação devolvido pelo servidor. */
function statusDoErro(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

/** Extrai a mensagem do erro. */
function mensagemDoErro(error: unknown, padrao: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return padrao;
}

/**
 * Provedor de sessão.
 *
 * Deve envolver os componentes que precisam saber quem está usando o sistema.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [appPublicSettings, setAppPublicSettings] = useState<unknown>(null);

  useEffect(() => {
    checkAppState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Verifica se o usuário está autenticado no servidor.
   */
  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = toSessionUser(await base44.auth.me());
      setUser(currentUser);
      setIsAuthenticated(currentUser !== null);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);

      const status = statusDoErro(error);
      if (status === 401 || status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    }
  };

  /**
   * Verifica o estado da aplicação: configurações públicas e, em seguida, a sessão.
   */
  const checkAppState = async () => {
    // Modo offline: não há servidor; entra direto com o usuário de demonstração.
    if (import.meta.env.VITE_OFFLINE === 'true') {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setIsAuthenticated(true);
      setUser(OFFLINE_USER);
      return;
    }

    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      try {
        const publicSettings = await base44.auth.getPublicSettings();
        setAppPublicSettings(publicSettings);

        // A verificação da sessão só faz sentido quando há token. É a condição que o
        // legado usava, e é ela que decide entre consultar o servidor e considerar a
        // sessão ausente.
        if (hasSessionToken) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);

        const reason = motivoDoErro(appError);
        const status = statusDoErro(appError);

        if (status === 403 && reason) {
          if (reason === 'auth_required') {
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app',
            });
          } else {
            setAuthError({ type: reason, message: mensagemDoErro(appError, '') });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: mensagemDoErro(appError, 'Failed to load app'),
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: mensagemDoErro(error, 'An unexpected error occurred'),
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  /**
   * Encerra a sessão.
   *
   * @param shouldRedirect Se deve redirecionar para a autenticação após sair.
   */
  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      base44.auth.logout(window.location.href);
    } else {
      base44.auth.logout();
    }
  };

  /** Redireciona para a autenticação, voltando ao endereço atual. */
  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Acesso à sessão.
 *
 * Lança se usado fora do provedor, para que o erro apareça na hora em vez de virar um
 * valor nulo silencioso mais adiante.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
