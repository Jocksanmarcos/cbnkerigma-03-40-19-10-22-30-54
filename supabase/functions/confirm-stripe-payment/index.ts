import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-STRIPE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurado");
    }

    const { payment_intent_id } = await req.json();

    logStep("Confirming payment", { payment_intent_id });

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar status do Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    logStep("Payment Intent retrieved", { status: paymentIntent.status });

    // Inicializar Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Atualizar status da contribuição
    let newStatus = "pendente";
    if (paymentIntent.status === "succeeded") {
      newStatus = "confirmado";
    } else if (paymentIntent.status === "canceled" || paymentIntent.status === "payment_failed") {
      newStatus = "cancelado";
    }

    const { error: updateError } = await supabase
      .from("contribuicoes")
      .update({ status: newStatus })
      .eq("stripe_payment_intent_id", payment_intent_id);

    if (updateError) {
      logStep("Error updating contribution", updateError);
      throw new Error(`Erro ao atualizar contribuição: ${updateError.message}`);
    }

    logStep("Contribution status updated", { newStatus });

    return new Response(
      JSON.stringify({
        status: paymentIntent.status,
        contribution_status: newStatus
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});