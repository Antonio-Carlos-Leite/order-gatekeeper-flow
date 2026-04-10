import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthUserInfo } from './useAuth';

export function usePedidos(userInfo: AuthUserInfo | null) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Poll for updates periodically instead of realtime (removed for security - CPF data)
  useEffect(() => {
    if (!userInfo) return;
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, [userInfo, fetchPedidos]);

  const createPedido = async (pedidoData: any) => {
    if (!userInfo) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase.from('pedidos').insert({
      empresa_id: userInfo.empresaId,
      criado_por: userInfo.userId,
      tipo: 'pedido' as const,
      status: 'aguardando_aprovacao' as const,
      solicitante: pedidoData.solicitante,
      cpf: pedidoData.cpf,
      rua: pedidoData.Rua,
      bairro: pedidoData.Bairro,
      localizacao: pedidoData.localização,
      data_solicitacao: pedidoData.DatadaSolicitação,
      tipo_servico: pedidoData.tipoServico,
      tipo_lampada: pedidoData.tipoLampada,
      codigo_poste: pedidoData.codigoDoPoste,
      observacoes_atendimento: pedidoData.observações,
    }).select().single();

    if (!error) {
      await fetchPedidos();
    }
    return { data, error };
  };

  const createOrdemServico = async (pedidoData: any) => {
    if (!userInfo) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase.from('pedidos').insert({
      empresa_id: userInfo.empresaId,
      criado_por: userInfo.userId,
      tipo: 'ordem_servico' as const,
      status: 'aprovado' as const,
      aprovado_por: userInfo.userId,
      data_aprovacao: new Date().toISOString(),
      solicitante: pedidoData.solicitante,
      cpf: pedidoData.cpf,
      rua: pedidoData.Rua,
      bairro: pedidoData.Bairro,
      localizacao: pedidoData.localização,
      data_solicitacao: pedidoData.DatadaSolicitação,
      tipo_servico: pedidoData.tipoServico,
      tipo_lampada: pedidoData.tipoLampada,
      codigo_poste: pedidoData.codigoDoPoste,
      observacoes_atendimento: pedidoData.observações,
    }).select().single();

    if (!error) {
      await fetchPedidos();
    }
    return { data, error };
  };

  const updatePedidoStatus = async (pedidoId: string, status: string) => {
    if (!userInfo) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase.from('pedidos').update({
      status: status as any,
      updated_at: new Date().toISOString(),
    }).eq('id', pedidoId).select().single();
    if (!error) await fetchPedidos();
    return { data, error };
  };

  const approvePedido = async (pedidoId: string, status: 'aprovado' | 'rejeitado', comments?: string) => {
    if (!userInfo) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase.from('pedidos').update({
      status,
      aprovado_por: userInfo.userId,
      comments,
      observacoes_tecnico: comments,
      data_aprovacao: new Date().toISOString(),
    }).eq('id', pedidoId).select().single();

    if (!error) {
      await fetchPedidos();
    }
    return { data, error };
  };

  const pendingOrders = pedidos.filter(p => p.status === 'aguardando_aprovacao');
  const processedOrders = pedidos.filter(p => p.status === 'aprovado' || p.status === 'rejeitado');

  const ordensServico = pedidos.filter(p => p.tipo === 'ordem_servico');

  return { pedidos, pendingOrders, processedOrders, ordensServico, loading, createPedido, createOrdemServico, approvePedido, updatePedidoStatus, refetch: fetchPedidos };
}
