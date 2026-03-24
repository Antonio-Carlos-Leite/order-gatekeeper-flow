
-- Tabela de produtos (estoque)
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  quantidade_estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Diretores podem ver produtos da empresa
CREATE POLICY "Users can view produtos of their empresa"
ON public.produtos FOR SELECT TO authenticated
USING (empresa_id = public.get_user_empresa_id(auth.uid()));

-- Diretores podem inserir produtos
CREATE POLICY "Diretores can insert produtos"
ON public.produtos FOR INSERT TO authenticated
WITH CHECK (
  empresa_id = public.get_user_empresa_id(auth.uid())
  AND public.has_role(auth.uid(), 'diretor')
);

-- Diretores podem atualizar produtos
CREATE POLICY "Diretores can update produtos"
ON public.produtos FOR UPDATE TO authenticated
USING (
  empresa_id = public.get_user_empresa_id(auth.uid())
  AND public.has_role(auth.uid(), 'diretor')
);

-- Diretores podem deletar produtos
CREATE POLICY "Diretores can delete produtos"
ON public.produtos FOR DELETE TO authenticated
USING (
  empresa_id = public.get_user_empresa_id(auth.uid())
  AND public.has_role(auth.uid(), 'diretor')
);

-- Tabela de movimentações de estoque
CREATE TABLE public.movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL,
  origem TEXT NOT NULL CHECK (origem IN ('pedido', 'ordem_servico', 'manual')),
  pedido_id UUID REFERENCES public.pedidos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view movimentacoes of their empresa"
ON public.movimentacoes_estoque FOR SELECT TO authenticated
USING (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Diretores can insert movimentacoes"
ON public.movimentacoes_estoque FOR INSERT TO authenticated
WITH CHECK (
  empresa_id = public.get_user_empresa_id(auth.uid())
  AND public.has_role(auth.uid(), 'diretor')
);
