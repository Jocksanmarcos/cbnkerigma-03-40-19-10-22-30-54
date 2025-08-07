import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Send, Shield, Users } from "lucide-react";

interface PrayerRequestFormProps {
  className?: string;
  variant?: "card" | "modal" | "inline";
}

const PrayerRequestForm = ({ className = "", variant = "card" }: PrayerRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    categoria: "",
    pedido: "",
    urgencia: "",
    compartilhar: false,
    acompanhamento: false
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
          assunto: `Pedido de Oração - ${formData.categoria}`,
          mensagem: `
            Categoria: ${formData.categoria}
            Urgência: ${formData.urgencia}
            Pode compartilhar: ${formData.compartilhar ? 'Sim' : 'Não'}
            Deseja acompanhamento: ${formData.acompanhamento ? 'Sim' : 'Não'}
            
            Pedido de Oração:
            ${formData.pedido}
          `,
          status: 'pedido_oracao'
        });

      if (error) throw error;

      toast({
        title: "Pedido de oração enviado! 🙏",
        description: "Nossos intercessores estarão orando por você. Deus ouve suas orações!",
      });

      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        categoria: "",
        pedido: "",
        urgencia: "",
        compartilhar: false,
        acompanhamento: false
      });

    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categorias = [
    { value: "saude", label: "Saúde e Cura" },
    { value: "familia", label: "Família e Relacionamentos" },
    { value: "trabalho", label: "Trabalho e Finanças" },
    { value: "espiritual", label: "Crescimento Espiritual" },
    { value: "ministerio", label: "Ministério e Servir" },
    { value: "decisoes", label: "Decisões Importantes" },
    { value: "luto", label: "Luto e Perda" },
    { value: "gratidao", label: "Gratidão e Louvor" },
    { value: "outro", label: "Outro" }
  ];

  const urgencias = [
    { value: "baixa", label: "Baixa - Oração contínua" },
    { value: "media", label: "Média - Oração regular" },
    { value: "alta", label: "Alta - Oração urgente" },
    { value: "critica", label: "Crítica - Oração imediata" }
  ];

  if (variant === "inline") {
    return (
      <div className={`bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Pedido de Oração</h3>
            <p className="text-muted-foreground">Compartilhe seu pedido conosco</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            <Input
              placeholder="Seu nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              type="email"
              placeholder="Seu email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Textarea
            placeholder="Compartilhe seu pedido de oração..."
            value={formData.pedido}
            onChange={(e) => handleInputChange('pedido', e.target.value)}
            required
            className="min-h-[100px]"
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Enviando..." : "Enviar Pedido"}
            <Send className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Pedido de Oração</CardTitle>
            <p className="text-muted-foreground">
              Compartilhe seu pedido e nossa equipe de intercessão estará orando por você
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-accent/10 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent">Privacidade e Confidencialidade</p>
              <p className="text-muted-foreground mt-1">
                Seus pedidos são tratados com absoluta confidencialidade. Apenas nossa equipe 
                de intercessão terá acesso, a menos que você autorize o compartilhamento.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="mt-2"
                autoComplete="name"
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
                className="mt-2"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone/WhatsApp (Opcional)</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="mt-2"
                autoComplete="tel"
              />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria do Pedido</Label>
              <Select onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger className="input-mobile mt-2">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover border border-border">
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="urgencia">Nível de Urgência</Label>
              <Select onValueChange={(value) => handleInputChange('urgencia', value)}>
                <SelectTrigger className="input-mobile mt-2">
                  <SelectValue placeholder="Selecione o nível de urgência" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover border border-border">
                  {urgencias.map((urgencia) => (
                    <SelectItem key={urgencia.value} value={urgencia.value}>
                      {urgencia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="pedido">Seu Pedido de Oração *</Label>
            <Textarea
              id="pedido"
              required
              placeholder="Compartilhe seu pedido de oração. Seja específico para que possamos orar melhor por você..."
              value={formData.pedido}
              onChange={(e) => handleInputChange('pedido', e.target.value)}
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-input hover:bg-accent/5 transition-colors">
              <Checkbox
                id="compartilhar"
                checked={formData.compartilhar}
                onCheckedChange={(checked) => handleInputChange('compartilhar', checked)}
                className="checkbox-mobile mt-0.5"
              />
              <div>
                <Label htmlFor="compartilhar" className="text-sm font-normal cursor-pointer">
                  Autorizo compartilhar este pedido (sem meu nome) com a congregação para oração coletiva
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Seu nome não será mencionado, apenas o pedido de forma geral
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-input hover:bg-accent/5 transition-colors">
              <Checkbox
                id="acompanhamento"
                checked={formData.acompanhamento}
                onCheckedChange={(checked) => handleInputChange('acompanhamento', checked)}
                className="checkbox-mobile mt-0.5"
              />
              <div>
                <Label htmlFor="acompanhamento" className="text-sm font-normal cursor-pointer">
                  Gostaria de acompanhamento pastoral
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Um pastor ou líder entrará em contato para oferecer suporte
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="w-full button-mobile"
          >
            {isSubmitting ? "Enviando pedido..." : "Enviar Pedido de Oração"}
            <Send className="ml-2 w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </form>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Nossa equipe de intercessão ora diariamente às 6h e 18h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerRequestForm;