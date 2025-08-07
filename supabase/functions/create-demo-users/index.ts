import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const testUsers = [
      {
        email: 'admin@kerigma.com',
        password: 'admin123',
        name: 'Admin Sistema',
        tipo_usuario: 'admin'
      },
      {
        email: 'pastor@kerigma.com',
        password: 'pastor123', 
        name: 'Pastor Carlos Lima',
        tipo_usuario: 'pastor'
      },
      {
        email: 'aluno@kerigma.com',
        password: 'aluno123',
        name: 'João Silva',
        tipo_usuario: 'aluno'
      },
      {
        email: 'lider@kerigma.com',
        password: 'lider123',
        name: 'Maria Santos',
        tipo_usuario: 'lider_celula'
      }
    ];

    const results = [];

    for (const testUser of testUsers) {
      try {
        // Create user in auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
            nome: testUser.name,
            tipo_usuario: testUser.tipo_usuario
          }
        });

        if (authError && !authError.message.includes('already registered')) {
          throw authError;
        }

        let userId = authData?.user?.id;

        // If user already exists, get their ID
        if (!userId) {
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === testUser.email);
          userId = existingUser?.id;
        }

        if (userId) {
          // Get or create igreja sede
          let { data: igreja, error: igrejaError } = await supabaseAdmin
            .from('igrejas')
            .select('id')
            .eq('tipo', 'Sede')
            .maybeSingle();

          if (!igreja || igrejaError) {
            const { data: novaIgreja, error: createError } = await supabaseAdmin
              .from('igrejas')
              .insert({
                nome: 'Igreja Cristã Batista Nacional - Sede',
                tipo: 'Sede',
                endereco: 'Endereço Sede',
                telefone: '(11) 99999-9999',
                email: 'contato@kerigma.com',
                ativa: true
              })
              .select('id')
              .single();
            
            if (createError) {
              throw new Error(`Erro ao criar igreja: ${createError.message}`);
            }
            igreja = novaIgreja;
          }

          // Ensure we have a valid igreja_id
          if (!igreja?.id) {
            throw new Error('Não foi possível obter ou criar igreja_id');
          }

          // Insert into usuarios_admin for admin/pastor users
          if (testUser.tipo_usuario === 'admin' || testUser.tipo_usuario === 'pastor') {
            const { error: adminError } = await supabaseAdmin
              .from('usuarios_admin')
              .upsert({
                user_id: userId,
                email: testUser.email,
                nome: testUser.name,
                papel: 'admin',
                ativo: true,
                igreja_id: igreja.id
              }, {
                onConflict: 'user_id'
              });

            if (adminError) {
              console.error(`Erro ao inserir admin ${testUser.email}:`, adminError);
              throw adminError;
            }
          }

          // Insert into pessoas table
          await supabaseAdmin
            .from('pessoas')
            .upsert({
              nome_completo: testUser.name,
              email: testUser.email,
              telefone: '(11) 99999-' + Math.floor(Math.random() * 9000 + 1000),
              data_nascimento: '1990-01-01',
              tipo_pessoa: testUser.tipo_usuario === 'lider_celula' ? 'lider' : 'membro',
              situacao: 'ativo',
              estado_espiritual: 'batizado',
              papel_igreja: testUser.tipo_usuario,
              igreja_id: igreja?.id,
              user_id: userId
            }, {
              onConflict: 'email'
            });

          results.push({
            email: testUser.email,
            status: 'success',
            message: 'Usuario criado/atualizado com sucesso'
          });
        }

      } catch (error) {
        console.error(`Error creating user ${testUser.email}:`, error);
        results.push({
          email: testUser.email,
          status: 'error',
          message: error.message
        });
      }
    }

    // Create sample data
    try {
      const { data: igreja } = await supabaseAdmin
        .from('igrejas')
        .select('id')
        .eq('tipo', 'Sede')
        .single();

      // Create sample cell
      await supabaseAdmin
        .from('celulas')
        .upsert({
          nome: 'Célula Esperança',
          lider: 'Maria Santos Líder',
          endereco: 'Rua das Flores, 123',
          bairro: 'Centro',
          dia_semana: 'Quarta-feira',
          horario: '19:30:00',
          telefone: '(11) 99999-2222',
          ativa: true,
          igreja_id: igreja?.id
        }, {
          onConflict: 'nome'
        });

      // Create sample course
      await supabaseAdmin
        .from('cursos_ensino')
        .upsert({
          nome: 'Fundamentos da Fé',
          descricao: 'Curso básico sobre os fundamentos da fé cristã',
          categoria: 'discipulado',
          nivel: 'iniciante',
          ativo: true,
          carga_horaria: 40,
          emite_certificado: true
        }, {
          onConflict: 'nome'
        });

      // Create sample event
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 3);
      
      await supabaseAdmin
        .from('agenda_eventos')
        .upsert({
          titulo: 'Culto de Domingo',
          descricao: 'Culto dominical de adoração e palavra',
          data_inicio: eventDate.toISOString(),
          data_fim: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          local: 'Templo Principal',
          tipo: 'culto',
          publico: true,
          igreja_id: igreja?.id
        }, {
          onConflict: 'titulo'
        });

    } catch (error) {
      console.error('Error creating sample data:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'Usuários demo criados com sucesso!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});