-- Fix 1: Remove anon access to empresas (exposes codigo_acesso)
DROP POLICY IF EXISTS "Anon can view empresas" ON public.empresas;

-- Fix 2: Remove pedidos from realtime to prevent CPF broadcast
ALTER PUBLICATION supabase_realtime DROP TABLE public.pedidos;
