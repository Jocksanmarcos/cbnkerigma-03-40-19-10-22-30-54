import { useEffect } from 'react';
import { MapPin, Heart, Users, Globe, Mail, Instagram } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Missoes = () => {
  const missionarios = [
    {
      id: 1,
      nome: "Pastor Hércules Ruivo e Família",
      pais: "Brasil",
      regiao: "Evangelização Nacional",
      instagram: "https://www.instagram.com/herculesruivo/",
      foto: "/lovable-uploads/pastor-hercules.jpg",
      descricao: "Pastor Hércules Ruivo dedica sua vida ao ministério evangelístico, levando a palavra de Deus através de pregações poderosas e trabalho missionário. Junto com sua família, desenvolve um trabalho abençoado na evangelização e no discipulado.",
      ministerio: "Evangelização e Plantação de Igrejas",
      tempoMissao: "Mais de 15 anos",
      especialidades: ["Evangelização", "Pregação", "Discipulado", "Plantação de Igrejas"]
    },
    {
      id: 2,
      nome: "Pastor Denilson e Família",
      pais: "República Dominicana",
      regiao: "América Central",
      foto: "/lovable-uploads/pastor-denilson.jpg",
      descricao: "Pastor Denilson e sua família servem fielmente na República Dominicana, levando o evangelho de Cristo para comunidades hispanas. Seu trabalho inclui plantação de igrejas, evangelização e formação de líderes locais.",
      ministerio: "Missões Transculturais",
      tempoMissao: "8 anos",
      especialidades: ["Missões Transculturais", "Formação de Líderes", "Evangelização", "Plantação de Igrejas"]
    },
    {
      id: 3,
      nome: "Pastor Beethoven e Família",
      pais: "Jordânia",
      regiao: "Oriente Médio",
      foto: "/lovable-uploads/pastor-beethoven.jpg",
      descricao: "Pastor Beethoven e sua família exercem um ministério desafiador e corajoso na Jordânia, no coração do Oriente Médio. Trabalham com refugiados, evangelização contextualizada e fortalecimento da igreja local em uma região de grande necessidade espiritual.",
      ministerio: "Missões no Oriente Médio",
      tempoMissao: "5 anos",
      especialidades: ["Missões no Oriente Médio", "Trabalho com Refugiados", "Evangelização Contextualizada", "Assistência Humanitária"]
    }
  ];

  useEffect(() => {
    document.title = "Missões - Comunidade Batista Nacional Kerigma";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Conheça os trabalhos missionários apoiados pela CBN Kerigma. Pastor Hércules Ruivo no Brasil, Pastor Denilson na República Dominicana e Pastor Beethoven na Jordânia, levando o evangelho até os confins da terra.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Missões CBN Kerigma</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Levando o Evangelho
            <br />
            até os Confins da Terra
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A Comunidade Batista Nacional Kerigma apoia e envia missionários para levar a mensagem do Reino de Deus 
            a diferentes culturas e nações, cumprindo a Grande Comissão de Jesus Cristo.
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>3 Famílias Missionárias</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>3 Países</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Mais de 20 anos de experiência</span>
            </div>
          </div>
        </div>

        {/* Missão e Visão */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Apoiar e enviar missionários comprometidos com a evangelização mundial, 
                proporcionando suporte espiritual, financeiro e logístico para que possam 
                cumprir o chamado de Deus em suas vidas e ministérios.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Nossa Visão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ver o Reino de Deus expandido através de missionários bem preparados e equipados, 
                plantando igrejas saudáveis e formando discípulos em diferentes culturas e nações 
                ao redor do mundo.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Missionários */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nossos Missionários
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça as famílias missionárias que apoiamos e acompanhe o trabalho 
              que Deus está realizando através de suas vidas.
            </p>
          </div>

          <div className="grid lg:grid-cols-1 gap-8">
            {missionarios.map((missionario) => (
              <Card key={missionario.id} className="overflow-hidden">
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  {/* Imagem */}
                  <div className="md:col-span-1">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Users className="w-16 h-16 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold">{missionario.nome}</h3>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {missionario.pais}
                        </Badge>
                      </div>
                      <p className="text-primary font-medium mb-1">{missionario.ministerio}</p>
                      <p className="text-sm text-muted-foreground">{missionario.regiao} • {missionario.tempoMissao}</p>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      {missionario.descricao}
                    </p>

                    <div>
                      <h4 className="font-medium mb-2">Áreas de Atuação:</h4>
                      <div className="flex flex-wrap gap-2">
                        {missionario.especialidades.map((especialidade, index) => (
                          <Badge key={index} variant="secondary">
                            {especialidade}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {missionario.instagram && (
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <a 
                            href={missionario.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Instagram className="w-4 h-4" />
                            Seguir no Instagram
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-muted/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Seja Parte desta Obra
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Você também pode participar do trabalho missionário através de suas orações, 
            ofertas e suporte. Juntos, podemos levar o amor de Cristo até os confins da terra.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/contato">
                <Mail className="w-4 h-4 mr-2" />
                Entre em Contato
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/dizimos">
                <Heart className="w-4 h-4 mr-2" />
                Fazer uma Oferta
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Missoes;