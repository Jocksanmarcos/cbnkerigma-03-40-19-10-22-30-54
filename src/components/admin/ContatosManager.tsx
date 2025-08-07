import { useState } from 'react';
import { useContatos } from '@/hooks/useContatos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Mail, Phone, Calendar, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ContatosManager = () => {
  const { contatos, loading, updateContato } = useContatos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContato, setSelectedContato] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('todos');

  const handleViewContato = (contato: any) => {
    setSelectedContato(contato);
    setDialogOpen(true);
  };

   const handleUpdateStatus = async (id: string, novoStatus: string) => {
     try {
       await updateContato(id, { status: novoStatus });
       if (selectedContato?.id === id) {
         setSelectedContato({ ...selectedContato, status: novoStatus });
       }
     } catch (error) {
       // Error is already handled in the hook
     }
   };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novo':
      case 'pendente':
        return <AlertCircle className="h-4 w-4" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4" />;
      case 'resolvido':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
      case 'pendente':
        return 'destructive';
      case 'em_andamento':
        return 'default';
      case 'resolvido':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'novo':
      case 'pendente':
        return 'Pendente';
      case 'em_andamento':
        return 'Em Andamento';
      case 'resolvido':
        return 'Resolvido';
      default:
        return 'Pendente';
    }
  };

  const contatosFiltrados = filterStatus === 'todos' 
    ? contatos 
    : contatos.filter(contato => contato.status === filterStatus);

  const statusStats = {
    total: contatos.length,
    pendente: contatos.filter(c => c.status === 'novo' || c.status === 'pendente').length,
    em_andamento: contatos.filter(c => c.status === 'em_andamento').length,
    resolvido: contatos.filter(c => c.status === 'resolvido').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Contatos</h2>
          <p className="text-muted-foreground">Gerencie as mensagens recebidas</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold mt-1">{statusStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Pendentes</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-destructive">{statusStats.pendente}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Em Andamento</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-primary">{statusStats.em_andamento}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
               <CheckCircle className="h-4 w-4 text-accent" />
               <span className="text-sm font-medium">Resolvidos</span>
             </div>
             <div className="text-2xl font-bold mt-1 text-accent">{statusStats.resolvido}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Filtrar por status:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="novo">Novos</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="resolvido">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Contatos */}
      {loading ? (
        <div className="text-center py-8">Carregando contatos...</div>
      ) : (
        <div className="grid gap-4">
          {contatosFiltrados.map((contato) => (
            <Card key={contato.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {contato.nome}
                      <Badge variant={getStatusColor(contato.status)}>
                        {getStatusIcon(contato.status)}
                        <span className="ml-1">{getStatusLabel(contato.status)}</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription className="font-medium text-primary">
                      {contato.assunto}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewContato(contato)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contato.email}</span>
                  </div>
                  {contato.telefone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contato.telefone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(contato.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {contato.mensagem}
                </p>
                
                <div className="flex space-x-2 mt-4">
                  {(contato.status === 'novo' || contato.status === 'pendente') && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(contato.id, 'em_andamento')}
                    >
                      Iniciar Atendimento
                    </Button>
                  )}
                  {contato.status === 'em_andamento' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(contato.id, 'resolvido')}
                    >
                      Marcar como Resolvido
                    </Button>
                  )}
                  {contato.status === 'resolvido' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(contato.id, 'em_andamento')}
                    >
                      Reabrir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {contatosFiltrados.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filterStatus === 'todos' 
                    ? 'Nenhum contato encontrado' 
                    : `Nenhum contato com status "${getStatusLabel(filterStatus)}" encontrado`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog para visualizar contato */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Mensagem de {selectedContato?.nome}
              <Badge variant={getStatusColor(selectedContato?.status)}>
                {getStatusIcon(selectedContato?.status)}
                <span className="ml-1">{getStatusLabel(selectedContato?.status)}</span>
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedContato?.assunto}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContato && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Email:</strong> {selectedContato.email}
                </div>
                {selectedContato.telefone && (
                  <div>
                    <strong>Telefone:</strong> {selectedContato.telefone}
                  </div>
                )}
                <div>
                  <strong>Data:</strong> {' '}
                  {format(new Date(selectedContato.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusLabel(selectedContato.status)}
                </div>
              </div>
              
              <div>
                <strong className="block mb-2">Mensagem:</strong>
                <Textarea
                  value={selectedContato.mensagem}
                  readOnly
                  className="min-h-32"
                />
              </div>
              
              <div className="flex space-x-2">
                {(selectedContato.status === 'novo' || selectedContato.status === 'pendente') && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedContato.id, 'em_andamento')}
                  >
                    Iniciar Atendimento
                  </Button>
                )}
                {selectedContato.status === 'em_andamento' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedContato.id, 'resolvido')}
                  >
                    Marcar como Resolvido
                  </Button>
                )}
                {selectedContato.status === 'resolvido' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedContato.id, 'em_andamento')}
                  >
                    Reabrir
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};