-- Restrict empresas INSERT to diretores only
DROP POLICY IF EXISTS "Authenticated users can insert empresas" ON public.empresas;
CREATE POLICY "Diretores can insert empresas"
ON public.empresas FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'diretor'));
