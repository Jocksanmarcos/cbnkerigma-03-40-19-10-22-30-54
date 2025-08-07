import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-PAYMENT] ${step}${detailsStr}`);
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

    const { 
      nome, 
      email, 
      valor, 
      tipo, 
      campanhaId, 
      mensagem 
    } = await req.json();

    logStep("Received payment request", { nome, email, valor, tipo, campanhaId });

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valor * 100), // Converter para centavos
      currency: "brl",
      payment_method_types: ["card"],
      metadata: {
        nome,
        email,
        tipo,
        campanhaId: campanhaId || "",
        mensagem: mensagem || ""
      }
    });

    logStep("Payment Intent created", { id: paymentIntent.id, amount: paymentIntent.amount });

    // Registrar contribuição pendente no Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabase
      .from("contribuicoes")
      .insert({
        nome,
        valor,
        tipo,
        mensagem,
        campanha_id: campanhaId || null,
        metodo_pagamento: "cartao",
        stripe_payment_intent_id: paymentIntent.id,
        status: "pendente"
      });

    if (insertError) {
      logStep("Error inserting contribution", insertError);
      throw new Error(`Erro ao registrar contribuição: ${insertError.message}`);
    }

    logStep("Contribution registered successfully");

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
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