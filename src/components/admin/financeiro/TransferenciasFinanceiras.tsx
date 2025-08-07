import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinanceiroCompleto } from '@/hooks/useFinanceiroCompleto';
import { ArrowRightLeft, PlusCircle } from 'lucide-react';

const TransferenciasFinanceiras = () => {
  const { contas, transferirEntreContas } = useFinanceiroCompleto();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    conta_origem_id: '',
    conta_destino_id: '',
    valor: '',
    descricao: '',
    data_transferencia: new Date().toISOString().split('T')[0]
  });

  const resetForm = () => {
    setFormData({
      conta_origem_id: '',
      conta_destino_id: '',
      valor: '',
      descricao: '',
      data_transferencia: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async () => {
    await transferirEntreContas({
      conta_origem_id: formData.conta_origem_id,
      conta_destino_id: formData.conta_destino_id,
      valor: parseFloat(formData.valor),
      descricao: formData.descricao,
      data_transferencia: formData.data_transferencia
    });

    setIsDialogOpen(false);
    resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center text-mobile-lg">
                <ArrowRightLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Transferências entre Contas
              </CardTitle>
              <CardDescription className="text-mobile-sm">
                Transfira valores entre contas da igreja
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="button-mobile">
                  <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:hidden lg:inline">Nova Transferência</span>
                  <span className="xs:hidden sm:inline lg:hidden">Transferir</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm sm:max-w-md mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-mobile-base">Nova Transferência</DialogTitle>
                  <DialogDescription className="text-mobile-sm">
                    Transfira valores entre contas
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="conta-origem">Conta de Origem *</Label>
                    <Select value={formData.conta_origem_id} onValueChange={(value) => setFormData(prev => ({ ...prev, conta_origem_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta de origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>
                            {conta.nome} - {formatCurrency(conta.saldo_atual)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="conta-destino">Conta de Destino *</Label>
                    <Select value={formData.conta_destino_id} onValueChange={(value) => setFormData(prev => ({ ...prev, conta_destino_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta de destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.filter(c => c.id !== formData.conta_origem_id).map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>
                            {conta.nome} - {formatCurrency(conta.saldo_atual)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <Label htmlFor="valor" className="text-mobile-sm">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                        placeholder="0,00"
                        className="text-mobile-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data" className="text-mobile-sm">Data *</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data_transferencia}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_transferencia: e.target.value }))}
                        className="text-mobile-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Motivo da transferência..."
                      rows={2}
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
                      disabled={!formData.conta_origem_id || !formData.conta_destino_id || !formData.valor || !formData.descricao}
                    >
                      Transferir
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Histórico de transferências será exibido aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferenciasFinanceiras;