import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthUserInfo } from './useAuth';

export interface Produto {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  quantidade_estoque: number;
  estoque_minimo: number;
  created_at: string;
}

export interface Movimentacao {
  id: string;
  empresa_id: string;
  produto_id: string;
  tipo: string;
  quantidade: number;
  origem: string;
  pedido_id: string | null;
  usuario_id: string | null;
  created_at: string;
  // joined
  usuario_nome?: string;
}

export function useEstoque(userInfo: AuthUserInfo | null) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = useCallback(async () => {
    if (!userInfo) return;
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');
    if (data) setProdutos(data as Produto[]);
  }, [userInfo]);

  const fetchMovimentacoes = useCallback(async () => {
    if (!userInfo) return;
    const { data } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) {
      // Fetch user names for movimentacoes that have usuario_id
      const userIds = [...new Set((data as any[]).filter(m => m.usuario_id).map(m => m.usuario_id))];
      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        if (profiles) {
          userMap = Object.fromEntries(profiles.map(p => [p.user_id, p.display_name]));
        }
      }
      
      setMovimentacoes((data as any[]).map(m => ({
        ...m,
        usuario_nome: m.usuario_id ? (userMap[m.usuario_id] || '—') : '—',
      })));
    }
  }, [userInfo]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProdutos(), fetchMovimentacoes()]);
    setLoading(false);
  }, [fetchProdutos, fetchMovimentacoes]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProduto = async (nome: string, descricao: string, estoque_minimo: number) => {
    if (!userInfo) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase.from('produtos').insert({
      empresa_id: userInfo.empresaId,
      nome,
      descricao: descricao || null,
      quantidade_estoque: 0,
      estoque_minimo,
    } as any).select().single();
    if (!error) await fetchProdutos();
    return { data, error };
  };

  const editProduto = async (id: string, nome: string, descricao: string, estoque_minimo: number) => {
    if (!userInfo) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('produtos')
      .update({ nome, descricao: descricao || null, estoque_minimo } as any)
      .eq('id', id);
    if (!error) await fetchProdutos();
    return { error };
  };

  const deleteProduto = async (id: string) => {
    if (!userInfo) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (!error) await fetchProdutos();
    return { error };
  };

  const addEntrada = async (produto_id: string, quantidade: number) => {
    if (!userInfo) return { error: new Error('Not authenticated') };

    const { error: movErr } = await supabase.from('movimentacoes_estoque').insert({
      empresa_id: userInfo.empresaId,
      produto_id,
      tipo: 'entrada',
      quantidade,
      origem: 'manual',
      usuario_id: userInfo.userId,
    } as any);
    if (movErr) return { error: movErr };

    const prod = produtos.find(p => p.id === produto_id);
    if (prod) {
      const { error: updErr } = await supabase
        .from('produtos')
        .update({ quantidade_estoque: prod.quantidade_estoque + quantidade } as any)
        .eq('id', produto_id);
      if (updErr) return { error: updErr };
    }

    await refresh();
    return { error: null };
  };

  const addSaida = async (produto_id: string, quantidade: number) => {
    if (!userInfo) return { error: new Error('Not authenticated') };

    const prod = produtos.find(p => p.id === produto_id);
    if (prod && prod.quantidade_estoque < quantidade) {
      return { error: new Error('Quantidade insuficiente em estoque') };
    }

    const { error: movErr } = await supabase.from('movimentacoes_estoque').insert({
      empresa_id: userInfo.empresaId,
      produto_id,
      tipo: 'saida',
      quantidade,
      origem: 'manual',
      usuario_id: userInfo.userId,
    } as any);
    if (movErr) return { error: movErr };

    if (prod) {
      await supabase
        .from('produtos')
        .update({ quantidade_estoque: Math.max(0, prod.quantidade_estoque - quantidade) } as any)
        .eq('id', produto_id);
    }

    await refresh();
    return { error: null };
  };

  const registrarSaidaPedido = async (produto_id: string, quantidade: number, pedido_id: string) => {
    if (!userInfo) return { error: new Error('Not authenticated') };

    const { error: movErr } = await supabase.from('movimentacoes_estoque').insert({
      empresa_id: userInfo.empresaId,
      produto_id,
      tipo: 'saida',
      quantidade,
      origem: 'pedido',
      pedido_id,
      usuario_id: userInfo.userId,
    } as any);
    if (movErr) return { error: movErr };

    const prod = produtos.find(p => p.id === produto_id);
    if (prod) {
      await supabase
        .from('produtos')
        .update({ quantidade_estoque: Math.max(0, prod.quantidade_estoque - quantidade) } as any)
        .eq('id', produto_id);
    }

    await refresh();
    return { error: null };
  };

  const produtosEstoqueBaixo = produtos.filter(p => p.quantidade_estoque <= p.estoque_minimo);

  return {
    produtos,
    movimentacoes,
    loading,
    produtosEstoqueBaixo,
    addProduto,
    editProduto,
    deleteProduto,
    addEntrada,
    addSaida,
    registrarSaidaPedido,
    refresh,
  };
}
