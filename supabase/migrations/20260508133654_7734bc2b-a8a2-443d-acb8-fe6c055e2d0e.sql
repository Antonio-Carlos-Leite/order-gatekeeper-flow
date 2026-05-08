-- Add empresa identity fields
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS estado text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS assinatura_url text,
  ADD COLUMN IF NOT EXISTS responsavel_nome text,
  ADD COLUMN IF NOT EXISTS responsavel_cargo text;

-- Allow diretores to update their own empresa
CREATE POLICY "Diretores can update their empresa"
ON public.empresas
FOR UPDATE
TO authenticated
USING (id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'diretor'::app_role))
WITH CHECK (id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'diretor'::app_role));

-- Storage bucket for empresa assets (logos and signatures)
INSERT INTO storage.buckets (id, name, public)
VALUES ('empresa-assets', 'empresa-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Empresa assets publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'empresa-assets');

-- Diretores upload to their empresa folder
CREATE POLICY "Diretores can upload empresa assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'empresa-assets'
  AND public.has_role(auth.uid(), 'diretor'::app_role)
  AND (storage.foldername(name))[1] = public.get_user_empresa_id(auth.uid())::text
);

CREATE POLICY "Diretores can update empresa assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'empresa-assets'
  AND public.has_role(auth.uid(), 'diretor'::app_role)
  AND (storage.foldername(name))[1] = public.get_user_empresa_id(auth.uid())::text
);

CREATE POLICY "Diretores can delete empresa assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'empresa-assets'
  AND public.has_role(auth.uid(), 'diretor'::app_role)
  AND (storage.foldername(name))[1] = public.get_user_empresa_id(auth.uid())::text
);