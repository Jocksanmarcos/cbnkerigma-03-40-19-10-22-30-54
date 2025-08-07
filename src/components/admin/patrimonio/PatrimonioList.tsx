import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, Eye, MoreHorizontal, QrCode, MapPin } from 'lucide-react';
import { Patrimonio } from '@/hooks/usePatrimonio';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatrimonioListProps {
  patrimonios: Patrimonio[];
  loading: boolean;
  onEdit: (patrimonio: Patrimonio) => void;
  onDelete: (id: string) => void;
}

export const PatrimonioList = ({ patrimonios, loading, onEdit, onDelete }: PatrimonioListProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      em_uso: { label: 'Em uso', variant: 'default' as const },
      em_manutencao: { label: 'Em manutenção', variant: 'destructive' as const },
      emprestado: { label: 'Emprestado', variant: 'secondary' as const },
      encostado: { label: 'Encostado', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEstadoBadge = (estado: string) => {
    const estadoConfig = {
      novo: { label: 'Novo', className: 'bg-green-100 text-green-800' },
      bom: { label: 'Bom', className: 'bg-blue-100 text-blue-800' },
      usado: { label: 'Usado', className: 'bg-yellow-100 text-yellow-800' },
      danificado: { label: 'Danificado', className: 'bg-orange-100 text-orange-800' },
      inservivel: { label: 'Inservível', className: 'bg-red-100 text-red-800' }
    };

    const config = estadoConfig[estado as keyof typeof estadoConfig] || { label: estado, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando patrimônios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Patrimônios ({patrimonios.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {patrimonios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum patrimônio encontrado.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código/Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patrimonios.map((patrimonio) => (
                  <TableRow key={patrimonio.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patrimonio.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {patrimonio.codigo_patrimonio || 'Sem código'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patrimonio.categoria?.nome}</div>
                        {patrimonio.subcategoria && (
                          <div className="text-sm text-muted-foreground">
                            {patrimonio.subcategoria.nome}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {patrimonio.localizacao_atual || 'Não informado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patrimonio.valor_total ? (
                        <div>
                          <div className="font-medium">
                            R$ {patrimonio.valor_total.toLocaleString('pt-BR', { 
                              minimumFractionDigits: 2 
                            })}
                          </div>
                          {patrimonio.quantidade > 1 && (
                            <div className="text-sm text-muted-foreground">
                              {patrimonio.quantidade}x R$ {patrimonio.valor_unitario?.toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2 
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(patrimonio.estado_conservacao)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(patrimonio.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {patrimonio.responsavel?.nome_completo || 'Não atribuído'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log('Ver detalhes', patrimonio.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(patrimonio)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log('Gerar QR Code', patrimonio.id)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(patrimonio.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};