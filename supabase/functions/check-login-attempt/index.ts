import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: s });

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, key);

    const { phase, email, success, reason, user_id } = await req.json();
    const ip = req.headers.get("x-forwarded-for") ?? "";
    const ua = req.headers.get("user-agent") ?? "";

    if (!email && !user_id) return json({ error: "email ou user_id obrigatório" }, 400);

    // PRE-CHECK: see if account is locked
    if (phase === "check" && email) {
      const { data: profile } = await admin
        .from("profiles")
        .select("user_id")
        .eq("username", email)
        .maybeSingle();
      const uid = profile?.user_id;
      if (!uid) return json({ allowed: true });
      const { data: st } = await admin.from("user_status").select("*").eq("user_id", uid).maybeSingle();
      if (st?.status === "bloqueado") return json({ allowed: false, reason: "Conta bloqueada. Contate o administrador." });
      if (st?.locked_until && new Date(st.locked_until) > new Date()) {
        const mins = Math.ceil((new Date(st.locked_until).getTime() - Date.now()) / 60000);
        return json({ allowed: false, reason: `Conta temporariamente bloqueada. Tente em ${mins} min.` });
      }
      return json({ allowed: true });
    }

    // RECORD: log attempt + handle counters / session
    if (phase === "record") {
      await admin.from("login_attempts").insert({
        email: email ?? "", ip, user_agent: ua, success: !!success, reason: reason ?? null,
      });

      // resolve user_id if needed
      let uid = user_id as string | undefined;
      if (!uid && email) {
        const { data: profile } = await admin.from("profiles").select("user_id").eq("username", email).maybeSingle();
        uid = profile?.user_id;
      }
      if (!uid) return json({ success: true });

      if (success) {
        await admin.from("user_status").update({
          failed_attempts: 0,
          locked_until: null,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("user_id", uid);

        // register active session
        await admin.from("active_sessions").insert({
          user_id: uid, ip, user_agent: ua, device: ua?.slice(0, 120) ?? null,
        });
      } else {
        const { data: st } = await admin.from("user_status").select("failed_attempts").eq("user_id", uid).maybeSingle();
        const attempts = (st?.failed_attempts ?? 0) + 1;
        const locked = attempts >= MAX_ATTEMPTS;
        await admin.from("user_status").update({
          failed_attempts: attempts,
          locked_until: locked ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }).eq("user_id", uid);
        if (locked) {
          await admin.rpc("log_audit", {
            _actor_id: null, _actor_label: email ?? "", _action: "user.auto_lock",
            _target_user_id: uid, _empresa_id: null, _ip: ip, _user_agent: ua,
            _metadata: { attempts },
          });
        }
        return json({ success: true, attempts, locked });
      }

      return json({ success: true });
    }

    return json({ error: "phase inválida" }, 400);
  } catch (e: any) {
    return json({ error: e?.message ?? "Erro" }, 500);
  }
});
