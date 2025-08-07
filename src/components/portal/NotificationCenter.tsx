import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bell, 
  X, 
  BookOpen, 
  Trophy, 
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { NotificacaoAluno } from '@/hooks/usePortalAluno';

interface NotificationCenterProps {
  notificacoes: NotificacaoAluno[];
  onMarcarLida: (id: string) => void;
  onMarcarTodasLidas: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notificacoes, 
  onMarcarLida,
  onMarcarTodasLidas 
}) => {
  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);
  
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'aula': return <BookOpen className="h-4 w-4" />;
      case 'certificado': return <GraduationCap className="h-4 w-4" />;
      case 'conquista': return <Trophy className="h-4 w-4" />;
      case 'geral': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'aula': return 'text-blue-600 bg-blue-100';
      case 'certificado': return 'text-green-600 bg-green-100';
      case 'conquista': return 'text-yellow-600 bg-yellow-100';
      case 'geral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          title="Notificações"
        >
          <Bell className="h-5 w-5" />
          {notificacoesNaoLidas.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {notificacoesNaoLidas.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações
                {notificacoesNaoLidas.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {notificacoesNaoLidas.length}
                  </Badge>
                )}
              </CardTitle>
              {notificacoesNaoLidas.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarcarTodasLidas}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notificacoes.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                <p className="text-muted-foreground">
                  Você não tem notificações no momento
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notificacoes.map((notificacao) => (
                  <div 
                    key={notificacao.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notificacao.lida 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-primary/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getTipoColor(notificacao.tipo)}`}>
                          {getTipoIcon(notificacao.tipo)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${!notificacao.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notificacao.titulo}
                            </h4>
                            {!notificacao.lida && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${!notificacao.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notificacao.mensagem}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(notificacao.data_criacao).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {notificacao.acao_url && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-xs"
                                onClick={() => {
                                  if (notificacao.acao_url) {
                                    window.location.href = notificacao.acao_url;
                                  }
                                }}
                              >
                                Ver mais
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {!notificacao.lida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarcarLida(notificacao.id)}
                          className="shrink-0 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};