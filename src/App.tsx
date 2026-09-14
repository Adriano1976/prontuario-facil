import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import type { ComponentType, ReactNode } from 'react';

const Pages = pagesConfig.Pages as Record<string, ComponentType>;
const LayoutComp = pagesConfig.Layout as ComponentType<{
  currentPageName?: string;
  children?: ReactNode;
}> | null;
const mainPageKey: string = pagesConfig.mainPage ?? Object.keys(Pages)[0];
const MainPage: ComponentType = mainPageKey ? Pages[mainPageKey] : (() => <></>);

const LayoutWrapper = ({ children, currentPageName }: { children: ReactNode; currentPageName: string }) => LayoutComp ?
  <LayoutComp currentPageName={currentPageName}>{children}</LayoutComp>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      // Redirect to login automatically
      navigateToLogin();
      return null;
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
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


/**
 * Componente principal da aplicação.
 * Configura o provedor de autenticação, roteamento, cliente de query e elementos de UI globais.
 * Manipula inicialização da app, estados de erro e roteamento de páginas baseado em autenticação.
 *
 * PARIDADE: conversão de linguagem; comportamento idêntico ao anterior.
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
