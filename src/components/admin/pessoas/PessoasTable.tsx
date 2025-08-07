import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Eye, Edit, Trash2, BookOpen, UserCheck } from 'lucide-react';
import { type Pessoa } from '@/hooks/usePessoas';
import { supabase } from '@/integrations/supabase/client';

interface PessoasTableProps {
  pessoas: Pessoa[];
  onEdit: (pessoa: Pessoa) => void;
  onDelete: (id: string) => void;
  onView: (pessoa: Pessoa, action?: string) => void;
  calcularIdade: (dataNascimento: string) => number;
}

export const PessoasTable: React.FC<PessoasTableProps> = ({
  pessoas,
  onEdit,
  onDelete,
  onView,
  calcularIdade
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterSituacao, setFilterSituacao] = useState<string>('ativo');
  const [discipuladoresMap, setDiscipuladoresMap] = useState<{[key: string]: string}>({});

  const tiposPessoa = [
    { value: 'membro', label: 'Membro' },
    { value: 'visitante', label: 'Visitante' },
    { value: 'voluntario', label: 'Voluntário' },
    { value: 'pastor', label: 'Pastor' },
    { value: 'obreiro', label: 'Obreiro' },
    { value: 'lider', label: 'Líder' },
  ];

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

  // Filtros
  const pessoasFiltradas = pessoas.filter(pessoa => {
    const matchSearch = pessoa.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pessoa.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pessoa.telefone_celular?.includes(searchTerm);
    
    const matchTipo = filterTipo === 'todos' || pessoa.tipo_pessoa === filterTipo;
    const matchEstado = filterEstado === 'todos' || pessoa.estado_espiritual === filterEstado;
    const matchSituacao = filterSituacao === 'todos' || pessoa.situacao === filterSituacao;

    return matchSearch && matchTipo && matchEstado && matchSituacao;
  });

  const getEstadoColor = (estado: string) => {
    const colors = {
      visitante: 'bg-muted text-muted-foreground',
      novo_convertido: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      batizado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      membro_ativo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      em_acompanhamento: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      lider_treinamento: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      lider: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      pastor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    };
    return colors[estado as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      membro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      visitante: 'bg-muted text-muted-foreground',
      voluntario: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pastor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      obreiro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      lider: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    };
    return colors[tipo as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  // Buscar informações dos discipuladores
  useEffect(() => {
    const carregarDiscipuladores = async () => {
      const pessoasComDiscipulador = pessoas.filter(p => p.discipulador_id);
      
      if (pessoasComDiscipulador.length > 0) {
        const discipuladorIds = pessoasComDiscipulador.map(p => p.discipulador_id);
        
        const { data: discipuladores } = await supabase
          .from('pessoas')
          .select('id, nome_completo')
          .in('id', discipuladorIds);
        
        if (discipuladores) {
          const map: {[key: string]: string} = {};
          discipuladores.forEach(d => {
            map[d.id] = d.nome_completo;
          });
          setDiscipuladoresMap(map);
        }
      }
    };

    carregarDiscipuladores();
  }, [pessoas]);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposPessoa.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                {estadosEspirituais.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterSituacao} onValueChange={setFilterSituacao}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as situações</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pessoas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pessoas</CardTitle>
          <CardDescription>
            {pessoasFiltradas.length} pessoa(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pessoasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma pessoa encontrada com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pessoasFiltradas.map((pessoa) => (
                <div
                  key={pessoa.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-semibold text-base">{pessoa.nome_completo}</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getTipoColor(pessoa.tipo_pessoa || '')} variant="secondary">
                          {tiposPessoa.find(t => t.value === pessoa.tipo_pessoa)?.label || pessoa.tipo_pessoa}
                        </Badge>
                        <Badge className={getEstadoColor(pessoa.estado_espiritual || '')} variant="secondary">
                          {estadosEspirituais.find(e => e.value === pessoa.estado_espiritual)?.label || pessoa.estado_espiritual}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      {pessoa.email && (
                        <span>📧 {pessoa.email}</span>
                      )}
                      {pessoa.telefone_celular && (
                        <span>📱 {pessoa.telefone_celular}</span>
                      )}
                      {pessoa.data_nascimento && (
                        <span>🎂 {calcularIdade(pessoa.data_nascimento)} anos</span>
                      )}
                      {pessoa.discipulador_id && discipuladoresMap[pessoa.discipulador_id] && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {discipuladoresMap[pessoa.discipulador_id]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(pessoa)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(pessoa, 'jornada')}
                      className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Jornada
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(pessoa)}
                      className="text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(pessoa.id)}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};