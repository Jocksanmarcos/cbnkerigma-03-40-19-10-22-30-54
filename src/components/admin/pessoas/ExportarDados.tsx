import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pessoa } from '@/hooks/usePessoas';

interface ExportarDadosProps {
  pessoas: Pessoa[];
  filtroAtivo?: string;
}

export const ExportarDados = ({ pessoas, filtroAtivo }: ExportarDadosProps) => {
  const { toast } = useToast();

  const exportarCSV = () => {
    try {
      const headers = [
        'Nome Completo',
        'Email',
        'Telefone',
        'Data Nascimento',
        'Estado Civil',
        'Estado Espiritual',
        'Tipo Pessoa',
        'Situação',
        'Data Conversão',
        'Data Batismo',
        'Status Discipulado',
        'Célula',
        'Data Cadastro'
      ];

      const csvContent = [
        headers.join(','),
        ...pessoas.map(pessoa => [
          `"${pessoa.nome_completo}"`,
          `"${pessoa.email || ''}"`,
          `"${pessoa.telefone_celular || ''}"`,
          `"${pessoa.data_nascimento || ''}"`,
          `"${pessoa.estado_civil || ''}"`,
          `"${pessoa.estado_espiritual}"`,
          `"${pessoa.tipo_pessoa}"`,
          `"${pessoa.situacao}"`,
          `"${pessoa.data_conversao || ''}"`,
          `"${pessoa.data_batismo || ''}"`,
          `"${pessoa.status_discipulado}"`,
          `"${pessoa.celula_id || ''}"`,
          `"${new Date(pessoa.created_at).toLocaleDateString('pt-BR')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pessoas_${filtroAtivo || 'todos'}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: `${pessoas.length} registros exportados para CSV`,
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "Erro na exportação",
        description: "Erro ao gerar arquivo CSV",
        variant: "destructive",
      });
    }
  };

  const exportarJSON = () => {
    try {
      const dadosExportacao = {
        metadata: {
          data_exportacao: new Date().toISOString(),
          total_registros: pessoas.length,
          filtro_aplicado: filtroAtivo || 'todos'
        },
        pessoas: pessoas.map(pessoa => ({
          ...pessoa,
          // Remove campos sensíveis se necessário
          observacoes_pastorais: undefined
        }))
      };

      const jsonContent = JSON.stringify(dadosExportacao, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pessoas_backup_${new Date().toISOString().slice(0, 10)}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Backup gerado",
        description: `Backup completo de ${pessoas.length} registros criado`,
      });
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      toast({
        title: "Erro no backup",
        description: "Erro ao gerar arquivo de backup",
        variant: "destructive",
      });
    }
  };

  const gerarRelatorioPDF = async () => {
    try {
      // Aqui você pode implementar a geração de PDF
      // Por agora, vamos simular com um alerta
      toast({
        title: "Em desenvolvimento",
        description: "Geração de PDF será implementada em breve",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro no relatório",
        description: "Erro ao gerar relatório PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={exportarCSV}
        className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2 h-9 w-full"
      >
        <FileSpreadsheet className="h-3 w-3 md:h-4 md:w-4" />
        <span>CSV</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={gerarRelatorioPDF}
        className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2 h-9 w-full"
      >
        <FileText className="h-3 w-3 md:h-4 md:w-4" />
        <span>PDF</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={exportarJSON}
        className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2 h-9 w-full"
      >
        <Download className="h-3 w-3 md:h-4 md:w-4" />
        <span>Backup</span>
      </Button>
    </div>
  );
};