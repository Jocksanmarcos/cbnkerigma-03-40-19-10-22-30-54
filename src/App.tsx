import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import { ResponsiveProvider } from "@/components/layout/ResponsiveProvider";
import GlobalNavigationHub from "@/components/navigation/GlobalNavigationHub";
import { Header } from "@/components/layout/Header";
import QuickSwitcher from "@/components/navigation/QuickSwitcher";
import FabContact from "@/components/ui/fab-contact";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useSecurityEventsLogger } from "@/hooks/useSecurityEventsLogger";
import { KerigmaApp } from "@/components/mobile/KerigmaApp";
import Index from "./pages/Index";
import Sobre from "./pages/Sobre";
import Celulas from "./pages/Celulas";
import Agenda from "./pages/Agenda";
import Galeria from "./pages/Galeria";
import Dizimos from "./pages/Dizimos";
import Contato from "./pages/Contato";
import Missoes from "./pages/Missoes";
import PrimeiraVez from "./pages/PrimeiraVez";
import Auth from "./pages/Auth";
import PastorLogin from "./pages/PastorLogin";
import Admin from "./pages/Admin";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import RelatoriosFinanceiros from "./pages/RelatoriosFinanceiros";
import Dashboard from "./pages/Dashboard";
import DashboardCorrigido from "./pages/DashboardCorrigido";
import PedidosOracao from "./pages/PedidosOracao";
import Pessoas from "./pages/Pessoas";
import Ensino from "./pages/Ensino";
import ResetPassword from "./pages/ResetPassword";
import PortalAluno from "./pages/PortalAluno";
import AgendaAdmin from "./pages/AgendaAdmin";

import AuthDemo from "./pages/AuthDemo";

const queryClient = new QueryClient();

const GlobalResetHandler = () => {
  useEffect(() => {
    // Interceptar tokens de reset globalmente
    const checkForResetTokens = () => {
      const fullUrl = window.location.href;
      const hasRecovery = fullUrl.includes('type=recovery') || fullUrl.includes('access_token=');
      const isNotResetPage = !window.location.pathname.includes('/reset');
      
      if (hasRecovery && isNotResetPage) {
        console.log('🔄 Token de reset detectado globalmente, redirecionando para /reset');
        const newUrl = fullUrl.replace(window.location.pathname, '/reset');
        window.location.href = newUrl;
      }
    };

    checkForResetTokens();
  }, []);

  return null;
};

const AppWithNavigation = () => {
  const location = useLocation();
  const { isNativeApp, isMobile } = useMobileDetection();
  
  // Inicializar logger de eventos de segurança
  useSecurityEventsLogger();
  
  // Páginas que não precisam de navegação
  const hideNavigation = ['/auth', '/reset', '/pastor-login', '/demo'].includes(location.pathname);
  
  // Páginas que usam o GlobalNavigationHub (apenas áreas administrativas internas)
  const useGlobalNav = ['/dashboard', '/admin', '/portal-do-aluno'].some(path => 
    location.pathname.startsWith(path)
  );
  
  // Páginas públicas do site que usam o Header tradicional
  const useTraditionalHeader = !useGlobalNav && !hideNavigation;

  // Se for app nativo, mostrar interface mobile dedicada
  if (isNativeApp) {
    return <KerigmaApp />;
  }

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'mobile-layout' : ''}`}>
      {useGlobalNav && <GlobalNavigationHub />}
      {useTraditionalHeader && <Header />}
      
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/celulas" element={<Celulas />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/dizimos" element={<Dizimos />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/missoes" element={<Missoes />} />
          <Route path="/primeira-vez" element={<PrimeiraVez />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pastor-login" element={<PastorLogin />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/demo" element={<AuthDemo />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/landing/:slug" element={<LandingPage />} />
          <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard-corrigido" element={<DashboardCorrigido />} />
          <Route path="/pedidos-oracao" element={<PedidosOracao />} />
          <Route path="/pessoas" element={<Pessoas />} />
          <Route path="/ensino" element={<Ensino />} />
          <Route path="/portal-do-aluno" element={<PortalAluno />} />
          <Route path="/admin/agenda" element={<AgendaAdmin />} />
          <Route path="/security-center" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideNavigation && <FabContact />}
      <QuickSwitcher />
    </div>
  );
};

const App = () => {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalResetHandler />
          <ResponsiveProvider>
            <NavigationProvider>
              <AppWithNavigation />
            </NavigationProvider>
          </ResponsiveProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;