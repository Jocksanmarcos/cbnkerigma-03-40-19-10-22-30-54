import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from '@/components/ui/checkbox';
import { useCelulas } from '@/hooks/useCelulas';
import { usePessoas, type Pessoa } from '@/hooks/usePessoas';

interface PessoasFormProps {
  formData: Partial<Pessoa>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Pessoa>>>;
  onSubmit: (e: React.FormEvent) => void;
  editingPessoa: Pessoa | null;
}

export const PessoasForm: React.FC<PessoasFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  editingPessoa
}) => {
  const { celulas } = useCelulas();
  const { pessoas: todosPessoas } = usePessoas();

  const estadosEspirituais = [
    { value: 'visitante', label: 'Visitante' },
    { value: 'novo_convertido', label: 'Novo Convertido' },
    { value: 'batizado', label: 'Batizado' },
    { value: 'membro_ativo', label: 'Membro Ativo' },
    { value: 'em_acompanhamento', label: 'Em Acompanhamento' },
    { value: 'lider_treinamento', label: 'Líder em Treinamento' },
    { value: 'lider', label: 'Líder' },
    { value: 'pastor', label: 'Pastor' },
  ];

  const tiposPessoa = [
    { value: 'membro', label: 'Membro' },
    { value: 'visitante', label: 'Visitante' },
    { value: 'voluntario', label: 'Voluntário' },
    { value: 'pastor', label: 'Pastor' },
    { value: 'obreiro', label: 'Obreiro' },
    { value: 'lider', label: 'Líder' },
  ];

  const statusDiscipulado = [
    { value: 'nao_iniciado', label: 'Não Iniciado' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'pausado', label: 'Pausado' },
  ];

  const estadosCivis = [
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
    { value: 'uniao_estavel', label: 'União Estável' },
  ];

  const ministerios = [
    'Louvor', 'Ensino', 'Recepção', 'Evangelismo', 'Crianças', 'Jovens',
    'Casais', 'Mulheres', 'Homens', 'Intercessão', 'Mídia', 'Limpeza'
  ];

  const statusFormacao = [
    { value: 'Visitante', label: 'Visitante' },
    { value: 'Novo convertido', label: 'Novo convertido' },
    { value: 'Aluno', label: 'Aluno' },
    { value: 'Em formação', label: 'Em formação' },
    { value: 'Líder em treinamento', label: 'Líder em treinamento' },
    { value: 'Líder formado', label: 'Líder formado' },
  ];

  const papeisNaCelula = [
    { value: 'Membro', label: 'Membro' },
    { value: 'Anfitrião', label: 'Anfitrião' },
    { value: 'Auxiliar', label: 'Auxiliar' },
    { value: 'Líder', label: 'Líder' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Discipulador', label: 'Discipulador' },
  ];

  return (
    <form id="pessoas-form" onSubmit={onSubmit} className="dialog-form">
      {/* Informações Básicas */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-mobile-sm sm:text-mobile-lg font-semibold text-primary">Informações Básicas</h3>
        <div className="form-grid-mobile">
          <div>
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="telefone_celular">Telefone Celular</Label>
            <Input
              id="telefone_celular"
              value={formData.telefone_celular || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone_celular: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="telefone_whatsapp">WhatsApp</Label>
            <Input
              id="telefone_whatsapp"
              value={formData.telefone_whatsapp || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone_whatsapp: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="sexo">Sexo</Label>
            <Select 
              value={formData.sexo} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value as 'masculino' | 'feminino' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estado_civil">Estado Civil</Label>
            <Select 
              value={formData.estado_civil} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, estado_civil: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado civil" />
              </SelectTrigger>
              <SelectContent>
                {estadosCivis.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Informações Espirituais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Informações Espirituais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estado_espiritual">Estado Espiritual</Label>
            <Select 
              value={formData.estado_espiritual} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, estado_espiritual: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosEspirituais.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
            <Select 
              value={formData.tipo_pessoa} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_pessoa: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposPessoa.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_conversao">Data de Conversão</Label>
            <Input
              id="data_conversao"
              type="date"
              value={formData.data_conversao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, data_conversao: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="data_batismo">Data de Batismo</Label>
            <Input
              id="data_batismo"
              type="date"
              value={formData.data_batismo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, data_batismo: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="celula_id">Célula</Label>
            <Select 
              value={formData.celula_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, celula_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {celulas.map((celula) => (
                  <SelectItem key={celula.id} value={celula.id}>
                    {celula.nome} - {celula.lider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status_discipulado">Status do Discipulado</Label>
            <Select 
              value={formData.status_discipulado} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status_discipulado: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status do discipulado" />
              </SelectTrigger>
              <SelectContent>
                {statusDiscipulado.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discipulador_id">Discipulador</Label>
            <Select 
              value={formData.discipulador_id || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, discipulador_id: value || null }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar discipulador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {todosPessoas
                  .filter(p => p.id !== formData.id) // Não pode discipular a si mesmo
                  .map((pessoa) => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_completo} ({pessoa.tipo_pessoa})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Ministérios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Ministérios de Atuação</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ministerios.map((ministerio) => (
            <div key={ministerio} className="flex items-center space-x-2">
              <Checkbox
                id={`ministerio-${ministerio}`}
                checked={formData.ministerio_atuacao?.includes(ministerio) || false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData(prev => ({
                      ...prev,
                      ministerio_atuacao: [...(prev.ministerio_atuacao || []), ministerio]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      ministerio_atuacao: (prev.ministerio_atuacao || []).filter(m => m !== ministerio)
                    }));
                  }
                }}
              />
              <Label htmlFor={`ministerio-${ministerio}`} className="text-sm">
                {ministerio}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Formação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Formação e Desenvolvimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status_formacao">Status de Formação</Label>
            <Select 
              value={formData.status_formacao} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status_formacao: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusFormacao.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="papel_na_celula">Papel na Célula</Label>
            <Select 
              value={formData.papel_na_celula} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, papel_na_celula: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                {papeisNaCelula.map((papel) => (
                  <SelectItem key={papel.value} value={papel.value}>{papel.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="aulas_concluidas">Aulas Concluídas</Label>
            <Input
              id="aulas_concluidas"
              type="number"
              min="0"
              value={formData.aulas_concluidas || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, aulas_concluidas: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="pontuacao_gamificada">Pontuação</Label>
            <Input
              id="pontuacao_gamificada"
              type="number"
              min="0"
              value={formData.pontuacao_gamificada || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, pontuacao_gamificada: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formData.cep || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="endereco_rua">Endereço</Label>
            <Input
              id="endereco_rua"
              value={formData.endereco_rua || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco_rua: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="endereco_bairro">Bairro</Label>
            <Input
              id="endereco_bairro"
              value={formData.endereco_bairro || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco_bairro: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="endereco_cidade">Cidade</Label>
            <Input
              id="endereco_cidade"
              value={formData.endereco_cidade || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco_cidade: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Observações</h3>
        <div>
          <Label htmlFor="observacoes_pastorais">Observações Pastorais</Label>
          <Textarea
            id="observacoes_pastorais"
            value={formData.observacoes_pastorais || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes_pastorais: e.target.value }))}
            rows={3}
          />
        </div>
      </div>
    </form>
  );
};