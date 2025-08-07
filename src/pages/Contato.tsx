import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import Footer from "@/components/layout/Footer";

import MapaGoogle from "@/components/MapaGoogle";
import { Phone, Mail, MapPin, Clock, Send, Instagram, Facebook, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContatos } from "@/hooks/useContatos";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

const Contato = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: ""
  });
  const { toast } = useToast();
  const { enviarContato, isLoading } = useContatos();
  const { apiKey: googleMapsApiKey, isLoading: isLoadingMaps, error: mapsError } = useGoogleMaps();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      assunto: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await enviarContato(formData);
    
    if (result.success) {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        assunto: "",
        mensagem: ""
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl opacity-90">
            Estamos aqui para ouvir você e ajudar no que for necessário
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Informações de Contato */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Contato Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-6 h-6 text-primary" />
                  <span>Contato Direto</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Telefone Principal</p>
                    <p className="text-muted-foreground">(98) 98873-4670</p>
                    <p className="text-sm text-muted-foreground">WhatsApp disponível</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">E-mail</p>
                    <p className="text-muted-foreground">contato@cbnkerigma.org.br</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Endereço</p>
                    <p className="text-muted-foreground">
                      Estrada de Ribamar, Km 2, N.º 5<br />
                      Aurora - São Luís - MA, Brasil
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-primary" />
                  <span>Horários de Atendimento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Secretaria</span>
                  <span className="text-muted-foreground">Seg-Sex 9h-17h</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pastoral</span>
                  <span className="text-muted-foreground">Seg-Sáb 8h-20h</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cultos</span>
                  <span className="text-muted-foreground">Qui 19h, Dom 8h30 e 18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Emergências</span>
                  <span className="text-muted-foreground">24h via WhatsApp</span>
                </div>
              </CardContent>
            </Card>

            {/* Redes Sociais */}
            <Card>
              <CardHeader>
                <CardTitle>Siga-nos nas Redes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com/cbnkerigma" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a 
                    href="https://facebook.com/cbnkerigma" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                  >
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                  <a 
                    href="https://youtube.com/@cbnkerigma" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                  >
                    <Youtube className="w-6 h-6 text-white" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Acompanhe nossos conteúdos, eventos e momentos especiais
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-6 h-6 text-primary" />
                  <span>Envie sua Mensagem</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        placeholder="(98) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="assunto">Assunto *</Label>
                      <Select value={formData.assunto} onValueChange={handleSelectChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent 
                          position="popper" 
                          className="w-full max-h-[200px] overflow-y-auto"
                          sideOffset={4}
                        >
                          <SelectItem value="celula">Informações sobre Células</SelectItem>
                          <SelectItem value="batismo">Batismo</SelectItem>
                          <SelectItem value="casamento">Casamento</SelectItem>
                          <SelectItem value="oracao">Pedido de Oração</SelectItem>
                          <SelectItem value="visita">Visita Pastoral</SelectItem>
                          <SelectItem value="evento">Eventos</SelectItem>
                          <SelectItem value="dizimo">Dízimos e Ofertas</SelectItem>
                          <SelectItem value="outro">Outro Assunto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mensagem">Mensagem *</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      placeholder="Descreva como podemos ajudar você..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="bg-accent/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Política de Privacidade:</strong> Suas informações são tratadas com total confidencialidade 
                      e usadas apenas para responder ao seu contato. Não compartilhamos dados com terceiros.
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    <Send className="w-5 h-5 mr-2" />
                    {isLoading ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Mapa da Igreja */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <span>Como Chegar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video overflow-hidden rounded-lg">
                  {isLoadingMaps ? (
                    <div className="w-full h-full bg-accent/30 rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-muted-foreground">Carregando mapa...</p>
                      </div>
                    </div>
                  ) : mapsError ? (
                    <div className="w-full h-full bg-accent/30 rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapPin className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">Google Maps não disponível</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Configure a API key do Google Maps
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MapaGoogle apiKey={googleMapsApiKey} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contato;