import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  Users, 
  Clock, 
  MapPin, 
  Music, 
  BookOpen, 
  Coffee, 
  Handshake,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail
} from "lucide-react";

const PrimeiraVez = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    idade_faixa: "",
    primeira_igreja: "",
    como_conheceu: "",
    interesse_celula: false,
    interesse_batismo: false,
    interesse_voluntario: false,
    mensagem: ""
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contatos')
        .insert({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          assunto: 'Primeira Vez - Formulário de Boas-vindas',
          mensagem: `
            Faixa Etária: ${formData.idade_faixa}
            Primeira Igreja: ${formData.primeira_igreja}
            Como conheceu: ${formData.como_conheceu}
            Interesse em Célula: ${formData.interesse_celula ? 'Sim' : 'Não'}
            Interesse em Batismo: ${formData.interesse_batismo ? 'Sim' : 'Não'}
            Interesse em Voluntariado: ${formData.interesse_voluntario ? 'Sim' : 'Não'}
            
            Mensagem: ${formData.mensagem}
          `,
          status: 'primeira_vez'
        });

      if (error) throw error;

      toast({
        title: "Bem-vindo(a) à família CBN Kerigma! 🎉",
        description: "Seu formulário foi enviado com sucesso. Nossa equipe entrará em contato em breve!",
      });

      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        idade_faixa: "",
        primeira_igreja: "",
        como_conheceu: "",
        interesse_celula: false,
        interesse_batismo: false,
        interesse_voluntario: false,
        mensagem: ""
      });

    } catch (error) {
      toast({
        title: "Erro ao enviar formulário",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cultoSteps = [
    {
      icon: Music,
      title: "Louvor e Adoração",
      description: "Começamos com músicas que elevam nossos corações a Deus",
      time: "15-20 minutos"
    },
    {
      icon: Heart,
      title: "Momento de Oração",
      description: "Tempo especial para conversar com Deus e apresentar nossas gratidões",
      time: "10 minutos"
    },
    {
      icon: BookOpen,
      title: "Palavra de Deus",
      description: "Mensagem bíblica aplicada à vida prática",
      time: "30-40 minutos"
    },
    {
      icon: Handshake,
      title: "Comunhão",
      description: "Momento de interação e boas-vindas aos visitantes",
      time: "10 minutos"
    }
  ];

  const acolhimentoTeam = [
    {
      name: "Equipe de Recepção",
      role: "Primeiro contato",
      description: "Te receberá na entrada com um sorriso caloroso"
    },
    {
      name: "Líderes de Célula",
      role: "Conexão",
      description: "Ajudarão você a encontrar uma célula próxima"
    },
    {
      name: "Pastores",
      role: "Cuidado pastoral",
      description: "Disponíveis para oração e aconselhamento"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-playfair font-bold mb-6">
              Seja Bem-vindo(a)!
            </h1>
            <p className="text-xl lg:text-2xl mb-4 font-light">
              Primeira vez na CBN Kerigma?
            </p>
            <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Estamos muito felizes em ter você aqui! Esta página foi criada especialmente 
              para te ajudar a se sentir em casa e conhecer melhor nossa comunidade.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3 animate-pulse"
              onClick={() => document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Como é um Culto */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-foreground mb-4">
              Como é um Culto na CBN Kerigma?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nossos cultos são momentos especiais de encontro com Deus e com a família da fé. 
              Aqui está o que você pode esperar:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cultoSteps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 animate-scale-in" 
                    style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  <div className="inline-flex items-center text-sm text-primary font-medium">
                    <Clock className="w-4 h-4 mr-1" />
                    {step.time}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto card-glass">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4">Informações Práticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary" />
                      Horários dos Cultos
                    </h4>
                    <p className="text-muted-foreground">
                      Domingo: 19h00<br />
                      Quarta: 19h30<br />
                      Sábado: 19h30
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      Localização
                    </h4>
                    <p className="text-muted-foreground">
                      Bairro Aurora<br />
                      São Luís - MA<br />
                      Estacionamento disponível
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-center">
                    <strong>Dress Code:</strong> Venha como se sentir confortável! 
                    O importante é sua presença, não sua roupa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Equipe de Acolhimento */}
      <section className="section-padding bg-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-foreground mb-4">
              Nossa Equipe de Acolhimento
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Temos uma equipe especialmente preparada para receber você e sua família com muito carinho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {acolhimentoTeam.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Boas-vindas */}
      <section id="formulario" className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-foreground mb-4">
              Formulário de Boas-vindas
            </h2>
            <p className="text-lg text-muted-foreground">
              Nos conte um pouco sobre você para que possamos te acolher melhor!
            </p>
          </div>

          <Card className="card-glass">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idade_faixa">Faixa Etária</Label>
                    <Select onValueChange={(value) => handleInputChange('idade_faixa', value)} value={formData.idade_faixa}>
                      <SelectTrigger className="mt-1 input-mobile">
                        <SelectValue placeholder="Selecione sua faixa etária" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999] bg-popover border border-border max-h-[200px]">
                        <SelectItem value="18-25">18-25 anos</SelectItem>
                        <SelectItem value="26-35">26-35 anos</SelectItem>
                        <SelectItem value="36-45">36-45 anos</SelectItem>
                        <SelectItem value="46-55">46-55 anos</SelectItem>
                        <SelectItem value="56+">56+ anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="primeira_igreja">Esta é sua primeira vez em uma igreja?</Label>
                    <Select onValueChange={(value) => handleInputChange('primeira_igreja', value)} value={formData.primeira_igreja}>
                      <SelectTrigger className="mt-1 input-mobile">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999] bg-popover border border-border max-h-[200px]">
                        <SelectItem value="sim">Sim, é minha primeira vez</SelectItem>
                        <SelectItem value="nao_ha_tempo">Não, mas faz tempo que não frequento</SelectItem>
                        <SelectItem value="nao_frequento">Não, frequento outra igreja</SelectItem>
                        <SelectItem value="nao_primeira">Não, já frequentei outras igrejas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="como_conheceu">Como conheceu a CBN Kerigma?</Label>
                    <Select onValueChange={(value) => handleInputChange('como_conheceu', value)} value={formData.como_conheceu}>
                      <SelectTrigger className="mt-1 input-mobile">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999] bg-popover border border-border max-h-[200px]">
                        <SelectItem value="amigo">Indicação de amigo/familiar</SelectItem>
                        <SelectItem value="redes_sociais">Redes sociais</SelectItem>
                        <SelectItem value="google">Pesquisa no Google</SelectItem>
                        <SelectItem value="celula">Participei de uma célula</SelectItem>
                        <SelectItem value="evento">Evento da igreja</SelectItem>
                        <SelectItem value="passando">Passando em frente</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tenho interesse em:</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interesse_celula"
                      checked={formData.interesse_celula}
                      onCheckedChange={(checked) => handleInputChange('interesse_celula', checked)}
                    />
                    <Label htmlFor="interesse_celula" className="text-sm font-normal">
                      Participar de uma célula (grupo pequeno de estudo bíblico)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interesse_batismo"
                      checked={formData.interesse_batismo}
                      onCheckedChange={(checked) => handleInputChange('interesse_batismo', checked)}
                    />
                    <Label htmlFor="interesse_batismo" className="text-sm font-normal">
                      Informações sobre batismo
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interesse_voluntario"
                      checked={formData.interesse_voluntario}
                      onCheckedChange={(checked) => handleInputChange('interesse_voluntario', checked)}
                    />
                    <Label htmlFor="interesse_voluntario" className="text-sm font-normal">
                      Oportunidades de voluntariado
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mensagem">Mensagem ou Pergunta (Opcional)</Label>
                  <Textarea
                    id="mensagem"
                    placeholder="Compartilhe conosco suas expectativas, dúvidas ou como podemos te ajudar..."
                    value={formData.mensagem}
                    onChange={(e) => handleInputChange('mensagem', e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Formulário"}
                  <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contato Direto */}
      <section className="section-padding bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold mb-6">
            Precisa de Ajuda Imediata?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Nossa equipe está sempre disponível para te ajudar!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 font-semibold"
            >
              <a href="https://wa.me/5598988734670" target="_blank" rel="noopener noreferrer">
                <Phone className="mr-2 w-5 h-5" />
                WhatsApp: (98) 98873-4670
              </a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <a href="mailto:contato@cbnkerigma.org.br">
                <Mail className="mr-2 w-5 h-5" />
                contato@cbnkerigma.org.br
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrimeiraVez;