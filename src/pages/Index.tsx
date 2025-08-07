import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePasswordResetRedirect } from '@/hooks/usePasswordResetRedirect';

import Footer from "@/components/layout/Footer";
import DailyVerse from "@/components/DailyVerse";
import FabContact from "@/components/ui/fab-contact";


import NewsletterSignup from "@/components/NewsletterSignup";
import { Calendar, Users, Heart, MapPin, ArrowRight, Church, BookOpen, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useConteudoPagina } from "@/hooks/useConteudo";
import { useEstatisticas } from "@/hooks/useEstatisticas";

const Index = () => {
  // Hook para interceptar tokens de reset em qualquer página
  usePasswordResetRedirect();
  
  const { getConteudo, loading } = useConteudoPagina();
  const { getEstatisticaPorChave } = useEstatisticas();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative morphing-bg text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/30 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-6 animate-fade-in">
              <h1 className="text-4xl lg:text-7xl font-playfair font-bold mb-2 text-glow">
                {getConteudo('hero_titulo', 'Igreja em Células')}
              </h1>
              <div className="w-24 h-1 bg-white mx-auto rounded-full opacity-80"></div>
            </div>
            <p className="text-xl lg:text-3xl mb-4 font-light text-white animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Evangelismo e Relacionamento
            </p>
            <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              {getConteudo('hero_subtitulo', 'Bem-vindo à Comunidade Batista Nacional Kerigma, onde cada pessoa é valorizada e encontra seu lugar na família de Deus através das células.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <Button asChild size="lg" className="glow-effect bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-2xl">
                <Link to="/primeira-vez">
                  Primeira Vez Aqui?
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg backdrop-blur-sm bg-white/10 hover:scale-105 transition-all duration-300">
                <Link to="/celulas">
                  Encontrar uma Célula
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Daily Verse Section */}
      <DailyVerse />

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-white to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent/5 rounded-full animate-bounce-gentle"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold gradient-text mb-4">
              Nossa Igreja em Números
            </h2>
            <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="floating-card bg-white rounded-2xl p-8 animate-scale-in">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 glow-effect">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-3">{getEstatisticaPorChave('celulas_ativas')}</h3>
              <p className="text-muted-foreground text-lg">Células Ativas</p>
            </div>
            <div className="floating-card bg-white rounded-2xl p-8 animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 glow-effect">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-3">{getEstatisticaPorChave('membros_ativos')}</h3>
              <p className="text-muted-foreground text-lg">Membros Ativos</p>
            </div>
            <div className="floating-card bg-white rounded-2xl p-8 animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 glow-effect">
                <Church className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-3">{getEstatisticaPorChave('anos_ministerio')}</h3>
              <p className="text-muted-foreground text-lg">Anos de Ministério</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-br from-accent/10 via-white to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-primary rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-16 w-28 h-28 bg-gradient-secondary rounded-full opacity-10 animate-bounce-gentle"></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-playfair font-bold mb-6">
              <span className="gradient-text-animated">Por que as Células?</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              As células são o coração da nossa igreja, onde relacionamentos profundos são formados 
              e vidas são transformadas através do amor de Cristo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="floating-card card-glass group animate-slide-up overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 glow-effect group-hover:animate-bounce-gentle">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-playfair font-bold mb-4 gradient-text">Relacionamentos</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Construa amizades verdadeiras e duradouras em um ambiente acolhedor e familiar.
                </p>
              </CardContent>
            </Card>

            <Card className="floating-card card-glass group animate-slide-up overflow-hidden" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-secondary opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 glow-effect group-hover:animate-bounce-gentle">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-playfair font-bold mb-4 gradient-text">Crescimento</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Cresça na fé através do estudo bíblico e compartilhamento de experiências.
                </p>
              </CardContent>
            </Card>

            <Card className="floating-card card-glass group animate-slide-up overflow-hidden" style={{ animationDelay: "0.4s" }}>
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 glow-effect group-hover:animate-bounce-gentle">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-playfair font-bold mb-4 gradient-text">Propósito</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Descubra seus dons e talentos enquanto serve ao Reino de Deus.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding morphing-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-6 h-6 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-20 right-32 w-4 h-4 bg-white/30 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-8 h-8 bg-white/15 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 right-20 w-5 h-5 bg-white/25 rounded-full animate-bounce-gentle" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl lg:text-5xl font-playfair font-bold mb-8 text-glow">
            <span className="inline-block animate-bounce-gentle">Pronto para</span>{" "}
            <span className="inline-block animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>Fazer</span>{" "}
            <span className="inline-block animate-bounce-gentle" style={{ animationDelay: '0.4s' }}>Parte?</span>
          </h2>
          <div className="w-32 h-1 bg-white mx-auto rounded-full mb-8 opacity-80"></div>
          <p className="text-xl lg:text-2xl mb-12 opacity-90 leading-relaxed">
            Encontre uma célula perto de você e comece sua jornada de fé e comunhão.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="glow-effect bg-white text-primary hover:bg-gray-100 font-bold px-10 py-4 text-lg shadow-2xl">
              <Link to="/celulas">
                <MapPin className="mr-3 w-6 h-6" />
                Encontrar Célula
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-4 text-lg backdrop-blur-sm bg-white/10 hover:scale-105 transition-all duration-300">
              <Link to="/agenda">
                <Calendar className="mr-3 w-6 h-6" />
                Ver Agenda
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-accent/5">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup variant="inline" />
        </div>
      </section>

      <Footer />
      <FabContact />
    </div>
  );
};

export default Index;
