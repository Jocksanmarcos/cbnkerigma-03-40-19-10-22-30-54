import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Heart,
  Coffee,
  Music
} from "lucide-react";

interface Event {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim?: string;
  local: string;
  endereco?: string;
  capacidade?: number;
  tipo: string;
  inscricoes_abertas: boolean;
}

interface EventRegistrationProps {
  event: Event;
  className?: string;
}

const EventRegistration = ({ event, className = "" }: EventRegistrationProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    idade_faixa: "",
    primeira_participacao: "",
    necessidades_especiais: "",
    como_soube: "",
    acompanhantes: "",
    observacoes: ""
  });

  const handleInputChange = (field: string, value: string) => {
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
          assunto: `Inscrição para Evento: ${event.titulo}`,
          mensagem: `
            Evento: ${event.titulo}
            Data: ${new Date(event.data_inicio).toLocaleDateString('pt-BR')}
            Local: ${event.local}
            
            Dados da Inscrição:
            Faixa Etária: ${formData.idade_faixa}
            Primeira Participação: ${formData.primeira_participacao}
            Necessidades Especiais: ${formData.necessidades_especiais}
            Como Soube: ${formData.como_soube}
            Acompanhantes: ${formData.acompanhantes}
            
            Observações: ${formData.observacoes}
          `,
          status: 'inscricao_evento'
        });

      if (error) throw error;

      toast({
        title: "Inscrição realizada com sucesso! 🎉",
        description: `Sua inscrição para "${event.titulo}" foi confirmada. Você receberá mais informações em breve.`,
      });

      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        idade_faixa: "",
        primeira_participacao: "",
        necessidades_especiais: "",
        como_soube: "",
        acompanhantes: "",
        observacoes: ""
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

  const getEventTypeIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'culto':
        return <Heart className="w-5 h-5" />;
      case 'conferencia':
        return <Users className="w-5 h-5" />;
      case 'encontro':
        return <Coffee className="w-5 h-5" />;
      case 'louvor':
        return <Music className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'culto':
        return 'bg-primary text-white';
      case 'conferencia':
        return 'bg-accent text-white';
      case 'encontro':
        return 'bg-secondary text-white';
      case 'louvor':
        return 'bg-gradient-primary text-white';
      default:
        return 'bg-muted text-foreground';
    }
  };

  if (!event.inscricoes_abertas) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Inscrições Encerradas</h3>
          <p className="text-muted-foreground">
            As inscrições para este evento foram encerradas ou ainda não foram abertas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{event.titulo}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getEventTypeColor(event.tipo)}>
                {getEventTypeIcon(event.tipo)}
                <span className="ml-1">{event.tipo}</span>
              </Badge>
              {event.inscricoes_abertas && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Inscrições Abertas
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(event.data_inicio).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            {new Date(event.data_inicio).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            {event.local}
          </div>
        </div>

        {event.descricao && (
          <p className="text-muted-foreground mt-4">{event.descricao}</p>
        )}
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 md:space-y-6">
            {/* Dados pessoais em layout mobile-first */}
            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
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
            </div>

            <div>
              <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
              <Input
                id="telefone"
                required
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="mt-2"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              <div>
                <Label htmlFor="idade_faixa">Faixa Etária</Label>
                <Select onValueChange={(value) => handleInputChange('idade_faixa', value)}>
                  <SelectTrigger className="input-mobile mt-2">
                    <SelectValue placeholder="Selecione sua faixa etária" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border border-border">
                    <SelectItem value="crianca">Criança (0-12 anos)</SelectItem>
                    <SelectItem value="adolescente">Adolescente (13-17 anos)</SelectItem>
                    <SelectItem value="jovem">Jovem (18-30 anos)</SelectItem>
                    <SelectItem value="adulto">Adulto (31-55 anos)</SelectItem>
                    <SelectItem value="senior">Senior (56+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="acompanhantes">Número de acompanhantes</Label>
                <Select onValueChange={(value) => handleInputChange('acompanhantes', value)}>
                  <SelectTrigger className="input-mobile mt-2">
                    <SelectValue placeholder="Quantos acompanhantes?" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border border-border">
                    <SelectItem value="0">Nenhum</SelectItem>
                    <SelectItem value="1">1 pessoa</SelectItem>
                    <SelectItem value="2">2 pessoas</SelectItem>
                    <SelectItem value="3">3 pessoas</SelectItem>
                    <SelectItem value="4+">4 ou mais pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="primeira_participacao">É sua primeira participação em eventos da CBN Kerigma?</Label>
              <Select onValueChange={(value) => handleInputChange('primeira_participacao', value)}>
                <SelectTrigger className="input-mobile mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover border border-border">
                  <SelectItem value="sim">Sim, é minha primeira vez</SelectItem>
                  <SelectItem value="nao">Não, já participei antes</SelectItem>
                  <SelectItem value="membro">Sou membro da igreja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="como_soube">Como soube do evento?</Label>
              <Select onValueChange={(value) => handleInputChange('como_soube', value)}>
                <SelectTrigger className="input-mobile mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover border border-border">
                  <SelectItem value="redes_sociais">Redes sociais</SelectItem>
                  <SelectItem value="amigo">Indicação de amigo</SelectItem>
                  <SelectItem value="igreja">Na igreja</SelectItem>
                  <SelectItem value="celula">Na célula</SelectItem>
                  <SelectItem value="site">Site da igreja</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="necessidades_especiais">Necessidades especiais ou restrições alimentares</Label>
              <Textarea
                id="necessidades_especiais"
                placeholder="Descreva qualquer necessidade especial, restrição alimentar ou acessibilidade..."
                value={formData.necessidades_especiais}
                onChange={(e) => handleInputChange('necessidades_especiais', e.target.value)}
                className="mt-2 min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações (Opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Alguma observação ou pergunta sobre o evento..."
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                className="mt-2 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg border border-input hover:bg-accent/5 transition-colors">
            <Checkbox 
              id="termos" 
              required 
              className="checkbox-mobile mt-0.5"
            />
            <Label htmlFor="termos" className="text-sm font-normal cursor-pointer">
              Concordo em receber informações sobre este evento e outros eventos da CBN Kerigma. 
              Posso cancelar a qualquer momento.
            </Label>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="w-full button-mobile"
          >
            {isSubmitting ? "Realizando inscrição..." : "Confirmar Inscrição"}
            <CheckCircle className="ml-2 w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </form>

        {event.capacidade && (
          <div className="mt-6 p-4 bg-accent/10 rounded-lg">
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-accent" />
              <span className="font-medium">Vagas limitadas:</span>
              <span className="ml-1">Capacidade para {event.capacidade} pessoas</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventRegistration;