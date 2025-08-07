import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PersonSelect } from '@/components/ui/person-select';
import { CategoriaPatrimonio, SubcategoriaPatrimonio, Patrimonio } from '@/hooks/usePatrimonio';

interface PatrimonioFormProps {
  categorias: CategoriaPatrimonio[];
  subcategorias: SubcategoriaPatrimonio[];
  patrimonio?: Patrimonio | null;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export const PatrimonioForm = ({ categorias, subcategorias, patrimonio, onSubmit, onCancel }: PatrimonioFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    codigo_patrimonio: '',
    descricao: '',
    categoria_id: '',
    subcategoria_id: '',
    quantidade: 1,
    data_aquisicao: undefined as Date | undefined,
    valor_unitario: '',
    valor_total: '',
    nota_fiscal_url: '',
    localizacao_atual: '',
    responsavel_id: '',
    ministerio_relacionado: '',
    estado_conservacao: 'bom' as const,
    status: 'em_uso' as const,
    data_proxima_manutencao: undefined as Date | undefined,
    link_externo: '',
    observacoes: ''
  });

  const [filteredSubcategorias, setFilteredSubcategorias] = useState<SubcategoriaPatrimonio[]>([]);

  useEffect(() => {
    if (patrimonio) {
      setFormData({
        nome: patrimonio.nome || '',
        codigo_patrimonio: patrimonio.codigo_patrimonio || '',
        descricao: patrimonio.descricao || '',
        categoria_id: patrimonio.categoria_id || '',
        subcategoria_id: patrimonio.subcategoria_id || '',
        quantidade: patrimonio.quantidade || 1,
        data_aquisicao: patrimonio.data_aquisicao ? new Date(patrimonio.data_aquisicao) : undefined,
        valor_unitario: patrimonio.valor_unitario?.toString() || '',
        valor_total: patrimonio.valor_total?.toString() || '',
        nota_fiscal_url: patrimonio.nota_fiscal_url || '',
        localizacao_atual: patrimonio.localizacao_atual || '',
        responsavel_id: patrimonio.responsavel_id || '',
        ministerio_relacionado: patrimonio.ministerio_relacionado || '',
        estado_conservacao: (patrimonio.estado_conservacao || 'bom') as any,
        status: (patrimonio.status || 'em_uso') as any,
        data_proxima_manutencao: patrimonio.data_proxima_manutencao ? new Date(patrimonio.data_proxima_manutencao) : undefined,
        link_externo: patrimonio.link_externo || '',
        observacoes: patrimonio.observacoes || ''
      });
    }
  }, [patrimonio]);

  useEffect(() => {
    if (formData.categoria_id) {
      const filtered = subcategorias.filter(sub => sub.categoria_id === formData.categoria_id);
      setFilteredSubcategorias(filtered);
    } else {
      setFilteredSubcategorias([]);
    }
  }, [formData.categoria_id, subcategorias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const valorUnitario = parseFloat(formData.valor_unitario) || 0;
    const quantidade = formData.quantidade || 1;
    
    const submitData = {
      ...formData,
      valor_unitario: valorUnitario,
      valor_total: valorUnitario * quantidade,
      data_aquisicao: formData.data_aquisicao ? format(formData.data_aquisicao, 'yyyy-MM-dd') : null,
      data_proxima_manutencao: formData.data_proxima_manutencao ? format(formData.data_proxima_manutencao, 'yyyy-MM-dd') : null,
      ativo: true
    };

    onSubmit(submitData);
  };

  const handleValorChange = (field: 'valor_unitario' | 'quantidade', value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'valor_unitario' || field === 'quantidade') {
        const valorUnit = field === 'valor_unitario' ? parseFloat(value.toString()) : parseFloat(prev.valor_unitario);
        const qtd = field === 'quantidade' ? parseInt(value.toString()) : prev.quantidade;
        newData.valor_total = ((valorUnit || 0) * (qtd || 1)).toString();
      }
      return newData;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome do Item *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Caixa de som JBL"
              required
            />
          </div>

          <div>
            <Label htmlFor="codigo_patrimonio">Código de Patrimônio</Label>
            <Input
              id="codigo_patrimonio"
              value={formData.codigo_patrimonio}
              onChange={(e) => setFormData(prev => ({ ...prev, codigo_patrimonio: e.target.value }))}
              placeholder="Será gerado automaticamente se vazio"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição detalhada do item"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={formData.categoria_id} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value, subcategoria_id: '' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subcategoria">Subcategoria</Label>
            <Select value={formData.subcategoria_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoria_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma subcategoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubcategorias.map(subcategoria => (
                  <SelectItem key={subcategoria.id} value={subcategoria.id}>
                    {subcategoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Informações Financeiras */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Financeiras</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => handleValorChange('quantidade', parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
            <Input
              id="valor_unitario"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_unitario}
              onChange={(e) => handleValorChange('valor_unitario', e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="valor_total">Valor Total (R$)</Label>
            <Input
              id="valor_total"
              type="number"
              step="0.01"
              value={formData.valor_total}
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.data_aquisicao && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data_aquisicao ? (
                    format(formData.data_aquisicao, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.data_aquisicao}
                  onSelect={(date) => setFormData(prev => ({ ...prev, data_aquisicao: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="nota_fiscal_url">Nota Fiscal (URL)</Label>
            <Input
              id="nota_fiscal_url"
              value={formData.nota_fiscal_url}
              onChange={(e) => setFormData(prev => ({ ...prev, nota_fiscal_url: e.target.value }))}
              placeholder="URL do arquivo da nota fiscal"
            />
          </div>
        </CardContent>
      </Card>

      {/* Localização e Responsabilidade */}
      <Card>
        <CardHeader>
          <CardTitle>Localização e Responsabilidade</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="localizacao_atual">Localização Atual</Label>
            <Input
              id="localizacao_atual"
              value={formData.localizacao_atual}
              onChange={(e) => setFormData(prev => ({ ...prev, localizacao_atual: e.target.value }))}
              placeholder="Ex: Sala de som, Igreja sede"
            />
          </div>

          <div>
            <Label htmlFor="responsavel_id">Responsável</Label>
            <PersonSelect
              value={formData.responsavel_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_id: value }))}
              placeholder="Selecione o responsável"
              returnType="id"
            />
          </div>

          <div>
            <Label htmlFor="ministerio_relacionado">Ministério Relacionado</Label>
            <Select value={formData.ministerio_relacionado} onValueChange={(value) => setFormData(prev => ({ ...prev, ministerio_relacionado: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ministério" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="louvor">Louvor</SelectItem>
                <SelectItem value="midia">Mídia</SelectItem>
                <SelectItem value="infantil">Infantil</SelectItem>
                <SelectItem value="jovens">Jovens</SelectItem>
                <SelectItem value="administracao">Administração</SelectItem>
                <SelectItem value="limpeza">Limpeza</SelectItem>
                <SelectItem value="recepcao">Recepção</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
            <Select value={formData.estado_conservacao} onValueChange={(value: any) => setFormData(prev => ({ ...prev, estado_conservacao: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="bom">Bom</SelectItem>
                <SelectItem value="usado">Usado</SelectItem>
                <SelectItem value="danificado">Danificado</SelectItem>
                <SelectItem value="inservivel">Inservível</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="em_uso">Em uso</SelectItem>
                <SelectItem value="em_manutencao">Em manutenção</SelectItem>
                <SelectItem value="emprestado">Emprestado</SelectItem>
                <SelectItem value="encostado">Encostado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_proxima_manutencao">Próxima Manutenção</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.data_proxima_manutencao && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data_proxima_manutencao ? (
                    format(formData.data_proxima_manutencao, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.data_proxima_manutencao}
                  onSelect={(date) => setFormData(prev => ({ ...prev, data_proxima_manutencao: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="link_externo">Link Externo</Label>
            <Input
              id="link_externo"
              value={formData.link_externo}
              onChange={(e) => setFormData(prev => ({ ...prev, link_externo: e.target.value }))}
              placeholder="Ex: site do fabricante, ficha técnica"
            />
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Observações adicionais sobre o patrimônio"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {patrimonio ? 'Atualizar' : 'Cadastrar'} Patrimônio
        </Button>
      </div>
    </form>
  );
};