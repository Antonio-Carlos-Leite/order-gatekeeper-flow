import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autorizado" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await admin.auth.getUser(token);
    if (!caller) return json({ error: "Não autorizado" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const ip = req.headers.get("x-forwarded-for") ?? "";
    const ua = req.headers.get("user-agent") ?? "";

    const logAudit = async (actionName: string, target?: string, meta: any = {}) => {
      await admin.rpc("log_audit", {
        _actor_id: caller.id,
        _actor_label: caller.email ?? "",
        _action: actionName,
        _target_user_id: target ?? null,
        _empresa_id: null,
        _ip: ip,
        _user_agent: ua,
        _metadata: meta,
      });
    };

    switch (action) {
      case "list_users": {
        const { data: profiles } = await admin
          .from("profiles")
          .select("*, user_roles(role), empresas:empresa_id(nome, codigo_acesso)")
          .order("created_at", { ascending: false });
        const { data: statuses } = await admin.from("user_status").select("*");
        const statusMap = new Map((statuses ?? []).map((s: any) => [s.user_id, s]));
        const enriched = (profiles ?? []).map((p: any) => ({
          ...p,
          status: statusMap.get(p.user_id) ?? null,
        }));
        return json({ users: enriched });
      }

      case "list_audit_logs": {
        const { data } = await admin
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        return json({ logs: data ?? [] });
      }

      case "list_active_sessions": {
        const { data } = await admin
          .from("active_sessions")
          .select("*")
          .is("revoked_at", null)
          .order("last_seen_at", { ascending: false })
          .limit(200);
        return json({ sessions: data ?? [] });
      }

      case "list_login_attempts": {
        const { data } = await admin
          .from("login_attempts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        return json({ attempts: data ?? [] });
      }

      case "block_user": {
        const { target_user_id } = body;
        if (!target_user_id) return json({ error: "target_user_id obrigatório" }, 400);
        await admin.from("user_status").update({ status: "bloqueado", locked_until: null, updated_at: new Date().toISOString() }).eq("user_id", target_user_id);
        await admin.auth.admin.updateUserById(target_user_id, { ban_duration: "8760h" });
        await logAudit("user.block", target_user_id);
        return json({ success: true });
      }

      case "unblock_user": {
        const { target_user_id } = body;
        if (!target_user_id) return json({ error: "target_user_id obrigatório" }, 400);
        await admin.from("user_status").update({ status: "ativo", failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() }).eq("user_id", target_user_id);
        await admin.auth.admin.updateUserById(target_user_id, { ban_duration: "none" });
        await logAudit("user.unblock", target_user_id);
        return json({ success: true });
      }

      case "send_password_reset": {
        const { email } = body;
        if (!email) return json({ error: "email obrigatório" }, 400);
        const redirectTo = `${req.headers.get("origin") ?? ""}/reset-password`;
        const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) return json({ error: error.message }, 400);
        await logAudit("user.password_reset_sent", null, { email });
        return json({ success: true });
      }

      case "delete_user": {
        const { target_user_id } = body;
        if (!target_user_id) return json({ error: "target_user_id obrigatório" }, 400);
        if (target_user_id === caller.id) return json({ error: "Não é possível excluir o próprio usuário" }, 400);
        const { error } = await admin.auth.admin.deleteUser(target_user_id);
        if (error) return json({ error: error.message }, 400);
        await logAudit("user.delete", target_user_id);
        return json({ success: true });
      }

      case "create_user": {
        const { email, display_name, username, empresa_id, role } = body;
        if (!email || !display_name || !empresa_id || !role) {
          return json({ error: "Campos obrigatórios: email, display_name, empresa_id, role" }, 400);
        }
        const tempPwd = `Ipp${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}!9A`;
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          password: tempPwd,
          email_confirm: true,
          user_metadata: {
            empresa_id,
            display_name,
            username: username ?? email,
            role,
            must_change_password: true,
          },
        });
        if (createErr) return json({ error: createErr.message }, 400);
        const newUserId = created.user?.id;
        if (newUserId) {
          await admin.from("user_status").update({
            must_change_password: true,
            status: "ativo",
            email_verificado: true,
          }).eq("user_id", newUserId);
        }
        await logAudit("user.create", newUserId ?? null, { email, role, empresa_id });
        return json({ success: true, user_id: newUserId, temporary_password: tempPwd });
      }

      case "force_password_change": {
        const { target_user_id } = body;
        if (!target_user_id) return json({ error: "target_user_id obrigatório" }, 400);
        await admin.from("user_status").update({ must_change_password: true, updated_at: new Date().toISOString() }).eq("user_id", target_user_id);
        await logAudit("user.force_password_change", target_user_id);
        return json({ success: true });
      }

      case "list_empresas": {
        const { data } = await admin.from("empresas").select("id, nome, codigo_acesso").order("nome");
        return json({ empresas: data ?? [] });
      }

      case "end_session": {
        const { session_id, target_user_id } = body;
        if (session_id) {
          await admin.from("active_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", session_id);
        }
        if (target_user_id) {
          await admin.auth.admin.signOut(target_user_id as string, "global" as any).catch(() => {});
        }
        await logAudit("session.end", target_user_id ?? null, { session_id });
        return json({ success: true });
      }

      default:
        return json({ error: "Ação inválida" }, 400);
    }
  } catch (e: any) {
    return json({ error: e?.message ?? "Erro interno" }, 500);
  }
});
