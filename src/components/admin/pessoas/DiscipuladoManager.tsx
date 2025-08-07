import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Heart, Users, Plus, X, Search, UserPlus, UserMinus } from 'lucide-react';
import { type Pessoa } from '@/hooks/usePessoas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiscipuladoManagerProps {
  pessoa: Pessoa;
  onUpdate: () => void;
}

export const DiscipuladoManager: React.FC<DiscipuladoManagerProps> = ({
  pessoa,
  onUpdate
}) => {
  const [discipulador, setDiscipulador] = useState<any>(null);
  const [discipulos, setDiscipulos] = useState<any[]>([]);
  const [todosPessoas, setTodosPessoas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Buscar dados do discipulador e discípulos
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        // Buscar todas as pessoas para o seletor
        const { data: todasPessoas, error: errorPessoas } = await supabase
          .from('pessoas')
          .select('*')
          .eq('situacao', 'ativo')
          .order('nome_completo');

        if (errorPessoas) throw errorPessoas;
        setTodosPessoas(todasPessoas || []);

        // Buscar discipulador atual se existir
        if (pessoa.discipulador_id) {
          const { data: discipuladorData, error: errorDiscipulador } = await supabase
            .from('pessoas')
            .select('*')
            .eq('id', pessoa.discipulador_id)
            .single();

          if (!errorDiscipulador && discipuladorData) {
            setDiscipulador(discipuladorData);
          }
        }

        // Buscar discípulos (pessoas que têm esta pessoa como discipulador)
        const { data: discipulosData, error: errorDiscipulos } = await supabase
          .from('pessoas')
          .select('*')
          .eq('discipulador_id', pessoa.id)
          .eq('situacao', 'ativo')
          .order('nome_completo');

        if (!errorDiscipulos) {
          setDiscipulos(discipulosData || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de discipulado:', error);
        toast.error('Erro ao carregar dados de discipulado');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [pessoa.id, pessoa.discipulador_id]);

  // Atualizar discipulador
  const atualizarDiscipulador = async (novoDiscipuladorId: string | null) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({
          discipulador_id: novoDiscipuladorId,
          data_inicio_discipulado: novoDiscipuladorId ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', pessoa.id);

      if (error) throw error;

      // Atualizar estado local
      if (novoDiscipuladorId) {
        const novoDiscipulador = todosPessoas.find(p => p.id === novoDiscipuladorId);
        setDiscipulador(novoDiscipulador || null);
      } else {
        setDiscipulador(null);
      }

      toast.success('Discipulador atualizado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar discipulador:', error);
      toast.error('Erro ao atualizar discipulador');
    }
  };

  // Adicionar novo discípulo
  const adicionarDiscipulo = async (discipuloId: string) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({
          discipulador_id: pessoa.id,
          data_inicio_discipulado: new Date().toISOString().split('T')[0]
        })
        .eq('id', discipuloId);

      if (error) throw error;

      // Atualizar lista local
      const novoDiscipulo = todosPessoas.find(p => p.id === discipuloId);
      if (novoDiscipulo) {
        setDiscipulos(prev => [...prev, novoDiscipulo]);
      }

      toast.success('Discípulo adicionado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar discípulo:', error);
      toast.error('Erro ao adicionar discípulo');
    }
  };

  // Remover discípulo
  const removerDiscipulo = async (discipuloId: string) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({
          discipulador_id: null,
          data_inicio_discipulado: null
        })
        .eq('id', discipuloId);

      if (error) throw error;

      // Atualizar lista local
      setDiscipulos(prev => prev.filter(d => d.id !== discipuloId));

      toast.success('Vínculo de discipulado removido com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao remover discípulo:', error);
      toast.error('Erro ao remover vínculo de discipulado');
    }
  };

  // Filtrar pessoas para evitar loops (não pode discipular a si mesmo ou seu próprio discipulador)
  const pessoasDisponiveis = todosPessoas.filter(p => 
    p.id !== pessoa.id && // Não pode discipular a si mesmo
    p.id !== pessoa.discipulador_id && // Não pode adicionar seu próprio discipulador
    !discipulos.some(d => d.id === p.id) && // Não pode adicionar alguém que já é discípulo
    p.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Seção do Discipulador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Discipulador
          </CardTitle>
          <CardDescription>
            Quem está discipulando esta pessoa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {discipulador ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{discipulador.nome_completo}</p>
                  <p className="text-sm text-muted-foreground">
                    {discipulador.tipo_pessoa} • {discipulador.estado_espiritual}
                  </p>
                  {discipulador.data_inicio_discipulado && (
                    <p className="text-xs text-muted-foreground">
                      Iniciado em: {new Date(discipulador.data_inicio_discipulado).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => atualizarDiscipulador(null)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Remover
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Esta pessoa ainda não tem um discipulador definido.</p>
              <div>
                <Label htmlFor="discipulador-select">Selecionar Discipulador</Label>
                <Select onValueChange={(value) => atualizarDiscipulador(value)}>
                  <SelectTrigger id="discipulador-select">
                    <SelectValue placeholder="Escolha um discipulador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {todosPessoas
                      .filter(p => p.id !== pessoa.id)
                      .map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo} ({pessoa.tipo_pessoa})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Seção dos Discípulos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Discípulos ({discipulos.length})
          </CardTitle>
          <CardDescription>
            Pessoas que {pessoa.nome_completo} está discipulando
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Lista de discípulos atuais */}
          {discipulos.length > 0 ? (
            <div className="space-y-3 mb-6">
              {discipulos.map((discipulo) => (
                <div
                  key={discipulo.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{discipulo.nome_completo}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {discipulo.tipo_pessoa}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {discipulo.estado_espiritual}
                        </Badge>
                      </div>
                      {discipulo.data_inicio_discipulado && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Iniciado em: {new Date(discipulo.data_inicio_discipulado).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Vínculo de Discipulado</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o vínculo de discipulado com {discipulo.nome_completo}?
                          Esta ação pode ser revertida posteriormente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removerDiscipulo(discipulo.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover Vínculo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum discípulo ainda</h3>
              <p className="text-muted-foreground">
                {pessoa.nome_completo} ainda não está discipulando ninguém.
              </p>
            </div>
          )}

          {/* Adicionar novo discípulo */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Novo Discípulo
            </h4>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pessoas disponíveis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {searchTerm && (
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {pessoasDisponiveis.length > 0 ? (
                    pessoasDisponiveis.slice(0, 5).map((pessoa) => (
                      <div
                        key={pessoa.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/50 border-b last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-sm">{pessoa.nome_completo}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {pessoa.tipo_pessoa}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {pessoa.estado_espiritual}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            adicionarDiscipulo(pessoa.id);
                            setSearchTerm('');
                          }}
                          className="text-xs"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhuma pessoa encontrada
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};