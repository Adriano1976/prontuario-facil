import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

/**
 * Componente AuthProvider para gerenciar estado de autenticação de usuário e inicialização de app.
 * Verifica configurações públicas de app, manipula autenticação de usuário e gerencia estado de login/logout.
 * Deve envolver componentes de aplicação que precisam de acesso a contexto de autenticação.
 *
 * @component
 * @param {Object} props - Props do componente.
 * @param {React.ReactNode} props.children - Componentes filhos a renderizar dentro do provedor.
 * @returns {JSX.Element} - Provedor de contexto envolvendo filhos.
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  /**
   * Verifica estado de aplicação incluindo configurações públicas e autenticação de usuário.
   * Verifica se a app requer autenticação e se o usuário está registrado.
   * Manipula vários cenários de erro de autenticação (requerida, não registrada, expirada).
   *
   * @async
   * @returns {Promise<void>}
   *
   * @private
   */
  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: appParams.token, // Include token if available
        interceptResponses: true
      });
      
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        
        // If we got the app public settings successfully, check if user is authenticated
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);
        
        // Handle app-level errors
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: appError.message || 'Failed to load app'
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  /**
   * Verifica status de autenticação de usuário atual com o servidor.
   * Busca as informações de usuário autenticado.
   * Define estado de autenticação e manipula erros de autenticação.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @private
   */
  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  /**
   * Desconecta o usuário atual e opcionalmente redireciona para a página de login.
   * Limpa estado de usuário e remove token de autenticação.
   *
   * @param {boolean} [shouldRedirect=true] - Se deve redirecionar para página de login após logout.
   * @returns {void}
   *
   * @private
   */
  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  /**
   * Redireciona usuário para a página de login.
   * Usa método integrado de redirecionamento do SDK com a URL atual como destino de retorno.
   *
   * @returns {void}
   *
   * @private
   */
  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar contexto de autenticação e informações de usuário.
 * Fornece usuário atual, status de autenticação e métodos relacionados a autenticação.
 * Deve ser usado dentro de um componente AuthProvider.
 *
 * @returns {Object} - Objeto de contexto de autenticação.
 * @returns {Object|null} returns.user - Objeto de usuário autenticado atual ou null.
 * @returns {boolean} returns.isAuthenticated - Se o usuário está atualmente autenticado.
 * @returns {boolean} returns.isLoadingAuth - Se a autenticação está carregando.
 * @returns {boolean} returns.isLoadingPublicSettings - Se as configurações públicas de app estão carregando.
 * @returns {Object|null} returns.authError - Objeto de erro se autenticação falhou, null caso contrário.
 * @returns {Object|null} returns.appPublicSettings - Dados de configurações públicas de app.
 * @returns {Function} returns.logout - Função para desconectar o usuário atual.
 * @returns {Function} returns.navigateToLogin - Função para redirecionar para página de login.
 * @returns {Function} returns.checkAppState - Função para verificar novamente estado de app e autenticação.
 *
 * @throws {Error} Se useAuth for chamado fora de um AuthProvider.
 *
 * @example
 * const { user, isAuthenticated, logout } = useAuth();
 * if (!isAuthenticated) {
 *   return <LoginPage />;
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
