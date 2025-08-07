import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  UserPlus, 
  Calendar,
  DollarSign,
  Heart,
  BookOpen,
  Camera,
  Building2,
  FileText,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();
  
  const actions = [
    {
      title: 'Novo Membro',
      description: 'Cadastrar novo membro',
      icon: UserPlus,
      action: () => navigate('/admin?tab=pessoas')
    },
    {
      title: 'Novo Evento',
      description: 'Criar evento',
      icon: Calendar,
      action: () => navigate('/admin?tab=eventos')
    },
    {
      title: 'Registro Financeiro',
      description: 'Lançar movimentação',
      icon: DollarSign,
      action: () => navigate('/admin?tab=contribuicoes')
    },
    {
      title: 'Pedido de Oração',
      description: 'Cadastrar pedido',
      icon: Heart,
      action: () => navigate('/admin?tab=pedidos-oracao')
    },
    {
      title: 'Estudo Bíblico',
      description: 'Criar novo estudo',
      icon: BookOpen,
      action: () => navigate('/admin?tab=estudos')
    },
    {
      title: 'Upload de Mídia',
      description: 'Adicionar fotos/vídeos',
      icon: Camera,
      action: () => navigate('/admin?tab=galeria')
    },
    {
      title: 'Módulo Ensino',
      description: 'Gerenciar cursos e turmas',
      icon: GraduationCap,
      action: () => navigate('/admin?tab=ensino')
    },
    {
      title: 'Documentos PDF',
      description: 'Gerar fichas e certificados',
      icon: FileText,
      action: () => navigate('/admin?tab=pessoas')
    }
  ];

  return (
    <Card className="platform-card">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
          <span>Ações Rápidas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
          {actions.slice(0, 6).map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={index}
                variant="ghost"
                className="platform-btn-outline h-auto p-3 flex items-center justify-start gap-3"
                onClick={action.action}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium text-xs sm:text-sm truncate">{action.title}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate leading-tight">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};