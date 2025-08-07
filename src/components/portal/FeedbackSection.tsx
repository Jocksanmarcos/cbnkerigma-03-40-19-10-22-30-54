import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  texto: string;
  data: string;
  discipulador: string;
  aula?: string;
  tipo: 'feedback' | 'avaliacao';
  nota?: number;
}

interface FeedbackSectionProps {
  feedbacks: Feedback[];
  onEnviarFeedback?: (texto: string, aulaId?: string) => void;
  podeEnviarFeedback?: boolean;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedbacks = [],
  onEnviarFeedback,
  podeEnviarFeedback = false
}) => {
  const [novoFeedback, setNovoFeedback] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();

  const handleEnviarFeedback = async () => {
    if (!novoFeedback.trim()) return;

    setEnviando(true);
    try {
      await onEnviarFeedback?.(novoFeedback);
      setNovoFeedback('');
      toast({
        title: "Feedback enviado",
        description: "Seu feedback foi enviado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  const renderStars = (nota: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < nota ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback do Discipulador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de Feedbacks */}
        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{feedback.discipulador}</span>
                    <Badge variant={feedback.tipo === 'avaliacao' ? 'default' : 'secondary'}>
                      {feedback.tipo === 'avaliacao' ? 'Avaliação' : 'Feedback'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(feedback.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                {feedback.nota && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Nota:</span>
                    <div className="flex gap-1">
                      {renderStars(feedback.nota)}
                    </div>
                  </div>
                )}
                
                <p className="text-sm">{feedback.texto}</p>
                
                {feedback.aula && (
                  <p className="text-xs text-muted-foreground">
                    Referente à: {feedback.aula}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum feedback recebido ainda
            </p>
          </div>
        )}

        {/* Formulário para enviar feedback (se aplicável) */}
        {podeEnviarFeedback && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Enviar Feedback</h4>
            <Textarea
              value={novoFeedback}
              onChange={(e) => setNovoFeedback(e.target.value)}
              placeholder="Digite seu feedback aqui..."
              className="min-h-[80px]"
            />
            <Button 
              onClick={handleEnviarFeedback}
              disabled={!novoFeedback.trim() || enviando}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {enviando ? 'Enviando...' : 'Enviar Feedback'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};