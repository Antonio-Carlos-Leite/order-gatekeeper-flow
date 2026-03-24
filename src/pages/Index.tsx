import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePedidos } from '@/hooks/usePedidos';
import { useEstoque } from '@/hooks/useEstoque';
import LoginForm from '@/components/LoginForm';
import OrderForm from '@/components/OrderForm';
import DirectorApproval from '@/components/DirectorApproval';
import ApprovedOrders from '@/components/ApprovedOrders';
import EstoquePanel from '@/components/EstoquePanel';

export interface AccessCode {
  code: string;
  municipio: string;
}

export interface RegisteredUser {
  username: string;
  password: string;
  userType: 'funcionario' | 'diretor';
  name: string;
  codigoAcesso: string;
}

const Index = () => {
  const { userInfo, loading, signOut } = useAuth();
  const { pedidos, pendingOrders, processedOrders, createPedido, approvePedido } = usePedidos(userInfo);
  const estoque = useEstoque(userInfo);
  const [currentPage, setCurrentPage] = useState<'order' | 'approval' | 'approved' | 'estoque'>('order');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return <LoginForm />;
  }

  const legacyUserInfo = {
    username: userInfo.username,
    password: '',
    userType: userInfo.userType,
    codigoAcesso: userInfo.codigoAcesso,
    municipio: userInfo.municipio,
    name: userInfo.displayName,
  };

  const handleOrderSubmit = async (data: any) => {
    const { error } = await createPedido(data);
    if (error) console.error('Error creating pedido:', error);
  };

  const handleOrderApproval = async (orderId: string, status: 'approved' | 'rejected', comments?: string) => {
    const dbStatus = status === 'approved' ? 'aprovado' : 'rejeitado';
    const { error } = await approvePedido(orderId, dbStatus as 'aprovado' | 'rejeitado', comments);
    if (error) console.error('Error approving pedido:', error);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const mapPedidoToLegacy = (p: any) => ({
    id: p.id,
    produto: p.tipo_servico || '',
    codigoDoPoste: p.codigo_poste || '',
    solicitante: p.solicitante || '',
    cpf: p.cpf || '',
    Rua: p.rua || '',
    Bairro: p.bairro || '',
    localização: p.localizacao || '',
    DatadaSolicitação: p.data_solicitacao || '',
    tipoServico: p.tipo_servico || '',
    tipoLampada: p.tipo_lampada || '',
    observações: p.observacoes_atendimento || '',
    comments: p.comments || p.observacoes_tecnico || '',
    enviadoPor: userInfo.displayName,
    dataEnvio: new Date(p.created_at).toLocaleString('pt-BR'),
    status: p.status === 'aprovado' ? 'approved' : p.status === 'rejeitado' ? 'rejected' : 'pending',
    municipio: userInfo.municipio,
    codigoAcesso: userInfo.codigoAcesso,
    approvedAt: p.data_aprovacao ? new Date(p.data_aprovacao).toLocaleString('pt-BR') : '',
  });

  const legacyPending = pendingOrders.map(mapPedidoToLegacy);
  const legacyProcessed = processedOrders.map(mapPedidoToLegacy);
  const legacyAll = pedidos.map(mapPedidoToLegacy);

  const activePage = currentPage || (userInfo.userType === 'diretor' ? 'approval' : 'order');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {activePage === 'order' && userInfo.userType === 'funcionario' && (
        <OrderForm
          userInfo={legacyUserInfo}
          onSubmit={handleOrderSubmit}
          onLogout={handleLogout}
          onNavigateToApproved={() => setCurrentPage('approved')}
        />
      )}
      {(activePage === 'approval' || (activePage === 'order' && userInfo.userType === 'diretor')) && userInfo.userType === 'diretor' && (
        <DirectorApproval
          orders={legacyPending}
          userInfo={legacyUserInfo}
          onApprove={handleOrderApproval}
          onLogout={handleLogout}
          onNavigateToApproved={() => setCurrentPage('approved')}
          onNavigateToEstoque={() => setCurrentPage('estoque')}
          lowStockCount={estoque.produtosEstoqueBaixo.length}
        />
      )}
      {activePage === 'approved' && (
        <ApprovedOrders
          approvedOrders={legacyProcessed}
          userInfo={legacyUserInfo}
          onLogout={handleLogout}
          onBackToOrders={() => setCurrentPage(userInfo.userType === 'diretor' ? 'approval' : 'order')}
          allOrders={legacyAll}
        />
      )}
      {activePage === 'estoque' && userInfo.userType === 'diretor' && (
        <EstoquePanel
          produtos={estoque.produtos}
          movimentacoes={estoque.movimentacoes}
          produtosEstoqueBaixo={estoque.produtosEstoqueBaixo}
          onAddProduto={estoque.addProduto}
          onAddEntrada={estoque.addEntrada}
          onBack={() => setCurrentPage('approval')}
        />
      )}
    </div>
  );
};

export default Index;
