import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HandHeart, Send, X } from 'lucide-react';
import { useVoluntarios, NovoVoluntario } from '@/hooks/useVoluntarios';

interface VoluntarioFormProps {
  onSuccess?: () => void;
}

const VoluntarioForm = ({ onSuccess }: VoluntarioFormProps) => {
  const { criarVoluntario, isLoading } = useVoluntarios();
  const [formData, setFormData] = useState<NovoVoluntario>({
    nome: '',
    email: '',
    telefone: '',
    areas_interesse: [],
    disponibilidade: '',
    experiencia: '',
    observacoes: ''
  });

  const areasDisponiveis = [
    'Louvor e Adoração',
    'Ministério Infantil',
    'Ministério de Jovens',
    'Recepção e Hospitalidade',
    'Som e Tecnologia',
    'Limpeza e Organização',
    'Cozinha e Eventos',
    'Comunicação e Mídias',
    'Ensino e Educação',
    'Visitação e Cuidado',
    'Segurança',
    'Transporte',
    'Construção e Manutenção',
    'Administração',
    'Oração e Intercessão'
  ];

  const disponibilidades = [
    'Semanal',
    'Quinzenal', 
    'Mensal',
    'Eventual/Conforme necessidade'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.areas_interesse.length === 0) {
      alert('Por favor, selecione pelo menos uma área de interesse.');
      return;
    }
    
    try {
      await criarVoluntario(formData);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        areas_interesse: [],
        disponibilidade: '',
        experiencia: '',
        observacoes: ''
      });
      onSuccess?.();
    } catch (error) {
      // Error já é tratado no hook
    }
  };

  const handleChange = (field: keyof NovoVoluntario, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas_interesse: prev.areas_interesse.includes(area)
        ? prev.areas_interesse.filter(a => a !== area)
        : [...prev.areas_interesse, area]
    }));
  };

  const removeArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas_interesse: prev.areas_interesse.filter(a => a !== area)
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HandHeart className="w-5 h-5 text-primary" />
          <span>Cadastro de Voluntário</span>
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
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

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
            <Label htmlFor="disponibilidade">Disponibilidade *</Label>
            <Select value={formData.disponibilidade} onValueChange={(value) => handleChange('disponibilidade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                {disponibilidades.map(disp => (
                  <SelectItem key={disp} value={disp}>
                    {disp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Áreas de Interesse *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {areasDisponiveis.map(area => (
                <label
                  key={area}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-muted"
                >
                  <Checkbox
                    checked={formData.areas_interesse.includes(area)}
                    onCheckedChange={() => toggleArea(area)}
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
            
            {formData.areas_interesse.length > 0 && (
              <div className="space-y-2">
                <Label>Áreas Selecionadas:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.areas_interesse.map(area => (
                    <Badge key={area} variant="secondary" className="cursor-pointer">
                      {area}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeArea(area)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiencia">Experiência Anterior</Label>
            <Textarea
              id="experiencia"
              value={formData.experiencia}
              onChange={(e) => handleChange('experiencia', e.target.value)}
              rows={3}
              placeholder="Descreva experiências anteriores relevantes (opcional)"
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              rows={3}
              placeholder="Outras informações que considera importantes (opcional)"
              className="resize-none"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Enviando...' : 'Enviar Cadastro'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            * Campos obrigatórios. Entraremos em contato para confirmar sua participação.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default VoluntarioForm;