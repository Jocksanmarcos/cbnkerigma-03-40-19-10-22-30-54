import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Pessoa } from './usePessoas';
import { useToast } from './use-toast';

export interface CertificateData {
  tipo: 'batismo' | 'casamento' | 'dedicacao' | 'curso' | 'membresia';
  nome: string;
  data: string;
  local?: string;
  observacoes?: string;
  modelo?: 'classico' | 'moderno' | 'elegante';
}

export interface TransferData {
  nomeDestino: string;
  enderecoDestino: string;
  cidadeDestino: string;
  pastorDestino: string;
  motivo?: string;
  data: string;
  modelo?: 'formal' | 'simples' | 'detalhado';
}

export const usePDFGenerator = () => {
  const { toast } = useToast();

  const addLogoToPDF = (pdf: jsPDF, x: number, y: number, width: number, height: number) => {
    // Para usar o logo, seria necessário converter para base64 ou usar uma URL pública
    // Por enquanto, vamos criar um placeholder visual
    pdf.setFillColor(255, 165, 0); // Cor laranja do logo
    pdf.circle(x + width/2, y + height/2, Math.min(width, height)/2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CBN', x + width/2, y + height/2, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
  };

  const generateFichaMembro = useCallback(async (pessoa: Pessoa) => {
    const pdf = new jsPDF();
    
    // Cabeçalho com logo
    addLogoToPDF(pdf, 20, 10, 20, 20);
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 140, 0); // Laranja
    pdf.text('FICHA DO MEMBRO', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Comunidade Batista Nacional Kerigma', 105, 28, { align: 'center' });
    pdf.text('Anunciando e Vivendo o Amor de Cristo!', 105, 35, { align: 'center' });
    
    // Linha decorativa
    pdf.setDrawColor(255, 140, 0);
    pdf.setLineWidth(1);
    pdf.line(20, 40, 190, 40);
    pdf.setDrawColor(0, 0, 0);
    
    // Dados pessoais com fundo colorido
    pdf.setFillColor(255, 140, 0);
    pdf.rect(20, 45, 170, 8, 'F');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('DADOS PESSOAIS', 22, 51);
    pdf.setTextColor(0, 0, 0);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 60;
    const lineHeight = 7;
    
    pdf.text(`Nome Completo: ${pessoa.nome_completo}`, 20, yPos);
    yPos += lineHeight;
    
    if (pessoa.data_nascimento) {
      const idade = new Date().getFullYear() - new Date(pessoa.data_nascimento).getFullYear();
      pdf.text(`Data de Nascimento: ${new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR')} (${idade} anos)`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.sexo) {
      pdf.text(`Sexo: ${pessoa.sexo === 'masculino' ? 'Masculino' : 'Feminino'}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.estado_civil) {
      pdf.text(`Estado Civil: ${pessoa.estado_civil.replace('_', ' ').toUpperCase()}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.cpf) {
      pdf.text(`CPF: ${pessoa.cpf}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.rg) {
      pdf.text(`RG: ${pessoa.rg}`, 20, yPos);
      yPos += lineHeight;
    }
    
    // Contato com fundo colorido
    yPos += 10;
    pdf.setFillColor(255, 140, 0);
    pdf.rect(20, yPos - 5, 170, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('CONTATO', 22, yPos + 1);
    pdf.setTextColor(0, 0, 0);
    yPos += 10;
    
    pdf.setFont('helvetica', 'normal');
    
    if (pessoa.email) {
      pdf.text(`Email: ${pessoa.email}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.telefone_celular) {
      pdf.text(`Celular: ${pessoa.telefone_celular}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.telefone_whatsapp) {
      pdf.text(`WhatsApp: ${pessoa.telefone_whatsapp}`, 20, yPos);
      yPos += lineHeight;
    }
    
    // Endereço com fundo colorido
    if (pessoa.endereco_rua) {
      yPos += 10;
      pdf.setFillColor(255, 140, 0);
      pdf.rect(20, yPos - 5, 170, 8, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('ENDEREÇO', 22, yPos + 1);
      pdf.setTextColor(0, 0, 0);
      yPos += 10;
      
      pdf.setFont('helvetica', 'normal');
      const endereco = `${pessoa.endereco_rua}, ${pessoa.endereco_numero || 'S/N'}`;
      pdf.text(`Rua: ${endereco}`, 20, yPos);
      yPos += lineHeight;
      
      if (pessoa.endereco_bairro) {
        pdf.text(`Bairro: ${pessoa.endereco_bairro}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (pessoa.endereco_cidade && pessoa.endereco_uf) {
        pdf.text(`Cidade: ${pessoa.endereco_cidade} - ${pessoa.endereco_uf}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (pessoa.cep) {
        pdf.text(`CEP: ${pessoa.cep}`, 20, yPos);
        yPos += lineHeight;
      }
    }
    
    // Informações Espirituais com fundo colorido
    yPos += 10;
    pdf.setFillColor(255, 140, 0);
    pdf.rect(20, yPos - 5, 170, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('INFORMAÇÕES ESPIRITUAIS', 22, yPos + 1);
    pdf.setTextColor(0, 0, 0);
    yPos += 10;
    
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(`Estado Espiritual: ${pessoa.estado_espiritual.replace('_', ' ').toUpperCase()}`, 20, yPos);
    yPos += lineHeight;
    
    if (pessoa.data_conversao) {
      pdf.text(`Data de Conversão: ${new Date(pessoa.data_conversao).toLocaleDateString('pt-BR')}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.data_batismo) {
      pdf.text(`Data de Batismo: ${new Date(pessoa.data_batismo).toLocaleDateString('pt-BR')}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.status_discipulado) {
      pdf.text(`Status Discipulado: ${pessoa.status_discipulado.replace('_', ' ').toUpperCase()}`, 20, yPos);
      yPos += lineHeight;
    }
    
    if (pessoa.cargo_funcao) {
      pdf.text(`Cargo/Função: ${pessoa.cargo_funcao}`, 20, yPos);
      yPos += lineHeight;
    }
    
    // Rodapé
    pdf.setFontSize(8);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 280);
    
    pdf.save(`ficha-membro-${pessoa.nome_completo.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "Ficha do membro gerada com sucesso!",
    });
  }, [toast]);

  const generateCarteiraMembro = useCallback(async (pessoa: Pessoa) => {
    const pdf = new jsPDF('landscape', 'mm', [85.6, 53.98]); // Tamanho cartão de crédito
    
    // Fundo gradiente simulado
    pdf.setFillColor(255, 140, 0); // Laranja
    pdf.rect(0, 0, 85.6, 53.98, 'F');
    
    pdf.setFillColor(255, 165, 0); // Laranja mais claro
    pdf.rect(0, 0, 85.6, 15, 'F');
    
    // Logo da igreja
    addLogoToPDF(pdf, 3, 3, 12, 12);
    
    // Nome da igreja
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CBN KERIGMA', 18, 8);
    
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Comunidade Batista Nacional', 18, 12);
    
    // Foto placeholder
    pdf.setFillColor(255, 255, 255);
    pdf.rect(5, 16, 15, 20, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(4);
    pdf.text('FOTO', 10, 27, { align: 'center' });
    
    // Dados do membro
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CARTEIRA DE MEMBRO', 25, 20);
    
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nome: ${pessoa.nome_completo}`, 25, 26);
    
    if (pessoa.data_batismo) {
      pdf.text(`Batizado em: ${new Date(pessoa.data_batismo).toLocaleDateString('pt-BR')}`, 25, 30);
    }
    
    pdf.text(`Estado: ${pessoa.estado_espiritual.toUpperCase()}`, 25, 34);
    
    // Número da carteira (ID)
    pdf.setFontSize(5);
    pdf.text(`Nº ${pessoa.id.slice(-8).toUpperCase()}`, 5, 48);
    
    // Data de emissão
    pdf.text(`Emitida em: ${new Date().toLocaleDateString('pt-BR')}`, 40, 48);
    
    pdf.save(`carteira-membro-${pessoa.nome_completo.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "Carteira de membro gerada com sucesso!",
    });
  }, [toast]);

  const generateCertificado = useCallback(async (pessoa: Pessoa, certificateData: CertificateData) => {
    const pdf = new jsPDF('landscape');
    const modelo = certificateData.modelo || 'classico';
    
    if (modelo === 'elegante') {
      // Modelo Elegante - fundo com gradiente simulado
      pdf.setFillColor(250, 250, 250);
      pdf.rect(0, 0, 297, 210, 'F');
      
      // Bordas decorativas
      pdf.setDrawColor(255, 140, 0);
      pdf.setLineWidth(3);
      pdf.rect(15, 15, 267, 180);
      
      pdf.setDrawColor(255, 165, 0);
      pdf.setLineWidth(1);
      pdf.rect(20, 20, 257, 170);
      
      // Logo no topo
      addLogoToPDF(pdf, 130, 25, 30, 30);
      
    } else if (modelo === 'moderno') {
      // Modelo Moderno - design minimalista
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 297, 210, 'F');
      
      // Barra lateral colorida
      pdf.setFillColor(255, 140, 0);
      pdf.rect(0, 0, 20, 210, 'F');
      
      // Logo pequeno no canto
      addLogoToPDF(pdf, 25, 20, 25, 25);
      
    } else {
      // Modelo Clássico - tradicional
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 297, 210, 'F');
      
      pdf.setLineWidth(2);
      pdf.setDrawColor(255, 140, 0);
      pdf.rect(10, 10, 277, 190);
      
      pdf.setLineWidth(1);
      pdf.rect(15, 15, 267, 180);
      
      // Logo centralizado no topo
      addLogoToPDF(pdf, 125, 20, 35, 35);
    }
    
    // Cabeçalho baseado no modelo
    const yOffset = modelo === 'elegante' ? 65 : modelo === 'moderno' ? 50 : 60;
    
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 140, 0);
    pdf.text('CERTIFICADO', 148.5, yOffset, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Comunidade Batista Nacional Kerigma', 148.5, yOffset + 15, { align: 'center' });
    pdf.text('Anunciando e Vivendo o Amor de Cristo!', 148.5, yOffset + 25, { align: 'center' });
    
    // Corpo do certificado
    const bodyY = yOffset + 35;
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    
    const tipoTexto = {
      batismo: 'BATISMO NAS ÁGUAS',
      casamento: 'CASAMENTO',
      dedicacao: 'DEDICAÇÃO',
      curso: 'CONCLUSÃO DE CURSO',
      membresia: 'MEMBRESIA'
    };
    
    pdf.text('Certificamos que', 148.5, bodyY + 20, { align: 'center' });
    
    // Linha decorativa sob o nome
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 140, 0);
    pdf.text(certificateData.nome.toUpperCase(), 148.5, bodyY + 40, { align: 'center' });
    
    // Linha decorativa
    pdf.setDrawColor(255, 140, 0);
    pdf.setLineWidth(1);
    pdf.line(70, bodyY + 45, 225, bodyY + 45);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    
    const textoTipo = tipoTexto[certificateData.tipo] || 'CERTIFICADO';
    pdf.text(`participou/concluiu: ${textoTipo}`, 148.5, bodyY + 65, { align: 'center' });
    
    pdf.text(`Realizado em: ${new Date(certificateData.data).toLocaleDateString('pt-BR')}`, 148.5, bodyY + 85, { align: 'center' });
    
    if (certificateData.local) {
      pdf.text(`Local: ${certificateData.local}`, 148.5, bodyY + 100, { align: 'center' });
    }
    
    // Assinaturas
    pdf.setFontSize(10);
    pdf.line(50, 180, 120, 180);
    pdf.text('Pastor Responsável', 85, 190, { align: 'center' });
    
    pdf.line(177, 180, 247, 180);
    pdf.text('Secretário(a)', 212, 190, { align: 'center' });
    
    // Data de emissão
    pdf.setFontSize(8);
    pdf.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 25, 205);
    
    pdf.save(`certificado-${certificateData.tipo}-${certificateData.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "Certificado gerado com sucesso!",
    });
  }, [toast]);

  const generateCartaTransferencia = useCallback(async (pessoa: Pessoa, transferData: TransferData) => {
    const pdf = new jsPDF();
    const modelo = transferData.modelo || 'formal';
    
    // Cabeçalho com logo
    addLogoToPDF(pdf, 20, 10, 25, 25);
    
    if (modelo === 'detalhado') {
      // Modelo detalhado com mais informações
      pdf.setFillColor(255, 140, 0);
      pdf.rect(0, 0, 210, 40, 'F');
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('CARTA DE TRANSFERÊNCIA', 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Comunidade Batista Nacional Kerigma', 105, 30, { align: 'center' });
      pdf.text('Anunciando e Vivendo o Amor de Cristo!', 105, 38, { align: 'center' });
      
    } else if (modelo === 'simples') {
      // Modelo simples e limpo
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 140, 0);
      pdf.text('CARTA DE TRANSFERÊNCIA', 105, 25, { align: 'center' });
      
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Comunidade Batista Nacional Kerigma', 105, 35, { align: 'center' });
      
    } else {
      // Modelo formal tradicional
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('CARTA DE TRANSFERÊNCIA', 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Comunidade Batista Nacional Kerigma', 105, 30, { align: 'center' });
      
      // Linha decorativa
      pdf.setDrawColor(255, 140, 0);
      pdf.setLineWidth(1);
      pdf.line(20, 35, 190, 35);
    }
    
    // Data
    pdf.text(`São Paulo, ${new Date().toLocaleDateString('pt-BR')}`, 170, 50);
    
    // Destinatário
    pdf.setFontSize(11);
    pdf.text('Ao Pastor e Igreja:', 20, 70);
    pdf.setFont('helvetica', 'bold');
    pdf.text(transferData.nomeDestino, 20, 80);
    pdf.setFont('helvetica', 'normal');
    pdf.text(transferData.enderecoDestino, 20, 90);
    pdf.text(transferData.cidadeDestino, 20, 100);
    
    if (transferData.pastorDestino) {
      pdf.text(`Pastor: ${transferData.pastorDestino}`, 20, 110);
    }
    
    // Saudação
    pdf.text('Graça e Paz!', 20, 130);
    
    // Corpo da carta
    const bodyText = `Por meio desta, apresentamos e transferimos para essa amada igreja o(a) irmão(ã) ${pessoa.nome_completo}, que tem sido membro ativo desta comunidade.`;
    
    const lines = pdf.splitTextToSize(bodyText, 170);
    pdf.text(lines, 20, 150);
    
    pdf.setFont('helvetica', 'normal');
    
    // Informações do membro
    pdf.text('Informações do membro:', 20, 180);
    
    if (pessoa.data_conversao) {
      pdf.text(`• Data de Conversão: ${new Date(pessoa.data_conversao).toLocaleDateString('pt-BR')}`, 25, 190);
    }
    
    if (pessoa.data_batismo) {
      pdf.text(`• Data de Batismo: ${new Date(pessoa.data_batismo).toLocaleDateString('pt-BR')}`, 25, 200);
    }
    
    pdf.text(`• Estado Espiritual: ${pessoa.estado_espiritual.replace('_', ' ')}`, 25, 210);
    
    if (pessoa.cargo_funcao) {
      pdf.text(`• Cargo/Função: ${pessoa.cargo_funcao}`, 25, 220);
    }
    
    // Motivo da transferência
    if (transferData.motivo) {
      pdf.text(`Motivo da transferência: ${transferData.motivo}`, 20, 240);
    }
    
    // Despedida
    pdf.text('Recomendamos este(a) irmão(ã) às orações e cuidados dessa igreja,', 20, 260);
    pdf.text('desejando que Deus os abençoe abundantemente.', 20, 270);
    
    // Assinatura
    pdf.text('Em Cristo,', 20, 290);
    
    pdf.line(120, 300, 180, 300);
    pdf.text('Pastor Responsável', 150, 310, { align: 'center' });
    
    pdf.save(`carta-transferencia-${pessoa.nome_completo.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "Carta de transferência gerada com sucesso!",
    });
  }, [toast]);

  return {
    generateFichaMembro,
    generateCarteiraMembro,
    generateCertificado,
    generateCartaTransferencia,
  };
};