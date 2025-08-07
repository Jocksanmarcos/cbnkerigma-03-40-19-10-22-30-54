import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Eye, Calendar } from 'lucide-react';

interface Certificado {
  id: string;
  nome: string;
  curso: string;
  dataEmissao: string;
  url?: string;
  tipo: 'curso' | 'trilha' | 'conquista';
  status: 'emitido' | 'pendente';
}

interface CertificadoDisplayProps {
  certificados: Certificado[];
  onDownload?: (certificadoId: string) => void;
  onVisualizacao?: (certificadoId: string) => void;
}

export const CertificadoDisplay: React.FC<CertificadoDisplayProps> = ({
  certificados = [],
  onDownload,
  onVisualizacao
}) => {
  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'curso': return 'default';
      case 'trilha': return 'secondary';
      case 'conquista': return 'outline';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'emitido' ? 'default' : 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Meus Certificados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {certificados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificados.map((certificado) => (
              <Card key={certificado.id} className="relative">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{certificado.nome}</h4>
                      <p className="text-xs text-muted-foreground">{certificado.curso}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={getTipoBadgeVariant(certificado.tipo)} className="text-xs">
                        {certificado.tipo.charAt(0).toUpperCase() + certificado.tipo.slice(1)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(certificado.status)} className="text-xs">
                        {certificado.status === 'emitido' ? 'Emitido' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Emitido em {new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {certificado.status === 'emitido' && (
                    <div className="flex gap-2">
                      {onVisualizacao && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onVisualizacao(certificado.id)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      )}
                      {onDownload && certificado.url && (
                        <Button 
                          size="sm" 
                          onClick={() => onDownload(certificado.id)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {certificado.status === 'pendente' && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                      Certificado em processamento...
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum certificado emitido ainda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete cursos e trilhas para receber certificados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};