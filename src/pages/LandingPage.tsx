import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Heart, 
  Gift, 
  Star, 
  Church,
  ArrowLeft,
  Share2,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LandingPageData {
  id: string;
  title: string;
  slug: string;
  description: string;
  template: string;
  theme: 'christmas' | 'easter' | 'campaign' | 'event' | 'custom';
  customizations: {
    primaryColor: string;
    backgroundImage?: string;
    ctaText: string;
    ctaLink: string;
  };
}

// Sample landing pages data (in a real app, this would come from your database)
const landingPagesData: LandingPageData[] = [
  {
    id: '1',
    title: 'Campanha de Natal 2024',
    slug: 'natal-2024',
    description: 'Uma campanha especial para celebrar o nascimento de Jesus',
    template: 'christmas-campaign',
    theme: 'christmas',
    customizations: {
      primaryColor: '#dc2626',
      ctaText: 'Participar da Campanha',
      ctaLink: '/contato'
    }
  },
  {
    id: '2',
    title: 'Encontre sua Célula',
    slug: 'encontre-celula',
    description: 'Conecte-se com uma comunidade perto de você',
    template: 'cell-recruitment',
    theme: 'campaign',
    customizations: {
      primaryColor: '#059669',
      ctaText: 'Encontrar Minha Célula',
      ctaLink: '/celulas'
    }
  }
];

const ChristmasTemplate = ({ page }: { page: LandingPageData }) => (
  <div className="min-h-screen">
    {/* Hero Section */}
    <section 
      className="relative overflow-hidden py-24 text-white"
      style={{ backgroundColor: page.customizations.primaryColor }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <Gift className="w-16 h-16 mx-auto mb-6 text-white/90" />
        <h1 className="text-5xl lg:text-7xl font-playfair font-bold mb-6">
          {page.title}
        </h1>
        <p className="text-xl lg:text-2xl mb-8 opacity-90">
          {page.description}
        </p>
        <Button 
          size="lg" 
          className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-4"
          onClick={() => window.location.href = page.customizations.ctaLink}
        >
          <Gift className="mr-2 w-5 h-5" />
          {page.customizations.ctaText}
        </Button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
    </section>

    {/* Features Section */}
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Por que participar?</h2>
          <p className="text-lg text-muted-foreground">Celebre o amor de Deus conosco</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunhão</h3>
              <p className="text-muted-foreground">
                Momentos especiais de união e celebração em família
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Generosidade</h3>
              <p className="text-muted-foreground">
                Oportunidade de abençoar outras famílias
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Esperança</h3>
              <p className="text-muted-foreground">
                Renovação da fé e esperança em Cristo
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section 
      className="py-16 text-white text-center"
      style={{ backgroundColor: page.customizations.primaryColor }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Não perca esta celebração especial!</h2>
        <p className="text-xl mb-8 opacity-90">
          Junte-se a nós e faça parte desta campanha abençoada
        </p>
        <Button 
          size="lg" 
          className="bg-white font-semibold px-8 py-4"
          style={{ color: page.customizations.primaryColor }}
          onClick={() => window.location.href = page.customizations.ctaLink}
        >
          {page.customizations.ctaText}
        </Button>
      </div>
    </section>
  </div>
);

const CellRecruitmentTemplate = ({ page }: { page: LandingPageData }) => (
  <div className="min-h-screen">
    {/* Hero Section */}
    <section 
      className="relative overflow-hidden py-24 text-white"
      style={{ backgroundColor: page.customizations.primaryColor }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <Users className="w-16 h-16 mx-auto mb-6 text-white/90" />
        <h1 className="text-5xl lg:text-7xl font-playfair font-bold mb-6">
          {page.title}
        </h1>
        <p className="text-xl lg:text-2xl mb-8 opacity-90">
          {page.description}
        </p>
        <Button 
          size="lg" 
          className="bg-white font-semibold px-8 py-4"
          style={{ color: page.customizations.primaryColor }}
          onClick={() => window.location.href = page.customizations.ctaLink}
        >
          <Users className="mr-2 w-5 h-5" />
          {page.customizations.ctaText}
        </Button>
      </div>
    </section>

    {/* Benefits Section */}
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Por que fazer parte de uma célula?</h2>
          <p className="text-lg text-muted-foreground">Descubra os benefícios da vida em comunidade</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Relacionamentos Profundos</h3>
              <p className="text-muted-foreground">
                Construa amizades verdadeiras e duradouras em um ambiente acolhedor
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Church className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Crescimento Espiritual</h3>
              <p className="text-muted-foreground">
                Cresça na fé através do estudo bíblico e oração em grupo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Apoio Mútuo</h3>
              <p className="text-muted-foreground">
                Encontre suporte nos momentos difíceis e celebre as vitórias juntos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </div>
);

const LandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const page = landingPagesData.find(p => p.slug === slug);
      if (page) {
        setPageData(page);
      }
    }
    setLoading(false);
  }, [slug]);

  const sharePageUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description: "Link da página copiado para a área de transferência"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Página não encontrada</h1>
          <p className="text-muted-foreground">A página que você está procurando não existe.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const renderTemplate = () => {
    switch (pageData.template) {
      case 'christmas-campaign':
        return <ChristmasTemplate page={pageData} />;
      case 'cell-recruitment':
        return <CellRecruitmentTemplate page={pageData} />;
      default:
        return <ChristmasTemplate page={pageData} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Fixed Header with Actions */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={sharePageUrl}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/', '_blank')}
            className="bg-white/90 backdrop-blur-sm"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Page Content */}
      {renderTemplate()}
    </div>
  );
};

export default LandingPage;