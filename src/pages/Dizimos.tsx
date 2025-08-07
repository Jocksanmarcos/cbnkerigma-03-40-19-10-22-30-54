import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import Footer from "@/components/layout/Footer";
import CampanhasCarousel from "@/components/CampanhasCarousel";
import PaymentStripe from "@/components/PaymentStripe";

import { Heart, DollarSign, CreditCard, Building, Copy, CheckCircle, FileBarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContribuicoes } from "@/hooks/useContribuicoes";
import { useCampanhas } from "@/hooks/useCampanhas";
import { useNavigate } from "react-router-dom";

const Dizimos = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [valor, setValor] = useState("");
  const [tipoOferta, setTipoOferta] = useState("dizimo");
  const [mensagem, setMensagem] = useState("");
  const [campanhaId, setCampanhaId] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("pix");
  const [copied, setCopied] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  const { toast } = useToast();
  const { registrarContribuicao, isLoading } = useContribuicoes();
  const navigate = useNavigate();

  const dadosBancarios = {
    banco: "Banco do Brasil",
    agencia: "1234-5",
    conta: "12345-6",
    pix: "10472815000127",
    beneficiario: "Comunidade Batista Nacional Kerigma"
  };

  const handleContribuirCampanha = (campanhaIdParam: string, titulo: string) => {
    setCampanhaId(campanhaIdParam);
    setTipoOferta("oferta");
    toast({
      title: "Campanha selecionada",
      description: `Contribuindo para: ${titulo}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (metodoPagamento === 'cartao') {
      // Preparar dados para pagamento com cartão
      const dadosPagamento = {
        nome,
        email: email || 'anonimo@email.com',
        valor: parseFloat(valor),
        tipo: tipoOferta as 'dizimo' | 'oferta' | 'missoes' | 'obras',
        campanha_id: campanhaId || undefined,
        mensagem: mensagem || undefined
      };
      
      setPaymentData(dadosPagamento);
      setShowPaymentDialog(true);
    } else {
      // Pagamento tradicional (PIX/transferência)
      const result = await registrarContribuicao({
        nome,
        valor: parseFloat(valor),
        tipo: tipoOferta as 'dizimo' | 'oferta' | 'missoes' | 'obras',
        mensagem: mensagem || undefined,
        metodo_pagamento: metodoPagamento as 'pix' | 'transferencia' | 'dinheiro',
        campanha_id: campanhaId || undefined,
        email
      });
      
      if (result.success) {
        setNome("");
        setEmail("");
        setValor("");
        setMensagem("");
        setCampanhaId("");
      }
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setNome("");
    setEmail("");
    setValor("");
    setMensagem("");
    setCampanhaId("");
    toast({
      title: "Pagamento realizado com sucesso!",
      description: "Obrigado pela sua contribuição.",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência.`,
    });
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Dízimos e Ofertas
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Sua contribuição faz a diferença no Reino de Deus
          </p>
        </div>
      </section>

      {/* Ensino sobre Dízimos */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-playfair font-bold mb-4">Por que Contribuir?</h2>
              </div>
              
              <div className="prose max-w-none text-muted-foreground space-y-6">
                <p>
                  <strong className="text-foreground">"Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, 
                  e depois fazei prova de mim nisto, diz o Senhor dos Exércitos, se eu não vos abrir as janelas 
                  do céu, e não derramar sobre vós uma bênção tal até que não haja lugar suficiente para a recolherdes."</strong> 
                  - Malaquias 3:10
                </p>
                
                <p>
                  O dízimo é uma prática bíblica que demonstra nossa gratidão a Deus e nossa confiança em Sua provisão. 
                  Quando dizimamos e ofertamos, participamos da obra de Deus e contribuímos para o crescimento do Reino.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-accent/50 rounded-lg p-6">
                    <h3 className="font-playfair font-semibold mb-3 text-foreground">Dízimo (10%)</h3>
                    <p>Entrega fiel de 10% da renda como reconhecimento de que tudo vem de Deus.</p>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-6">
                    <h3 className="font-playfair font-semibold mb-3 text-foreground">Ofertas</h3>
                    <p>Contribuições voluntárias movidas pela gratidão e amor ao trabalho de Deus.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Campanhas em Destaque */}
      <section className="section-padding bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CampanhasCarousel onContribuir={handleContribuirCampanha} />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulário de Contribuição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-primary" />
                <span>Fazer Contribuição</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">Tipo de Contribuição</Label>
                  <RadioGroup value={tipoOferta} onValueChange={setTipoOferta}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dizimo" id="dizimo" />
                      <Label htmlFor="dizimo">Dízimo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oferta" id="oferta" />
                      <Label htmlFor="oferta">Oferta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="missoes" id="missoes" />
                      <Label htmlFor="missoes">Missões</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="obras" id="obras" />
                      <Label htmlFor="obras">Obras e Construção</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">Método de Pagamento</Label>
                  <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mensagem">Mensagem (Opcional)</Label>
                  <Textarea
                    id="mensagem"
                    placeholder="Deixe uma mensagem de gratidão ou oração..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {metodoPagamento === 'cartao' ? (
                    <CreditCard className="w-5 h-5 mr-2" />
                  ) : (
                    <Heart className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? "Processando..." : 
                   metodoPagamento === 'cartao' ? "Pagar com Cartão" : "Registrar Contribuição"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Dados Bancários */}
          <div className="space-y-6">
            {/* PIX */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span>PIX - Mais Rápido</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Chave PIX (CNPJ)</Label>
                    <div className="flex items-center justify-between bg-accent/50 rounded-lg p-3 mt-1">
                      <span className="font-mono text-sm">{dadosBancarios.pix}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(dadosBancarios.pix, "PIX")}
                      >
                        {copied === "PIX" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Beneficiário</Label>
                    <p className="text-sm mt-1">{dadosBancarios.beneficiario}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PIX Missões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-primary" />
                  <span>PIX Missões</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Chave PIX (Email)</Label>
                    <div className="flex items-center justify-between bg-accent/50 rounded-lg p-3 mt-1">
                      <span className="font-mono text-sm">cbn.kerigma@gmail.com</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard("cbn.kerigma@gmail.com", "PIX Missões")}
                      >
                        {copied === "PIX Missões" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Beneficiário</Label>
                    <p className="text-sm mt-1">{dadosBancarios.beneficiario}</p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs text-orange-800">
                      <strong>Específico para Missões:</strong> Use esta chave PIX exclusivamente para contribuições destinadas ao trabalho missionário.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transferência Bancária */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-6 h-6 text-primary" />
                  <span>Transferência Bancária</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Banco</Label>
                      <p className="text-sm mt-1 font-medium">{dadosBancarios.banco}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Agência</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">{dadosBancarios.agencia}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(dadosBancarios.agencia, "Agência")}
                        >
                          {copied === "Agência" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Conta Corrente</Label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-mono">{dadosBancarios.conta}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(dadosBancarios.conta, "Conta")}
                      >
                        {copied === "Conta" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Beneficiário</Label>
                    <p className="text-sm mt-1">{dadosBancarios.beneficiario}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Importantes */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-playfair font-semibold mb-3 text-primary">Informações Importantes</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Após a transferência, envie o comprovante via WhatsApp</li>
                  <li>• Suas contribuições são utilizadas para a obra de Deus</li>
                  <li>• Transparência financeira é nossa prioridade</li>
                  <li>• Recibo disponível mediante solicitação</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de Pagamento com Cartão */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento com Cartão</DialogTitle>
          </DialogHeader>
          {paymentData && (
            <PaymentStripe
              dados={paymentData}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dizimos;