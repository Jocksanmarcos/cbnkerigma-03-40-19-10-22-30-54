import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { usePessoas, type Pessoa, type RelacionamentoFamiliar } from '@/hooks/usePessoas';
import { PlusCircle, Trash2, Users, Search } from 'lucide-react';

interface RelacionamentosFamiliaresProps {
  pessoaId?: string;
}

const RelacionamentosFamiliares = ({ pessoaId }: RelacionamentosFamiliaresProps) => {
  const { 
    fetchRelacionamentosFamiliares, 
    createRelacionamentoFamiliar, 
    deleteRelacionamentoFamiliar,
    buscarPessoasPorNome,
    calcularIdade
  } = usePessoas();

  const [relacionamentos, setRelacionamentos] = useState<RelacionamentoFamiliar[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pessoasEncontradas, setPessoasEncontradas] = useState<Pessoa[]>([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);
  const [tipoRelacionamento, setTipoRelacionamento] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const tiposRelacionamento = [
    { value: 'conjuge', label: 'Cônjuge' },
    { value: 'pai', label: 'Pai' },
    { value: 'mae', label: 'Mãe' },
    { value: 'filho', label: 'Filho' },
    { value: 'filha', label: 'Filha' },
    { value: 'irmao', label: 'Irmão' },
    { value: 'irma', label: 'Irmã' },
    { value: 'avo', label: 'Avô' },
    { value: 'avo_fem', label: 'Avó' },
    { value: 'neto', label: 'Neto' },
    { value: 'neta', label: 'Neta' },
    { value: 'tio', label: 'Tio' },
    { value: 'tia', label: 'Tia' },
    { value: 'primo', label: 'Primo' },
    { value: 'prima', label: 'Prima' },
  ];

  const loadRelacionamentos = async () => {
    if (!pessoaId) return;
    
    const data = await fetchRelacionamentosFamiliares(pessoaId);
    setRelacionamentos(data);
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      const pessoas = await buscarPessoasPorNome(value);
      // Filtrar para não incluir a própria pessoa
      const pessoasFiltradas = pessoas.filter(p => p.id !== pessoaId);
      setPessoasEncontradas(pessoasFiltradas);
    } else {
      setPessoasEncontradas([]);
    }
  };

  const handleSubmit = async () => {
    if (!pessoaId || !pessoaSelecionada || !tipoRelacionamento) return;

    setLoading(true);
    
    const result = await createRelacionamentoFamiliar({
      pessoa_id: pessoaId,
      parente_id: pessoaSelecionada.id,
      tipo_relacionamento: tipoRelacionamento as any,
    });

    if (result.error === null) {
      setIsDialogOpen(false);
      resetForm();
      await loadRelacionamentos();
    }
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRelacionamentoFamiliar(id);
    if (result.error === null) {
      await loadRelacionamentos();
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setPessoasEncontradas([]);
    setPessoaSelecionada(null);
    setTipoRelacionamento('');
  };

  const getTipoRelacionamentoLabel = (tipo: string) => {
    return tiposRelacionamento.find(t => t.value === tipo)?.label || tipo;
  };

  useEffect(() => {
    loadRelacionamentos();
  }, [pessoaId]);

  if (!pessoaId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Salve a pessoa primeiro para gerenciar relacionamentos familiares</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Relacionamentos Familiares
            </CardTitle>
            <CardDescription>
              Gerencie os vínculos familiares desta pessoa
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Familiar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Relacionamento Familiar</DialogTitle>
                <DialogDescription>
                  Busque e selecione um familiar para adicionar
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-pessoa">Buscar Pessoa</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-pessoa"
                      placeholder="Digite o nome da pessoa..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {pessoasEncontradas.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                      {pessoasEncontradas.map((pessoa) => (
                        <button
                          key={pessoa.id}
                          className={`w-full text-left p-2 hover:bg-accent transition-colors ${
                            pessoaSelecionada?.id === pessoa.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => {
                            setPessoaSelecionada(pessoa);
                            setSearchTerm(pessoa.nome_completo);
                            setPessoasEncontradas([]);
                          }}
                        >
                          <div className="font-medium">{pessoa.nome_completo}</div>
                          {pessoa.data_nascimento && (
                            <div className="text-sm text-muted-foreground">
                              {calcularIdade(pessoa.data_nascimento)} anos
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo-relacionamento">Tipo de Relacionamento</Label>
                  <Select value={tipoRelacionamento} onValueChange={setTipoRelacionamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposRelacionamento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!pessoaSelecionada || !tipoRelacionamento || loading}
                  >
                    {loading ? 'Salvando...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {relacionamentos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum relacionamento familiar cadastrado
          </div>
        ) : (
          <div className="space-y-3">
            {relacionamentos.map((relacionamento: any) => (
              <div key={relacionamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">
                    {getTipoRelacionamentoLabel(relacionamento.tipo_relacionamento)}
                  </Badge>
                  <div>
                    <div className="font-medium">
                      {relacionamento.parente?.nome_completo}
                    </div>
                    {relacionamento.parente?.data_nascimento && (
                      <div className="text-sm text-muted-foreground">
                        {calcularIdade(relacionamento.parente.data_nascimento)} anos
                      </div>
                    )}
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover este relacionamento familiar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(relacionamento.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelacionamentosFamiliares;