/**
 * Edge function preparada para envio de emails transacionais do IPPark.
 *
 * STATUS ATUAL:
 *   O domínio próprio do IPPARK ainda não foi configurado. Nesta versão,
 *   a função apenas REGISTRA o envio na tabela `audit_logs` (e responde
 *   200) para que o restante do app já possa chamá-la normalmente.
 *
 * QUANDO O DOMÍNIO FOR ATIVADO:
 *   1. Configurar SPF/DKIM/DMARC do domínio (ex.: notify.ippark.com.br)
 *   2. Configurar templates customizados no provedor de autenticação,
 *      ou habilitar o `auth-email-hook` apontando para os templates em
 *      `src/lib/emailTemplates.ts`.
 *   3. Trocar o bloco "STUB" abaixo pela chamada real ao provedor
 *      (Resend, SendGrid, ou o transactional do Lovable Cloud).
 *
 * A interface (templateName + data) JÁ ESTÁ ESTÁVEL e não muda na
 * migração para domínio próprio.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  templateName: 'verify_email' | 'recover_password' | 'temporary_password' | 'welcome' | 'invite' | 'password_changed' | 'security_alert';
  recipientEmail: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    if (!body.templateName || !body.recipientEmail) {
      return new Response(JSON.stringify({ error: 'templateName e recipientEmail são obrigatórios' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // ---------- STUB (sem domínio próprio configurado) ----------
    // Apenas registra o envio em audit_logs. Substituir pelo provider real
    // quando o domínio estiver verificado.
    await supabase.from('audit_logs').insert({
      action: 'email_send_attempt',
      actor_label: 'system',
      metadata: {
        template: body.templateName,
        recipient: body.recipientEmail,
        status: 'queued_stub',
        note: 'Aguardando configuração de domínio próprio. Email não foi enviado.',
        data: body.data ?? {},
      },
    });
    // ---------- FIM DO STUB ----------

    return new Response(
      JSON.stringify({
        ok: true,
        delivered: false,
        reason: 'no_custom_domain_configured',
        message: 'Email registrado. Será enviado quando o domínio próprio do IPPARK for ativado.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
