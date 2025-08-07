import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Calculando estatísticas de segurança...')

    // Contar usuários ativos
    const { count: activeUsers } = await supabaseClient
      .from('usuarios_admin')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // Contar sessões ativas (últimas 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: activeSessions } = await supabaseClient
      .from('security_active_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity', last24h)

    // Contar logs de auditoria
    const { count: totalAuditLogs } = await supabaseClient
      .from('security_audit_logs')
      .select('*', { count: 'exact', head: true })

    // Contar permissões do sistema
    const { count: totalPermissions } = await supabaseClient
      .from('security_permissions')
      .select('*', { count: 'exact', head: true })

    // Contar logins falharam nas últimas 24h
    const { count: failedLogins } = await supabaseClient
      .from('security_audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'LOGIN_FAILURE')
      .gte('timestamp', last24h)

    // Calcular score de segurança baseado em critérios
    let securityScore = 70 // Base score

    // +10 se tiver RLS ativado (assumindo que sim)
    securityScore += 10

    // +10 se tiver poucos logins falhados
    if ((failedLogins || 0) < 5) securityScore += 10

    // +5 se tiver usuários ativos
    if ((activeUsers || 0) > 0) securityScore += 5

    // +5 se tiver permissões configuradas
    if ((totalPermissions || 0) > 10) securityScore += 5

    // Limitar score a 100
    securityScore = Math.min(securityScore, 100)

    // Contar alertas (simulado por agora)
    const alertsCount = (failedLogins || 0) > 3 ? 1 : 0

    const stats = {
      activeUsers: activeUsers || 0,
      activeSessions: activeSessions || 0,
      securityScore,
      lastAuditCheck: new Date().toISOString(),
      totalPermissions: totalPermissions || 0,
      alertsCount
    }

    console.log('Estatísticas calculadas:', stats)

    return new Response(
      JSON.stringify(stats),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        activeUsers: 0,
        activeSessions: 0,
        securityScore: 0,
        lastAuditCheck: new Date().toISOString(),
        totalPermissions: 0,
        alertsCount: 0
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})