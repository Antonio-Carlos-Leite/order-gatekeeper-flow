-- Allow authenticated users to insert empresas (maintenance)
CREATE POLICY "Authenticated users can insert empresas"
ON public.empresas FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated users to view all empresas (for login/registration)
DROP POLICY IF EXISTS "Users can view their own empresa" ON public.empresas;
CREATE POLICY "Authenticated users can view all empresas"
ON public.empresas FOR SELECT TO authenticated
USING (true);

-- Also allow anon to read empresas for login flow
CREATE POLICY "Anon can view empresas"
ON public.empresas FOR SELECT TO anon
USING (true);
