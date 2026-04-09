
-- Add usuario_id column to track who performed the movement
ALTER TABLE public.movimentacoes_estoque 
ADD COLUMN usuario_id uuid DEFAULT NULL;

-- Update existing INSERT policies to also validate usuario_id matches auth.uid()
-- (keeping existing policies since they work, just adding the column)
