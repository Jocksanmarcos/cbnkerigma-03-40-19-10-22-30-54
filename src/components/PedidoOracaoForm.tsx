import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Heart, Send } from 'lucide-react';
import { usePedidosOracao, NovoPedidoOracao } from '@/hooks/usePedidosOracao';

interface PedidoOracaoFormProps {
  onSuccess?: () => void;
}

const PedidoOracaoForm = ({ onSuccess }: PedidoOracaoFormProps) => {
  const { criarPedido, isLoading } = usePedidosOracao();
  const [formData, setFormData] = useState<NovoPedidoOracao>({
    nome: '',
    email: '',
    telefone: '',
    pedido: '',
    urgencia: 'normal',
    categoria: 'geral',
    publico: false
  });

  const categorias = [
    'geral',
    'saude',
    'familia',
    'trabalho',
    'financas',
    'relacionamentos',
    'estudos',
    'viagem',
    'ministerio'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criarPedido(formData);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        pedido: '',
        urgencia: 'normal',
        categoria: 'geral',
        publico: false
      });
      onSuccess?.();
    } catch (error) {
      // Error já é tratado no hook
    }
  };

  const handleChange = (field: keyof NovoPedidoOracao, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-primary" />
          <span>Pedido de Oração</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencia">Urgência</Label>
            <Select value={formData.urgencia} onValueChange={(value) => handleChange('urgencia', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="muito_urgente">Muito Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pedido">Seu Pedido *</Label>
            <Textarea
              id="pedido"
              value={formData.pedido}
              onChange={(e) => handleChange('pedido', e.target.value)}
              required
              rows={4}
              placeholder="Descreva seu pedido de oração..."
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="publico"
              checked={formData.publico}
              onCheckedChange={(checked) => handleChange('publico', checked)}
            />
            <Label htmlFor="publico" className="text-sm">
              Permitir que outros vejam este pedido (sem dados pessoais)
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Enviando...' : 'Enviar Pedido'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            * Campos obrigatórios. Seus dados pessoais são mantidos em sigilo.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default PedidoOracaoForm;