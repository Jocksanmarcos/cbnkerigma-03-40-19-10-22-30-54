import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { GaleriaManager } from '@/components/admin/GaleriaManager';
import { ConteudoManager } from '@/components/admin/ConteudoManager';
import { TemplatesManager } from '@/components/admin/TemplatesManager';
import { LandingPagesManager } from '@/components/admin/LandingPagesManager';
import { VisualEditorManager } from '@/components/admin/VisualEditorManager';
import { MissoesManager } from '@/components/admin/MissoesManager';
import { AIContentGenerator } from '@/components/admin/AIContentGenerator';
import { PerformanceMonitor } from '@/components/admin/maintenance/PerformanceMonitor';
import { BackupManager } from '@/components/admin/maintenance/BackupManager';
import { AIMaintenanceTools } from '@/components/admin/maintenance/AIMaintenanceTools';
import { AdvancedMetrics } from '@/components/admin/maintenance/AdvancedMetrics';
import { SecurityModule } from '@/components/admin/security/SecurityModule';
import WhatsAppManager from '@/components/admin/WhatsAppManager';
import NotificationCenter from '@/components/admin/NotificationCenter';
import AdvancedAnalytics from '@/components/admin/AdvancedAnalytics';
import SystemMonitoring from '@/components/admin/SystemMonitoring';
import PerformanceOptimizer from '@/components/admin/performance/PerformanceOptimizer';
import ChatBotManager from '@/components/admin/ChatBotManager';
import { AuditReport } from '@/components/admin/AuditReport';
import { ComunicacaoManager } from '@/components/admin/ComunicacaoManager';
import { MinisteriosManager } from '@/components/admin/MinisteriosManager';
import { DashboardEstrategico } from '@/components/admin/DashboardEstrategico';
// AppSidebar removido - navegação unificada
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// SidebarProvider removido - navegação unificada
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
  Home,
  Upload,
  Settings,
  Palette,
  Share2,
  Edit3,
  Sparkles,
  Globe,
  Layers,
  MessageCircle,
  GraduationCap,
  Bell,
  BarChart3,
  Shield,
  MessageSquare,
  Zap,
  Users as UsersIcon,
  MessageSquareMore,
  HeartHandshake,
  Brain
} from 'lucide-react';


const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, isAdmin, loading, adminCheckDone } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Simplificar validação - remover redirecionamentos automáticos que podem causar loops
  useEffect(() => {
    console.log('🔧 Admin page - estado atual:', { 
      isAuthenticated, 
      isAdmin, 
      loading, 
      adminCheckDone,
      currentPath: window.location.pathname 
    });
  }, [isAuthenticated, isAdmin, loading, adminCheckDone]);

  // Mostrar loading enquanto verifica autenticação e admin
  if (loading || !adminCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Não renderizar nada se não autenticado ou não admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kerigma Hub - Admin</h1>
          <p className="text-muted-foreground">Configurações técnicas e gerenciamento da plataforma</p>
        </div>
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col h-full">
              <div className="p-4 border-b border-border/40 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                    <Settings className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Admin Técnico</h2>
                    <p className="text-xs text-muted-foreground">CBN Kerigma</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4 min-h-0">
                <div className="space-y-4">
                  {[
                    {
                      title: "Principal",
                      items: [
                        { title: "Dashboard", value: "dashboard", icon: Home },
                      ]
                    },
                    {
                      title: "Conteúdo & Mídia",
                      items: [
                        { title: "Galeria", value: "galeria", icon: Upload },
                        { title: "Conteúdo", value: "conteudo", icon: Settings },
                      ]
                    },
                    {
                      title: "Design & Layout",
                      items: [
                        { title: "Templates", value: "templates", icon: Palette },
                        { title: "Landing Pages", value: "landing-pages", icon: Share2 },
                        { title: "Editor Visual", value: "visual-editor", icon: Edit3 },
                      ]
                    },
                    {
                      title: "Inteligência Artificial",
                      items: [
                        { title: "IA Content", value: "ai-generator", icon: Sparkles },
                        { title: "IA SEO", value: "ai-maintenance", icon: Settings },
                        { title: "ChatBot IA", value: "chatbot", icon: MessageCircle },
                      ]
                    },
                    {
                      title: "Comunicação & Analytics",
                      items: [
                        { title: "WhatsApp", value: "whatsapp", icon: MessageSquare },
                        { title: "Notificações", value: "notifications", icon: Bell },
                        { title: "Analytics", value: "analytics", icon: BarChart3 },
                        { title: "Monitoramento", value: "monitoring", icon: Shield },
                        { title: "Performance", value: "performance-optimizer", icon: Zap },
                      ]
                    },
                    {
                      title: "Usuários & Segurança",
                      items: [
                        { title: "Módulo de Segurança", value: "seguranca", icon: Shield },
                      ]
                    },
                    {
                      title: "Relatórios",
                      items: [
                        { title: "Auditoria", value: "audit-report", icon: BarChart3 },
                      ]
                    }
                  ].map((group) => (
                    <div key={group.title}>
                      <h3 className="px-4 py-2 text-xs font-medium text-muted-foreground">{group.title}</h3>
                      <div className="space-y-1 px-2">
                         {group.items.map((item) => (
                          <button
                            key={item.value}
                             onClick={() => {
                                 setActiveTab(item.value);
                              setTimeout(() => {
                                const closeBtn = document.querySelector('[data-state="open"] [data-dismiss]') as HTMLElement;
                                closeBtn?.click();
                              }, 100);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                              activeTab === item.value 
                                ? "bg-primary/15 text-primary font-medium" 
                                : "hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      <div className="platform-grid-4">
        <Card className="platform-card hover:shadow-primary/10 cursor-pointer group" onClick={() => setActiveTab('templates')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Templates</CardTitle>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Palette className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">12</div>
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Templates disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card className="platform-card hover:shadow-primary/10 cursor-pointer group" onClick={() => setActiveTab('landing-pages')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Landing Pages</CardTitle>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Globe className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">5</div>
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Páginas ativas
            </p>
          </CardContent>
        </Card>
        
        <Card className="platform-card hover:shadow-primary/10 cursor-pointer group" onClick={() => setActiveTab('conteudo')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Conteúdo</CardTitle>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Layers className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">48</div>
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Itens publicados
            </p>
          </CardContent>
        </Card>
        
        <Card className="platform-card hover:shadow-primary/10 cursor-pointer group" onClick={() => setActiveTab('ai-generator')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">IA Content</CardTitle>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">15</div>
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Conteúdos gerados
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="platform-grid-2">
        <Card className="platform-card">
          <CardHeader>
            <CardTitle className="dashboard-subsection-title gradient-text">Ações Rápidas</CardTitle>
            <CardDescription>
              Ferramentas para administração do site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="platform-btn-outline h-auto p-4 flex-col gap-2"
                onClick={() => setActiveTab('galeria')}
              >
                <Upload className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Gerenciar Galeria</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="platform-btn-outline h-auto p-4 flex-col gap-2"
                onClick={() => setActiveTab('templates')}
              >
                <Palette className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Editar Templates</span>
              </Button>
              <Button 
                variant="outline" 
                className="platform-btn-outline h-auto p-4 flex-col gap-2"
                onClick={() => setActiveTab('landing-pages')}
              >
                <Share2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Landing Pages</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="platform-btn-outline h-auto p-4 flex-col gap-2"
                onClick={() => setActiveTab('ai-generator')}
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">IA Content</span>
              </Button>
              <Button 
                variant="outline" 
                className="platform-btn-outline h-auto p-4 flex-col gap-2"
                onClick={() => setActiveTab('audit-report')}
              >
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Auditoria Completa</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="platform-card">
          <CardHeader>
            <CardTitle className="dashboard-subsection-title gradient-text">Últimas Atividades</CardTitle>
            <CardDescription>
              Registro das últimas modificações no site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div 
                className="flex items-start space-x-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => setActiveTab('galeria')}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">5 novas imagens adicionadas à galeria</span>
              </div>
              <div 
                className="flex items-start space-x-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => setActiveTab('templates')}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Template "Evento Especial" atualizado</span>
              </div>
              <div 
                className="flex items-start space-x-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => setActiveTab('ai-generator')}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Conteúdo gerado por IA: "Mensagem de Natal"</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'galeria':
        return <GaleriaManager />;
      case 'conteudo':
        return <ConteudoManager />;
      case 'templates':
        return <TemplatesManager />;
      case 'landing-pages':
        return <LandingPagesManager />;
      case 'visual-editor':
        return <VisualEditorManager />;
      case 'ai-generator':
        return <AIContentGenerator />;
      case 'ai-maintenance':
        return <AIMaintenanceTools />;
      case 'chatbot':
        return <ChatBotManager />;
      case 'missoes':
        return <MissoesManager />;
      case 'performance':
        return <PerformanceMonitor />;
      case 'backup':
        return <BackupManager />;
      case 'metrics':
        return <AdvancedMetrics />;
      case 'whatsapp':
        return <WhatsAppManager />;
      case 'notifications':
        return <NotificationCenter />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'performance-optimizer':
        return <PerformanceOptimizer />;
      case 'seguranca':
        return <SecurityModule />;
      case 'audit-report':
        return <AuditReport />;
      default:
        return <DashboardContent />;
    }
  };

  const Sidebar = () => (
    <div className="w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Settings className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Admin Técnico</h2>
            <p className="text-xs text-muted-foreground">CBN Kerigma</p>
          </div>
        </div>
      </div>
      <div className="py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="space-y-4">
          {[
            {
              title: "Principal",
              items: [
                { title: "Dashboard", value: "dashboard", icon: Home },
              ]
            },
            {
              title: "Conteúdo & Mídia",
              items: [
                { title: "Galeria", value: "galeria", icon: Upload },
                { title: "Conteúdo", value: "conteudo", icon: Settings },
              ]
            },
            {
              title: "Design & Layout",
              items: [
                { title: "Templates", value: "templates", icon: Palette },
                { title: "Landing Pages", value: "landing-pages", icon: Share2 },
                { title: "Editor Visual", value: "visual-editor", icon: Edit3 },
              ]
            },
            {
              title: "Inteligência Artificial",
              items: [
                { title: "IA Content", value: "ai-generator", icon: Sparkles },
                { title: "IA SEO", value: "ai-maintenance", icon: Settings },
                { title: "ChatBot IA", value: "chatbot", icon: MessageCircle },
              ]
            },
            {
              title: "Comunicação & Analytics",
              items: [
                { title: "WhatsApp", value: "whatsapp", icon: MessageSquare },
                { title: "Notificações", value: "notifications", icon: Bell },
                { title: "Analytics", value: "analytics", icon: BarChart3 },
                { title: "Monitoramento", value: "monitoring", icon: Shield },
                { title: "Performance", value: "performance-optimizer", icon: Zap },
              ]
            },
            {
              title: "Usuários & Segurança",
              items: [
                { title: "Módulo de Segurança", value: "seguranca", icon: Shield },
              ]
            },
            {
              title: "Relatórios",
              items: [
                { title: "Auditoria Completa", value: "audit-report", icon: BarChart3 },
              ]
            }
          ].map((group) => (
            <div key={group.title}>
              <h3 className="px-4 py-2 text-xs font-medium text-muted-foreground">{group.title}</h3>
              <div className="space-y-1 px-2">
                {group.items.map((item) => (
                  <button
                    key={item.value}
                     onClick={() => {
                         setActiveTab(item.value);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                      activeTab === item.value 
                        ? "bg-primary/15 text-primary font-medium" 
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">Painel administrativo da plataforma</p>
        </div>
        
        <div className="flex min-h-full w-full">
          {!isMobile && <Sidebar />}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </AppLayout>
  );
};

export default Admin;