import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CreditCard, Award, Send } from 'lucide-react';
import { usePDFGenerator, CertificateData, TransferData } from '@/hooks/usePDFGenerator';
import { Pessoa } from '@/hooks/usePessoas';

interface PDFDocumentGeneratorProps {
  pessoa: Pessoa;
}

export const PDFDocumentGenerator: React.FC<PDFDocumentGeneratorProps> = ({ pessoa }) => {
  console.log('PDFDocumentGenerator carregado para:', pessoa.nome_completo);
  const { 
    generateFichaMembro,
    generateCarteiraMembro,
    generateCertificado,
    generateCartaTransferencia
  } = usePDFGenerator();

  const [certificateData, setCertificateData] = useState<CertificateData>({
    tipo: 'batismo',
    nome: pessoa.nome_completo,
    data: '',
    local: '',
    observacoes: '',
    modelo: 'classico'
  });
  
  console.log('Estado certificateData:', certificateData);

  const [transferData, setTransferData] = useState<TransferData>({
    nomeDestino: '',
    enderecoDestino: '',
    cidadeDestino: '',
    pastorDestino: '',
    motivo: '',
    data: '',
    modelo: 'formal'
  });

  const [openDialogs, setOpenDialogs] = useState({
    certificate: false,
    transfer: false
  });

  const documentTypes = [
    {
      id: 'ficha',
      title: 'Ficha do Membro',
      description: 'Documento completo com todas as informações do membro',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-blue-500',
      action: async () => {
        await generateFichaMembro(pessoa);
      }
    },
    {
      id: 'carteira',
      title: 'Carteira de Membro',
      description: 'Cartão de identificação oficial do membro',
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-green-500',
      action: async () => {
        await generateCarteiraMembro(pessoa);
      }
    },
    {
      id: 'certificado',
      title: 'Certificado',
      description: 'Certificado personalizado para eventos e conquistas',
      icon: <Award className="h-6 w-6" />,
      color: 'bg-amber-500',
      action: () => {
        console.log('Abrindo modal de certificado');
        setOpenDialogs(prev => ({ ...prev, certificate: true }));
      }
    },
    {
      id: 'transferencia',
      title: 'Carta de Transferência',
      description: 'Documento oficial para transferência de membro',
      icon: <Send className="h-6 w-6" />,
      color: 'bg-red-500',
      action: () => setOpenDialogs(prev => ({ ...prev, transfer: true }))
    }
  ];

  const handleGenerateCertificate = async () => {
    await generateCertificado(pessoa, certificateData);
    setOpenDialogs(prev => ({ ...prev, certificate: false }));
  };

  const handleGenerateTransfer = async () => {
    await generateCartaTransferencia(pessoa, transferData);
    setOpenDialogs(prev => ({ ...prev, transfer: false }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerador de Documentos PDF</CardTitle>
        <CardDescription>
          Gere documentos oficiais para {pessoa.nome_completo}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map((doc) => (
            <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 ${doc.color} text-white rounded-lg`}>
                    {doc.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={doc.action}
                    className="flex-1"
                    variant="outline"
                  >
                    Gerar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog para Certificado */}
        <Dialog open={openDialogs.certificate} onOpenChange={(open) => 
          setOpenDialogs(prev => ({ ...prev, certificate: open }))
        }>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Certificado</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="modelo">Modelo do Certificado</Label>
                <Select 
                  value={certificateData.modelo} 
                  onValueChange={(value: any) => 
                    setCertificateData(prev => ({ ...prev, modelo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classico">Clássico</SelectItem>
                    <SelectItem value="moderno">Moderno</SelectItem>
                    <SelectItem value="elegante">Elegante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Certificado</Label>
                <Select 
                  value={certificateData.tipo} 
                  onValueChange={(value: any) => 
                    setCertificateData(prev => ({ ...prev, tipo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="batismo">Batismo</SelectItem>
                    <SelectItem value="casamento">Casamento</SelectItem>
                    <SelectItem value="dedicacao">Dedicação</SelectItem>
                    <SelectItem value="curso">Curso</SelectItem>
                    <SelectItem value="membresia">Membresia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data">Data do Evento</Label>
                <Input
                  id="data"
                  type="date"
                  value={certificateData.data}
                  onChange={(e) => 
                    setCertificateData(prev => ({ ...prev, data: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="local">Local (Opcional)</Label>
                <Input
                  id="local"
                  value={certificateData.local}
                  onChange={(e) => 
                    setCertificateData(prev => ({ ...prev, local: e.target.value }))
                  }
                  placeholder="Ex: Igreja CBN Kerigma"
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={certificateData.observacoes}
                  onChange={(e) => 
                    setCertificateData(prev => ({ ...prev, observacoes: e.target.value }))
                  }
                  placeholder="Informações adicionais..."
                />
              </div>

              <Button onClick={handleGenerateCertificate} className="w-full">
                Gerar Certificado
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para Carta de Transferência */}
        <Dialog open={openDialogs.transfer} onOpenChange={(open) => 
          setOpenDialogs(prev => ({ ...prev, transfer: open }))
        }>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Carta de Transferência</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="modeloTransfer">Modelo da Carta</Label>
                <Select 
                  value={transferData.modelo} 
                  onValueChange={(value: any) => 
                    setTransferData(prev => ({ ...prev, modelo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="simples">Simples</SelectItem>
                    <SelectItem value="detalhado">Detalhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nomeDestino">Nome da Igreja de Destino</Label>
                <Input
                  id="nomeDestino"
                  value={transferData.nomeDestino}
                  onChange={(e) => 
                    setTransferData(prev => ({ ...prev, nomeDestino: e.target.value }))
                  }
                  placeholder="Ex: Igreja Batista Central"
                />
              </div>

              <div>
                <Label htmlFor="enderecoDestino">Endereço da Igreja</Label>
                <Input
                  id="enderecoDestino"
                  value={transferData.enderecoDestino}
                  onChange={(e) => 
                    setTransferData(prev => ({ ...prev, enderecoDestino: e.target.value }))
                  }
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <Label htmlFor="cidadeDestino">Cidade/Estado</Label>
                <Input
                  id="cidadeDestino"
                  value={transferData.cidadeDestino}
                  onChange={(e) => 
                    setTransferData(prev => ({ ...prev, cidadeDestino: e.target.value }))
                  }
                  placeholder="Ex: São Paulo - SP"
                />
              </div>

              <div>
                <Label htmlFor="pastorDestino">Pastor da Igreja de Destino</Label>
                <Input
                  id="pastorDestino"
                  value={transferData.pastorDestino}
                  onChange={(e) => 
                    setTransferData(prev => ({ ...prev, pastorDestino: e.target.value }))
                  }
                  placeholder="Nome do pastor"
                />
              </div>

              <div>
                <Label htmlFor="motivo">Motivo da Transferência (Opcional)</Label>
                <Textarea
                  id="motivo"
                  value={transferData.motivo}
                  onChange={(e) => 
                    setTransferData(prev => ({ ...prev, motivo: e.target.value }))
                  }
                  placeholder="Ex: Mudança de cidade..."
                />
              </div>

              <div>
                <Label htmlFor="dataTransfer">Data da Transferência</Label>
                <Input
                  id="dataTransfer"
                  type="date"
                  value={transferData.data}
                  onChange={(e) => 
                    setTransferData(prev => ({ ...prev, data: e.target.value }))
                  }
                />
              </div>

              <Button onClick={handleGenerateTransfer} className="w-full">
                Gerar Carta de Transferência
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};