import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Clock, Users } from 'lucide-react';

import Footer from '@/components/layout/Footer';
import PedidoOracaoForm from '@/components/PedidoOracaoForm';
import { usePedidosOracao } from '@/hooks/usePedidosOracao';

const PedidosOracao = () => {
  const { pedidosPublicos } = usePedidosOracao();
  const [activeTab, setActiveTab] = useState('enviar');

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'muito_urgente': return 'destructive';
      case 'urgente': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'saude': 'bg-red-100 text-red-800',
      'familia': 'bg-blue-100 text-blue-800',
      'trabalho': 'bg-green-100 text-green-800',
      'financas': 'bg-yellow-100 text-yellow-800',
      'relacionamentos': 'bg-pink-100 text-pink-800',
      'estudos': 'bg-purple-100 text-purple-800',
      'viagem': 'bg-indigo-100 text-indigo-800',
      'ministerio': 'bg-orange-100 text-orange-800',
      'geral': 'bg-gray-100 text-gray-800'
    };
    return colors[categoria] || colors.geral;
  };

  return (
    <div className="min-h-screen bg-background">
      

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Pedidos de Oração
          </h1>
          <p className="text-xl opacity-90">
            Compartilhe suas necessidades e ore pelos pedidos da comunidade
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="enviar" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Enviar Pedido</span>
            </TabsTrigger>
            <TabsTrigger value="publicos" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Pedidos Públicos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enviar" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-playfair font-bold mb-4">
                Envie seu Pedido de Oração
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nossa comunidade está aqui para interceder por você. Compartilhe suas necessidades 
                e permita que oremos juntos por sua situação.
              </p>
            </div>
            
            <PedidoOracaoForm onSuccess={() => setActiveTab('publicos')} />
            
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    Como Funciona
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-semibold mb-1">1. Compartilhe</h4>
                      <p className="text-muted-foreground">
                        Conte-nos sua necessidade de oração de forma confidencial ou pública.
                      </p>
                    </div>
                    <div>
                      <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-semibold mb-1">2. Comunidade</h4>
                      <p className="text-muted-foreground">
                        Nossa comunidade recebe e ora pelos pedidos durante os cultos e reuniões.
                      </p>
                    </div>
                    <div>
                      <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-semibold mb-1">3. Acompanhamento</h4>
                      <p className="text-muted-foreground">
                        Acompanhamos os pedidos e celebramos as respostas de Deus juntos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publicos" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-playfair font-bold mb-4">
                Pedidos de Oração da Comunidade
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Una-se em oração pelos pedidos compartilhados publicamente por nossa comunidade.
              </p>
            </div>

            {pedidosPublicos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum pedido público no momento</h3>
                  <p className="text-muted-foreground">
                    Seja o primeiro a compartilhar um pedido público para que a comunidade possa orar junto.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pedidosPublicos.map((pedido) => (
                  <Card key={pedido.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{pedido.nome}</h3>
                        <div className="flex space-x-2">
                          <Badge variant={getUrgenciaColor(pedido.urgencia) as any} className="text-xs">
                            {pedido.urgencia.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(pedido.categoria)}`}>
                          {pedido.categoria.charAt(0).toUpperCase() + pedido.categoria.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-3">
                        {pedido.pedido}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          Em oração
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default PedidosOracao;