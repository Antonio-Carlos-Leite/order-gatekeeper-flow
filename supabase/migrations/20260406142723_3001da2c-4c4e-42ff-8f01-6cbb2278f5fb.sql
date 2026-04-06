CREATE POLICY "Estoque can insert produtos"
ON public.produtos FOR INSERT TO authenticated
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'estoque'));

CREATE POLICY "Estoque can update produtos"
ON public.produtos FOR UPDATE TO authenticated
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'estoque'));

CREATE POLICY "Estoque can delete produtos"
ON public.produtos FOR DELETE TO authenticated
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'estoque'));

CREATE POLICY "Estoque can insert movimentacoes"
ON public.movimentacoes_estoque FOR INSERT TO authenticated
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'estoque'));