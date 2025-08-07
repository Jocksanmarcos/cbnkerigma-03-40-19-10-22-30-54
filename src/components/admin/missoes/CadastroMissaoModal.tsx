import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CadastroMissaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMissaoCadastrada: () => void;
}

export const CadastroMissaoModal = ({ 
  open, 
  onOpenChange, 
  onMissaoCadastrada 
}: CadastroMissaoModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Missão',
    cidade: '',
    estado: '',
    endereco: '',
    telefone: '',
    email: '',
    pastor_responsavel: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('igrejas')
        .insert([{
          ...formData,
          ativa: true
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Missão cadastrada com sucesso!",
      });

      // Reset form
      setFormData({
        nome: '',
        tipo: 'Missão',
        cidade: '',
        estado: '',
        endereco: '',
        telefone: '',
        email: '',
        pastor_responsavel: ''
      });

      onOpenChange(false);
      onMissaoCadastrada();
    } catch (error: any) {
      console.error('Erro ao cadastrar missão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar a missão.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Missão</DialogTitle>
          <DialogDescription>
            Adicione uma nova missão da CBN Kerigma ao sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Missão *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: CBN Kerigma - São Paulo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Missão">Missão</SelectItem>
                  <SelectItem value="Congregação">Congregação</SelectItem>
                  <SelectItem value="Ponto de Pregação">Ponto de Pregação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                placeholder="Nome da cidade"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select 
                value={formData.estado} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosBrasil.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Endereço completo da missão"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@missao.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastor_responsavel">Pastor Responsável</Label>
            <Input
              id="pastor_responsavel"
              value={formData.pastor_responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, pastor_responsavel: e.target.value }))}
              placeholder="Nome do pastor responsável"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.nome || !formData.cidade || !formData.estado}
              className="w-full sm:w-auto"
            >
              {loading ? "Cadastrando..." : "Cadastrar Missão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};