import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useCurrentUser } from '@/lib/useCurrentUser';

const Pages = pagesConfig.Pages as Record<string, ComponentType>;
const LayoutComp = pagesConfig.Layout as ComponentType<{
  currentPageName?: string;
  children: ReactNode;
}> | null;
const mainPageKey: string = pagesConfig.mainPage ?? Object.keys(Pages)[0];
const MainPage: ComponentType = mainPageKey ? Pages[mainPageKey] : (() => <></>);

const LayoutWrapper = ({ children, currentPageName }: { children: ReactNode; currentPageName: string }) => LayoutComp ?
  <LayoutComp currentPageName={currentPageName}>{children}</LayoutComp>
  : <>{children}</>;

/**
 * Guarda de ROTA por papel (RBAC).
 *
 * Protege rotas cuja **leitura** é restrita a administrador. No projeto é o caso de uma
 * só: a trilha de auditoria (BR-MIGRAR-024, read/update/delete apenas admin). Médicos e
 * Templates **não** entram aqui — a leitura deles é livre para autenticados
 * (BR-MIGRAR-017/020); nesses dois a restrição é sobre a ESCRITA, e vive na própria tela.
 *
 * O aviso de acesso negado sai num efeito, e não durante a renderização: em render, ele
 * repetiria a cada passagem e transformaria renderização em efeito colateral.
 */
const RoleGuard = ({ children, requiredRole = 'admin' }: { children: ReactNode, requiredRole?: string }) => {
  const { toast } = useToast();
  const { data: user, isLoading } = useCurrentUser();
  const autorizado = user?.role === requiredRole;

  useEffect(() => {
    if (isLoading || autorizado) return;
    toast({
      variant: "destructive",
      title: "Acesso Negado",
      description: "Você não tem permissão para acessar esta página.",
    });
  }, [isLoading, autorizado, toast]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!autorizado) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, checkAppState } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // AUSÊNCIA de sessão: é o caso do visitante que ainda não entrou, e é por aqui que
      // ele chega ao login. Redireciona, como sempre.
      navigateToLogin();
      return null;
    } else if (authError.type === 'session_check_failed') {
      // FALHA de verificação (rede, servidor indisponível). NÃO redireciona: derrubar o
      // usuário para o login por causa de uma oscilação de rede trocaria um erro de
      // transporte por um logout que ele não pediu (RN-08 da feature `015`).
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-semibold">Não foi possível verificar a sessão</h1>
          <p className="max-w-md text-sm text-slate-600">
            A conexão com o servidor falhou. Isto não é um logout: sua sessão continua
            válida quando o servidor estiver acessível novamente.
          </p>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            onClick={() => { void checkAppState(); }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        // Guarda de ROTA só para a trilha de auditoria: leitura admin-only (BR-MIGRAR-024).
        // Médicos e Templates têm leitura livre para autenticados (BR-MIGRAR-017/020) — a
        // restrição deles é sobre a ESCRITA, e mora na própria tela.
        const isAdminPage = path === 'AccessLogs';
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                {isAdminPage ? (
                  <RoleGuard>
                    <Page />
                  </RoleGuard>
                ) : (
                  <Page />
                )}
              </LayoutWrapper>
            }
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

/**
 * Componente principal da aplicação.
 * Configura o provedor de autenticação, roteamento, cliente de query e elementos de UI globais.
 * Manipula inicialização da app, estados de erro e roteamento de páginas baseado em autenticação.
 *
 * PARIDADE: conversão de linguagem. **Uma exceção declarada**: as rotas de administração
 * ganharam guarda de papel (achado F-01) — a trilha de auditoria passou a exigir `admin`,
 * e as ações de escrita de Médicos e Templates passaram a ser escondidas de quem não é
 * admin (BR-MIGRAR-015/017/020/024). Fora disso, nada mudou.
 *
 * @returns Aplicação com provedores e rotas.
 */
function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
        </ThemeProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
