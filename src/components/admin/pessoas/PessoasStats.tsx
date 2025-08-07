import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Crown, Heart, TrendingUp } from 'lucide-react';

interface EstatisticasPessoas {
  total_pessoas: number;
  total_membros: number;
  total_visitantes: number;
  total_lideres: number;
  total_batizados: number;
  total_em_discipulado: number;
  crescimento_mes_atual: number;
  pessoas_por_grupo_etario: Record<string, number>;
  pessoas_por_estado_espiritual: Record<string, number>;
}

interface PessoasStatsProps {
  estatisticas: EstatisticasPessoas;
  loading: boolean;
}

export const PessoasStats: React.FC<PessoasStatsProps> = ({ estatisticas, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pessoas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estatisticas?.total_pessoas || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cadastradas no sistema
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membros Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {estatisticas?.total_membros || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.total_pessoas ? 
                    `${((estatisticas.total_membros / estatisticas.total_pessoas) * 100).toFixed(1)}% do total` : 
                    '0% do total'
                  }
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visitantes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estatisticas?.total_visitantes || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Acompanhamento especial
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Líderes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {estatisticas?.total_lideres || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Em formação e atuação
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Batizados</p>
                <p className="text-2xl font-bold text-rose-600">
                  {estatisticas?.total_batizados || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pessoas batizadas
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-full">
                <Heart className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Discipulado</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {estatisticas?.total_em_discipulado || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pessoas em processo
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Estado Espiritual */}
      {estatisticas?.pessoas_por_estado_espiritual && Object.keys(estatisticas.pessoas_por_estado_espiritual).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Estado Espiritual</CardTitle>
            <CardDescription>
              Classificação das pessoas por nível de desenvolvimento espiritual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticas.pessoas_por_estado_espiritual).map(([estado, total], index) => {
                const percentage = estatisticas.total_pessoas ? 
                  (total / estatisticas.total_pessoas * 100) : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ 
                          backgroundColor: `hsl(${index * 45}, 70%, 60%)` 
                        }}
                      />
                      <span className="font-medium capitalize">
                        {estado.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{total}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribuição por Faixa Etária */}
      {estatisticas?.pessoas_por_grupo_etario && Object.keys(estatisticas.pessoas_por_grupo_etario).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Faixa Etária</CardTitle>
            <CardDescription>
              Classificação das pessoas por idade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticas.pessoas_por_grupo_etario).map(([faixa, total], index) => {
                const percentage = estatisticas.total_pessoas ? 
                  (total / estatisticas.total_pessoas * 100) : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ 
                          backgroundColor: `hsl(${200 + index * 30}, 70%, 60%)` 
                        }}
                      />
                      <span className="font-medium capitalize">
                        {faixa}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{total}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};