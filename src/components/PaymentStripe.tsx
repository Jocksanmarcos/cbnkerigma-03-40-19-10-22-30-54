import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContribuicoes } from '@/hooks/useContribuicoes';

// Configurar Stripe (chave pública)
const stripePromise = loadStripe('pk_test_...');

interface PaymentFormProps {
  dados: {
    nome: string;
    email: string;
    valor: number;
    tipo: 'dizimo' | 'oferta' | 'missoes' | 'obras';
    campanha_id?: string;
    mensagem?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ dados, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { processarPagamentoCartao, confirmarPagamentoCartao } = useContribuicoes();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Criar Payment Intent
      const paymentResult = await processarPagamentoCartao(dados);
      
      if (!paymentResult.success || !paymentResult.clientSecret) {
        throw new Error('Erro ao criar pagamento');
      }

      // Confirmar pagamento com Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentResult.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: dados.nome,
            email: dados.email,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirmar no backend
        await confirmarPagamentoCartao(paymentIntent.id);
        onSuccess();
      }

    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-accent/5">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pagar R$ {dados.valor.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

interface PaymentStripeProps {
  dados: PaymentFormProps['dados'];
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentStripe = ({ dados, onSuccess, onCancel }: PaymentStripeProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Pagamento com Cartão</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <PaymentForm 
            dados={dados} 
            onSuccess={onSuccess} 
            onCancel={onCancel} 
          />
        </Elements>
      </CardContent>
    </Card>
  );
};

export default PaymentStripe;