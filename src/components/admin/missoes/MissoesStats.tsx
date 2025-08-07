import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Church, Users, Eye, TrendingUp, DollarSign } from 'lucide-react';

interface TotaisGerais {
  total_membros: number;
  total_visitantes: number;
  total_celulas: number;
  total_receitas: number;
  total_despesas: number;
  saldo_total: number;
}

interface MissoesStatsProps {
  missoesCount: number;
  totaisGerais: TotaisGerais;
  formatarValor: (valor: number) => string;
}

export const MissoesStats = ({ 
  missoesCount, 
  totaisGerais, 
  formatarValor 
}: MissoesStatsProps) => {
  const stats = [
    {
      title: "Missões Ativas",
      value: missoesCount.toString(),
      description: "Unidades em operação",
      icon: Church,
      color: "text-blue-600"
    },
    {
      title: "Total de Membros",
      value: totaisGerais.total_membros.toString(),
      description: "Membros ativos",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Total de Visitantes", 
      value: totaisGerais.total_visitantes.toString(),
      description: "Em acompanhamento",
      icon: Eye,
      color: "text-orange-600"
    },
    {
      title: "Total de Células",
      value: totaisGerais.total_celulas.toString(),
      description: "Células em funcionamento",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Receitas (Mês)",
      value: formatarValor(totaisGerais.total_receitas),
      description: "Todas as missões",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Saldo Total",
      value: formatarValor(totaisGerais.saldo_total),
      description: "Receitas - Despesas",
      icon: DollarSign,
      color: totaisGerais.saldo_total >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        const bgColors = {
          "text-blue-600": "bg-blue-50",
          "text-green-600": "bg-green-50", 
          "text-orange-600": "bg-orange-50",
          "text-purple-600": "bg-purple-50",
          "text-red-600": "bg-red-50"
        };
        
        const bgColor = bgColors[stat.color as keyof typeof bgColors] || "bg-primary/10";
        
        return (
          <Card key={index} className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex flex-col space-y-2 sm:space-y-2.5 md:space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground line-clamp-2 leading-tight">
                    {stat.title}
                  </p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};