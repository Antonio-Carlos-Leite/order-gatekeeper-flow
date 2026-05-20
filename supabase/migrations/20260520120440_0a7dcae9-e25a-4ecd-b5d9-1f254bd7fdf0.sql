
-- ============= USER STATUS =============
CREATE TABLE public.user_status (
  user_id UUID PRIMARY KEY,
  empresa_id UUID,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','ativo','bloqueado','inativo')),
  email_verificado BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own status"
  ON public.user_status FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER set_user_status_updated_at
  BEFORE UPDATE ON public.user_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= AUDIT LOGS =============
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_label TEXT,
  action TEXT NOT NULL,
  target_user_id UUID,
  empresa_id UUID,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT policies for authenticated users; only service_role (edge functions) reads/writes.
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_target_user ON public.audit_logs (target_user_id);
CREATE INDEX idx_audit_logs_empresa ON public.audit_logs (empresa_id);

-- ============= ACTIVE SESSIONS =============
CREATE TABLE public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  empresa_id UUID,
  session_token TEXT,
  ip TEXT,
  user_agent TEXT,
  device TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.active_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_active_sessions_user ON public.active_sessions (user_id);

-- ============= PASSWORD HISTORY =============
CREATE TABLE public.password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role accesses this.
CREATE INDEX idx_password_history_user ON public.password_history (user_id, created_at DESC);

-- ============= LOGIN ATTEMPTS =============
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role accesses this.
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts (email, created_at DESC);

-- ============= AUDIT HELPER =============
CREATE OR REPLACE FUNCTION public.log_audit(
  _actor_id UUID,
  _actor_label TEXT,
  _action TEXT,
  _target_user_id UUID,
  _empresa_id UUID,
  _ip TEXT,
  _user_agent TEXT,
  _metadata JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (actor_id, actor_label, action, target_user_id, empresa_id, ip, user_agent, metadata)
  VALUES (_actor_id, _actor_label, _action, _target_user_id, _empresa_id, _ip, _user_agent, COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ============= EXTEND handle_new_user TO CREATE user_status =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, empresa_id, display_name, username)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'empresa_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'funcionario')
  );
  INSERT INTO public.user_status (user_id, empresa_id, status, email_verificado, must_change_password)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'empresa_id')::UUID,
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'ativo' ELSE 'pendente' END,
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false)
  );
  RETURN NEW;
END;
$$;
