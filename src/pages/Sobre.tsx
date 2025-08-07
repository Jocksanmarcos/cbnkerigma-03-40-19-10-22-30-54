import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { Heart, Users, Church, BookOpen, Target, Star, User } from "lucide-react";
import { useLideranca } from "@/hooks/useLideranca";
import pastorJoao from "@/assets/pastor-joao-silva.jpg";
import pastoraMaria from "@/assets/pastora-maria-santos.jpg";
import pastorCarlos from "@/assets/pastor-carlos-lima.jpg";

const Sobre = () => {
  const { fetchLideresAtivos } = useLideranca();
  const [lideres, setLideres] = useState<any[]>([]);

  useEffect(() => {
    const carregarLideres = async () => {
      const lideresAtivos = await fetchLideresAtivos();
      setLideres(lideresAtivos);
    };
    carregarLideres();
  }, [fetchLideresAtivos]);

  // Fallback para as imagens antigas se não houver dados do banco
  const getImagemLider = (fotoUrl: string) => {
    if (fotoUrl?.includes('pastor-joao-silva')) return pastorJoao;
    if (fotoUrl?.includes('pastora-maria-santos')) return pastoraMaria;
    if (fotoUrl?.includes('pastor-carlos-lima')) return pastorCarlos;
    return fotoUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Nossa História
          </h1>
          <p className="text-xl opacity-90">
            Conheça a trajetória da Comunidade Batista Nacional Kerigma
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-playfair font-bold mb-6 text-center">A História da CBN Kerigma</h2>
              <div className="prose max-w-none text-muted-foreground space-y-6">
                <p>
                  A Comunidade Batista Nacional Kerigma nasceu em 2019 com o sonho de ser uma igreja diferente, 
                  focada no modelo de células como estratégia de evangelismo e relacionamento. O nome "Kerigma" 
                  vem do grego e significa "proclamação", refletindo nossa missão de proclamar o Evangelho através 
                  de relacionamentos autênticos.
                </p>
                <p>
                  Iniciamos com um pequeno grupo de famílias comprometidas com a visão de crescer através de células. 
                  Hoje, somos uma comunidade de mais de 200 membros ativos, organizados em mais de 15 células 
                  espalhadas pela região metropolitana de São Luís.
                </p>
                <p>
                  Nossa filosofia ministerial se baseia no princípio de que cada pessoa importa para Deus e 
                  merece ser alcançada com amor e cuidado genuíno. Por isso, priorizamos relacionamentos 
                  profundos e duradouros, onde cada membro é valorizado e tem a oportunidade de crescer 
                  espiritualmente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="section-padding bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12">
            Nossos Pilares
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold mb-4">Missão</h3>
                <p className="text-muted-foreground">
                  Formar discípulos de Jesus Cristo através do modelo de células, 
                  promovendo evangelismo relacional e crescimento espiritual em comunidade.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold mb-4">Visão</h3>
                <p className="text-muted-foreground">
                  Ser uma igreja em células que transforma vidas e multiplica discípulos, 
                  impactando nossa cidade e região com o amor de Cristo.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold mb-4">Valores</h3>
                <ul className="text-muted-foreground text-left space-y-2">
                  <li>• Amor genuíno</li>
                  <li>• Comunhão verdadeira</li>
                  <li>• Crescimento contínuo</li>
                  <li>• Evangelismo relacional</li>
                  <li>• Multiplicação saudável</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Liderança */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12">
            Nossa Liderança
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lideres.length > 0 ? (
              lideres.map((lider) => (
                <Card key={lider.id} className="text-center">
                  <CardContent className="p-6">
                    {lider.foto_url ? (
                      <img 
                        src={getImagemLider(lider.foto_url)} 
                        alt={lider.nome} 
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center border-4 border-primary/20">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <h3 className="text-xl font-playfair font-semibold mb-2">{lider.cargo}</h3>
                    <p className="text-primary font-medium mb-2">{lider.nome}</p>
                    {lider.descricao && (
                      <p className="text-muted-foreground text-sm">
                        {lider.descricao}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback para quando não há dados do banco
              <>
                <Card className="text-center">
                  <CardContent className="p-6">
                    <img 
                      src={pastorJoao} 
                      alt="Pastor João Silva" 
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                    />
                    <h3 className="text-xl font-playfair font-semibold mb-2">Pastor Principal</h3>
                    <p className="text-primary font-medium mb-2">Pr. João Silva</p>
                    <p className="text-muted-foreground text-sm">
                      Liderando com amor e dedicação há 5 anos, focado no crescimento espiritual da igreja.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <img 
                      src={pastoraMaria} 
                      alt="Pastora Maria Santos" 
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                    />
                    <h3 className="text-xl font-playfair font-semibold mb-2">Coordenação de Células</h3>
                    <p className="text-primary font-medium mb-2">Pr. Maria Santos</p>
                    <p className="text-muted-foreground text-sm">
                      Responsável pelo desenvolvimento e crescimento do ministério de células.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <img 
                      src={pastorCarlos} 
                      alt="Pastor Carlos Lima" 
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                    />
                    <h3 className="text-xl font-playfair font-semibold mb-2">Ministério de Ensino</h3>
                    <p className="text-primary font-medium mb-2">Pr. Carlos Lima</p>
                    <p className="text-muted-foreground text-sm">
                      Dedicado ao ensino da Palavra e formação de novos líderes.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sobre;