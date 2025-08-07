import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Bell, Heart, BookOpen, Calendar } from "lucide-react";

interface NewsletterSignupProps {
  className?: string;
  variant?: "card" | "inline" | "modal";
}

const NewsletterSignup = ({ className = "", variant = "card" }: NewsletterSignupProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    interesses: {
      eventos: false,
      estudos: false,
      celulas: false,
      noticias: false
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interesses: { ...prev.interesses, [interest]: checked }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const interessesText = Object.entries(formData.interesses)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => {
          const labels = {
            eventos: 'Eventos',
            estudos: 'Estudos Bíblicos',
            celulas: 'Células',
            noticias: 'Notícias da Igreja'
          };
          return labels[key as keyof typeof labels];
        })
        .join(', ');

      const { error } = await supabase
        .from('newsletter_inscricoes')
        .insert({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          interesses: interessesText || 'Notícias gerais'
        });

      if (error) throw error;

      toast({
        title: "Inscrição realizada com sucesso! 📧",
        description: "Agora você receberá nossas atualizações por email.",
      });

      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        interesses: {
          eventos: false,
          estudos: false,
          celulas: false,
          noticias: false
        }
      });

    } catch (error) {
      toast({
        title: "Erro ao realizar inscrição",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const interests = [
    { key: "eventos", label: "Eventos especiais", icon: Calendar },
    { key: "estudos", label: "Estudos bíblicos", icon: BookOpen },
    { key: "celulas", label: "Informações sobre células", icon: Heart },
    { key: "noticias", label: "Notícias da igreja", icon: Bell }
  ];

  if (variant === "inline") {
    return (
      <div className={`bg-gradient-primary text-white p-6 rounded-lg ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-semibold">Receba nossas atualizações</h3>
            <p className="text-white/80">Fique por dentro de tudo que acontece na CBN Kerigma</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            <Input
              placeholder="Seu nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12"
              autoComplete="name"
            />
            <Input
              type="email"
              placeholder="Seu email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12"
              autoComplete="email"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-white text-primary hover:bg-white/90 w-full md:w-auto"
          >
            {isSubmitting ? "Inscrevendo..." : "Inscrever-se"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Newsletter CBN Kerigma</h3>
          <p className="text-muted-foreground">
            Receba atualizações sobre eventos, estudos bíblicos e novidades da nossa comunidade
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="telefone">WhatsApp (Opcional)</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-base font-medium">Quero receber informações sobre:</Label>
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 mt-3">
              {interests.map((interest) => (
                <div key={interest.key} className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/5 transition-colors">
                  <Checkbox
                    id={interest.key}
                    checked={formData.interesses[interest.key as keyof typeof formData.interesses]}
                    onCheckedChange={(checked) => handleInterestChange(interest.key, checked as boolean)}
                    className="min-w-[20px] min-h-[20px]"
                  />
                  <Label htmlFor={interest.key} className="flex items-center space-x-2 text-sm font-normal cursor-pointer">
                    <interest.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{interest.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Inscrevendo..." : "Inscrever-se na Newsletter"}
            <Mail className="ml-2 w-5 h-5" />
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Você pode cancelar sua inscrição a qualquer momento. 
            Seus dados estão seguros conosco.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;