import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePedidos } from '@/hooks/usePedidos';
import { useEstoque } from '@/hooks/useEstoque';
import LoginForm from '@/components/LoginForm';
import AppHeader from '@/components/AppHeader';
import OrderForm from '@/components/OrderForm';
import MeusPedidos from '@/components/MeusPedidos';
import DirectorApproval from '@/components/DirectorApproval';
import ApprovedOrders from '@/components/ApprovedOrders';
import EstoquePanel from '@/components/EstoquePanel';
import OrdemServicoForm from '@/components/OrdemServicoForm';
import MaintenanceSection from '@/components/MaintenanceSection';
import { useEstoque } from '@/hooks/useEstoque';
import LoginForm from '@/components/LoginForm';
import AppHeader from '@/components/AppHeader';
import OrderForm from '@/components/OrderForm';
import MeusPedidos from '@/components/MeusPedidos';
import DirectorApproval from '@/components/DirectorApproval';
import ApprovedOrders from '@/components/ApprovedOrders';
import EstoquePanel from '@/components/EstoquePanel';
import OrdemServicoForm from '@/components/OrdemServicoForm';

type Page = 'order' | 'meus-pedidos' | 'approval' | 'approved' | 'estoque' | 'ordem-servico';

const Index = () => {
  const { userInfo, loading, signOut, maintenanceMode } = useAuth();
  const { pedidos, pendingOrders, processedOrders, createPedido, createOrdemServico, approvePedido } = usePedidos(userInfo);
  const estoque = useEstoque(userInfo);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);

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
    if (error) throw error;
  };

  const handleOrdemServicoSubmit = async (data: any) => {
    const { error } = await createOrdemServico(data);
    if (error) throw error;
  };

  const handleOrderApproval = async (orderId: string, status: 'approved' | 'rejected', comments?: string) => {
    const dbStatus = status === 'approved' ? 'aprovado' : 'rejeitado';
    const { error } = await approvePedido(orderId, dbStatus as 'aprovado' | 'rejeitado', comments);
    
    // Auto stock deduction on approval
    if (!error && status === 'approved') {
      const pedido = pedidos.find(p => p.id === orderId);
      if (pedido?.tipo_lampada) {
        // Find matching product by name
        const produto = estoque.produtos.find(p => 
          p.nome.toLowerCase() === pedido.tipo_lampada.toLowerCase()
        );
        if (produto && produto.quantidade_estoque > 0) {
          await estoque.registrarSaidaPedido(produto.id, 1, orderId);
        }
      }
    }
    
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
    tipo: p.tipo,
  });

  const legacyPending = pendingOrders.map(mapPedidoToLegacy);
  const legacyProcessed = processedOrders.map(mapPedidoToLegacy);
  const legacyAll = pedidos.map(mapPedidoToLegacy);

  // Default page based on role
  const defaultPage = (): Page => {
    if (userInfo.userType === 'diretor') return 'approval';
    if (userInfo.userType === 'estoque') return 'estoque';
    return 'order';
  };
  const activePage = currentPage || defaultPage();

  const canAccessEstoque = userInfo.userType === 'diretor' || userInfo.userType === 'estoque';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader
        userInfo={userInfo}
        currentPage={activePage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        pendingCount={pendingOrders.length}
        lowStockCount={estoque.produtosEstoqueBaixo.length}
      />

      <main className="max-w-7xl mx-auto p-4">
        {activePage === 'order' && userInfo.userType === 'funcionario' && (
          <OrderForm
            userInfo={legacyUserInfo}
            onSubmit={handleOrderSubmit}
            onLogout={handleLogout}
            onNavigateToApproved={() => setCurrentPage('approved')}
          />
        )}

        {activePage === 'meus-pedidos' && userInfo.userType === 'funcionario' && (
          <MeusPedidos pedidos={legacyAll} />
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

        {activePage === 'ordem-servico' && userInfo.userType === 'diretor' && (
          <OrdemServicoForm onSubmit={handleOrdemServicoSubmit} />
        )}

        {activePage === 'approved' && (
          <ApprovedOrders
            approvedOrders={legacyProcessed}
            userInfo={legacyUserInfo}
            onLogout={handleLogout}
            onBackToOrders={() => setCurrentPage(defaultPage())}
            allOrders={legacyAll}
          />
        )}

        {activePage === 'estoque' && canAccessEstoque && (
          <EstoquePanel
            produtos={estoque.produtos}
            movimentacoes={estoque.movimentacoes}
            produtosEstoqueBaixo={estoque.produtosEstoqueBaixo}
            onAddProduto={estoque.addProduto}
            onAddEntrada={estoque.addEntrada}
            onAddSaida={estoque.addSaida}
            onBack={() => setCurrentPage(defaultPage())}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
