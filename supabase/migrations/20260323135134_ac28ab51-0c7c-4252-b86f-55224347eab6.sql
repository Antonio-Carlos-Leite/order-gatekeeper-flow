
-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('funcionario', 'diretor');

-- Enum para status de pedido
CREATE TYPE public.order_status AS ENUM ('rascunho', 'aguardando_aprovacao', 'aprovado', 'rejeitado');

-- Enum para tipo de pedido
CREATE TYPE public.order_type AS ENUM ('pedido', 'ordem_servico');

-- Tabela empresas
CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo_acesso TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Tabela profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tabela user_roles (separada conforme boas práticas)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Tabela pedidos
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  criado_por UUID NOT NULL REFERENCES auth.users(id),
  aprovado_por UUID REFERENCES auth.users(id),
  tipo public.order_type NOT NULL DEFAULT 'pedido',
  status public.order_status NOT NULL DEFAULT 'rascunho',
  solicitante TEXT,
  codigo_poste TEXT,
  tipo_servico TEXT,
  tipo_lampada TEXT,
  observacoes_atendimento TEXT,
  observacoes_tecnico TEXT,
  cpf TEXT,
  rua TEXT,
  bairro TEXT,
  localizacao TEXT,
  data_solicitacao TEXT,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Security definer function para checar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function para pegar empresa_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies para empresas
CREATE POLICY "Users can view their own empresa"
  ON public.empresas FOR SELECT TO authenticated
  USING (id = public.get_user_empresa_id(auth.uid()));

-- RLS Policies para profiles
CREATE POLICY "Users can view profiles in their empresa"
  ON public.profiles FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies para pedidos
CREATE POLICY "Funcionarios can view their own pedidos"
  ON public.pedidos FOR SELECT TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND (
      criado_por = auth.uid()
      OR public.has_role(auth.uid(), 'diretor')
    )
  );

CREATE POLICY "Funcionarios can create pedidos"
  ON public.pedidos FOR INSERT TO authenticated
  WITH CHECK (
    criado_por = auth.uid()
    AND empresa_id = public.get_user_empresa_id(auth.uid())
  );

CREATE POLICY "Funcionarios can update their own rascunhos"
  ON public.pedidos FOR UPDATE TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND (
      (criado_por = auth.uid() AND status = 'rascunho')
      OR public.has_role(auth.uid(), 'diretor')
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir empresas iniciais
INSERT INTO public.empresas (nome, codigo_acesso) VALUES
  ('Sede', '0001'),
  ('Jucás', '2601');
