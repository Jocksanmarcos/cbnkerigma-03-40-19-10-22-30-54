import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAluno } from '@/hooks/usePortalAluno';
import { useUserRole } from '@/hooks/useUserRole';
import { PerfilAlunoCard } from '@/components/portal/PerfilAluno';
import { TrilhasProgress } from '@/components/portal/TrilhasProgress';
import { CursosAluno } from '@/components/portal/CursosAluno';
import { GamificacaoPortal } from '@/components/portal/GamificacaoPortal';
import { ProximasEtapas } from '@/components/portal/ProximasEtapas';
import { PainelDiscipulador } from '@/components/portal/PainelDiscipulador';
import { PainelSupervisor } from '@/components/portal/PainelSupervisor';
import { PainelCoordenador } from '@/components/portal/PainelCoordenador';
import { ProgressoJornada } from '@/components/portal/ProgressoJornada';
import { FeedbackSection } from '@/components/portal/FeedbackSection';
import { CertificadoDisplay } from '@/components/portal/CertificadoDisplay';
import { NextActionSuggestion } from '@/components/portal/NextActionSuggestion';
import { NotificationCenter } from '@/components/portal/NotificationCenter';
import AgendaPortal from '@/components/portal/AgendaPortal';
import { ActionCenter } from '@/components/portal/ActionCenter';
import { ConfiguracoesModal } from '@/components/portal/ConfiguracoesModal';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalSkeleton } from '@/components/ui/loading-skeleton';
import { 
  User, 
  BookOpen, 
  Trophy, 
  Target, 
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const PortalAluno = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const {
    perfil,
    trilhas,
    cursos,
    conquistas,
    ranking,
    notificacoes,
    proximasEtapas,
    loading,
    marcarNotificacaoLida,
    marcarTodasLidas,
    refetchData
  } = usePortalAluno();

  const handleUpdatePerfil = async (dados: any) => {
    // Implementar lógica de atualização do perfil
    console.log('Atualizando perfil:', dados);
    await refetchData();
  };

  // Redirecionar para auth se não autenticado
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Loading state otimizado
  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <PortalSkeleton />
        </div>
      </AppLayout>
    );
  }

  // Se não encontrou perfil do aluno
  if (!perfil) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Perfil não encontrado</h2>
                <p className="text-muted-foreground mb-4">
                  Não foi possível encontrar seu perfil de aluno. Entre em contato com a administração.
                </p>
                <Button onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header personalizado */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Portal do Aluno
              </h1>
              <p className="text-muted-foreground">Kerigma EAD</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notificações */}
            <NotificationCenter 
              notificacoes={notificacoes}
              onMarcarLida={marcarNotificacaoLida}
              onMarcarTodasLidas={marcarTodasLidas}
            />
            
            {/* Configurações */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setConfigModalOpen(true)}
              title="Configurações"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* Sair */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signOut()}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

      {/* Welcome Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Bem-vindo de volta, {perfil.nome_completo.split(' ')[0]}! 
              <Sparkles className="h-6 w-6 text-yellow-500 inline ml-2" />
            </h2>
            <p className="text-muted-foreground">
              Continue sua jornada de crescimento e liderança
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{perfil.pontuacao_total}</div>
            <div className="text-sm text-muted-foreground">pontos acumulados</div>
          </div>
        </div>
      </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Perfil do Aluno */}
            <PerfilAlunoCard perfil={perfil} />
            
            {/* Próximas Etapas */}
            <ProximasEtapas etapas={proximasEtapas} />
            
            {/* Agenda do Aluno */}
            <AgendaPortal perfilAluno={perfil} />
            
            {/* Progresso da Jornada com Trilhas */}
            <ProgressoJornada trilhas={trilhas} onContinuarTrilha={(id) => console.log('Continuar trilha:', id)} />
            
          {/* Painéis baseados em Role */}
          {role === 'discipulador' && (
            <PainelDiscipulador 
              discipulandos={[]}
              estatisticas={{
                totalDiscipulandos: 0,
                emFormacao: 0,
                concluidos: 0,
                mediaProgresso: 0
              }}
            />
          )}
          
          {role === 'supervisor_regional' && (
            <PainelSupervisor
              discipuladosRegiao={[]}
              estatisticas={{
                totalDiscipulados: 0,
                porEtapa: {},
                discipuladoresAtivos: 0,
                mediaProgressoGeral: 0
              }}
              alertas={[]}
              metas={[]}
            />
          )}
          
          {role === 'coordenador_ensino' && (
            <PainelCoordenador
              indicadoresPorMissao={[]}
              metricas={{
                totalMissoes: 0,
                totalLideresFormacao: 0,
                mediaProgressoGlobal: 0,
                celulasComMaiorEngajamento: []
              }}
              heatmapData={[]}
              radarData={[]}
            />
          )}

          {/* Feedback Section */}
          <FeedbackSection 
            feedbacks={[
              {
                id: '1',
                discipulador: 'Pastor João Silva',
                texto: 'Parabéns pelo seu progresso na trilha DNA! Vejo que você está dedicado aos estudos. Continue assim!',
                data: new Date(Date.now() - 86400000).toISOString(),
                tipo: 'feedback',
                aula: 'Trilha do Novo Convertido'
              },
              {
                id: '2',
                discipulador: 'Pastora Maria Santos',
                texto: 'Sua participação nas aulas tem sido excelente. Nota 5 estrelas pela dedicação!',
                data: new Date(Date.now() - 172800000).toISOString(),
                tipo: 'avaliacao',
                nota: 5,
                aula: 'DNA do Reino - Aula 3'
              }
            ]}
            podeEnviarFeedback={true}
            onEnviarFeedback={(texto, aulaId) => {
              console.log('Novo feedback:', { texto, aulaId });
            }}
          />

          {/* Certificados Display */}
          <CertificadoDisplay 
            certificados={[
              {
                id: '1',
                nome: 'Certificado DNA do Reino',
                curso: 'DNA do Reino - Turma 2024.1',
                dataEmissao: new Date(Date.now() - 2592000000).toISOString(),
                tipo: 'curso',
                status: 'emitido',
                url: '/certificados/dna-reino-001.pdf'
              },
              {
                id: '2',
                nome: 'Trilha do Novo Convertido',
                curso: 'Trilha DNA - Primeira Etapa',
                dataEmissao: new Date().toISOString(),
                tipo: 'trilha',
                status: 'pendente'
              }
            ]}
            onDownload={(id) => console.log('Download certificado:', id)}
            onVisualizacao={(id) => console.log('Visualizar certificado:', id)}
          />
          
          {/* Cursos */}
            <CursosAluno cursos={cursos} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Gamificação */}
            <GamificacaoPortal 
              perfil={perfil}
              conquistas={conquistas}
              ranking={ranking}
            />

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Resumo Rápido
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nível Atual</span>
                    <Badge variant="secondary">{perfil.nivel_atual}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trilhas Ativas</span>
                    <span className="font-semibold">
                      {trilhas.filter(t => t.status === 'em_andamento').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cursos em Andamento</span>
                    <span className="font-semibold">
                      {cursos.filter(c => c.status === 'cursando').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Posição no Ranking</span>
                    <span className="font-semibold">
                      #{perfil.posicao_ranking || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Central de Ações */}
            <ActionCenter
              trilhasDisponiveis={trilhas.filter(t => t.status === 'em_andamento').length}
              cursosEmAndamento={cursos.filter(c => c.status === 'cursando').length}
              conquistasDesbloqueadas={conquistas.length}
              proximaAula={{
                nome: 'Identidade em Cristo',
                data: 'Quinta-feira',
                horario: '19:00'
              }}
              onExplorarCursos={() => window.open('/ensino', '_blank')}
              onVerTrilhas={() => console.log('Ver trilhas DNA')}
              onMinhasConquistas={() => console.log('Ver conquistas')}
              onIniciarProximaAula={() => console.log('Iniciar próxima aula')}
            />
          </div>
        </div>

        {/* Modal de Configurações */}
        <ConfiguracoesModal
          perfil={perfil}
          isOpen={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onUpdatePerfil={handleUpdatePerfil}
        />
      </div>
    </AppLayout>
  );
};

export default PortalAluno;