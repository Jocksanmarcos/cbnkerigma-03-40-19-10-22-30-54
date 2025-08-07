import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useFinanceiroCompleto } from '@/hooks/useFinanceiroCompleto';
import type { ContaFinanceira } from '@/hooks/useFinanceiro';
import { PlusCircle, Trash2, Edit, CreditCard, Building, Smartphone, Wallet } from 'lucide-react';

const ContasFinanceiras = () => {
  const { contas, createConta, updateConta, deleteConta } = useFinanceiroCompleto();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaFinanceira | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'banco' as 'banco' | 'caixa' | 'pix' | 'outros',
    banco: '',
    agencia: '',
    conta: '',
    saldo_atual: 0,
    ativa: true
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'banco',
      banco: '',
      agencia: '',
      conta: '',
      saldo_atual: 0,
      ativa: true
    });
    setEditingConta(null);
  };

  const handleSubmit = async () => {
    const contaData = {
      ...formData,
      saldo_atual: Number(formData.saldo_atual)
    };

    if (editingConta) {
      await updateConta(editingConta.id, contaData);
    } else {
      await createConta(contaData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (conta: ContaFinanceira) => {
    setFormData({
      nome: conta.nome,
      tipo: conta.tipo,
      banco: conta.banco || '',
      agencia: conta.agencia || '',
      conta: conta.conta || '',
      saldo_atual: conta.saldo_atual,
      ativa: conta.ativa
    });
    setEditingConta(conta);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteConta(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'banco':
        return <Building className="h-5 w-5" />;
      case 'pix':
        return <Smartphone className="h-5 w-5" />;
      case 'caixa':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      banco: 'Conta Bancária',
      caixa: 'Caixa',
      pix: 'PIX',
      outros: 'Outros'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center text-mobile-lg">
                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Contas Financeiras
              </CardTitle>
              <CardDescription className="text-mobile-sm">
                Gerencie as contas e caixas da igreja
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="button-mobile">
                  <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Nova Conta</span>
                  <span className="xs:hidden">+</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm sm:max-w-md mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingConta ? 'Editar Conta' : 'Nova Conta Financeira'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingConta ? 'Edite as informações da conta' : 'Adicione uma nova conta ou caixa'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Conta Corrente Principal"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banco">Conta Bancária</SelectItem>
                        <SelectItem value="caixa">Caixa</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo === 'banco' && (
                    <>
                      <div>
                        <Label htmlFor="banco">Banco</Label>
                        <Input
                          id="banco"
                          value={formData.banco}
                          onChange={(e) => setFormData(prev => ({ ...prev, banco: e.target.value }))}
                          placeholder="Ex: Banco do Brasil"
                        />
                      </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                         <div>
                           <Label htmlFor="agencia" className="text-mobile-sm">Agência</Label>
                           <Input
                             id="agencia"
                             value={formData.agencia}
                             onChange={(e) => setFormData(prev => ({ ...prev, agencia: e.target.value }))}
                             placeholder="Ex: 1234-5"
                             className="text-mobile-sm"
                           />
                         </div>
                         <div>
                           <Label htmlFor="conta-num" className="text-mobile-sm">Conta</Label>
                           <Input
                             id="conta-num"
                             value={formData.conta}
                             onChange={(e) => setFormData(prev => ({ ...prev, conta: e.target.value }))}
                             placeholder="Ex: 12345-6"
                             className="text-mobile-sm"
                           />
                         </div>
                       </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="saldo">Saldo Inicial (R$)</Label>
                    <Input
                      id="saldo"
                      type="number"
                      step="0.01"
                      value={formData.saldo_atual}
                      onChange={(e) => setFormData(prev => ({ ...prev, saldo_atual: Number(e.target.value) }))}
                      placeholder="0,00"
                    />
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
                      disabled={!formData.nome}
                    >
                      {editingConta ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {contas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma conta cadastrada
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {contas.map((conta) => (
                <Card key={conta.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getIconForTipo(conta.tipo)}
                        </div>
                        <div>
                          <h3 className="font-medium">{conta.nome}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getTipoLabel(conta.tipo)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {conta.banco && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Banco:</strong> {conta.banco}
                        </p>
                      )}
                      {conta.agencia && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Agência:</strong> {conta.agencia}
                        </p>
                      )}
                      {conta.conta && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Conta:</strong> {conta.conta}
                        </p>
                      )}
                      
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                        <p className={`text-xl font-bold ${
                          conta.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(conta.saldo_atual)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-1 mt-4">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(conta)}>
                        <Edit className="h-4 w-4" />
                      </Button>
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
                              Tem certeza que deseja remover esta conta? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(conta.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContasFinanceiras;