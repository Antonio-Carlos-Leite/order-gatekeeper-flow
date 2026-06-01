import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePedidos } from '@/hooks/usePedidos';
import { useEstoque } from '@/hooks/useEstoque';
import LoginForm from '@/components/LoginForm';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar, { type Page } from '@/components/AppSidebar';
import AppTopbar from '@/components/AppTopbar';

import MeusPedidos from '@/components/MeusPedidos';
import DirectorApproval from '@/components/DirectorApproval';
import ApprovedOrders from '@/components/ApprovedOrders';
import EstoquePanel from '@/components/EstoquePanel';
import OrdemServicoForm from '@/components/OrdemServicoForm';
import OrdemServicoList from '@/components/OrdemServicoList';
import EmpresaConfig from '@/components/EmpresaConfig';
import MaintenanceSection from '@/components/MaintenanceSection';
import FirstAccessGate from '@/components/FirstAccessGate';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { userInfo, loading, signOut, maintenanceMode, setMaintenanceMode } = useAuth();
  const { pedidos, pendingOrders, processedOrders, ordensServico, createPedido, createOrdemServico, approvePedido, updatePedidoStatus } = usePedidos(userInfo);
  const estoque = useEstoque(userInfo);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [mustChangePwd, setMustChangePwd] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userInfo?.userId) { setMustChangePwd(null); return; }
    supabase.from('user_status').select('must_change_password').eq('user_id', userInfo.userId).maybeSingle()
      .then(({ data }) => setMustChangePwd(Boolean(data?.must_change_password)));
  }, [userInfo?.userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) return <LoginForm />;

  if (mustChangePwd) {
    return <FirstAccessGate userId={userInfo.userId} onCompleted={() => setMustChangePwd(false)} onSignOut={signOut} />;
  }

  if (maintenanceMode) {
    return <MaintenanceSection onExit={() => { setMaintenanceMode(false); signOut(); }} />;
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
    const result = await createOrdemServico(data);
    if (result.error) throw result.error;
    return result;
  };

  const handleOrderApproval = async (orderId: string, status: 'approved' | 'rejected', comments?: string) => {
    const dbStatus = status === 'approved' ? 'aprovado' : 'rejeitado';
    const { error } = await approvePedido(orderId, dbStatus as 'aprovado' | 'rejeitado', comments);
    if (!error && status === 'approved') {
      const pedido = pedidos.find(p => p.id === orderId);
      if (pedido?.tipo_lampada) {
        const produto = estoque.produtos.find(p => p.nome.toLowerCase() === pedido.tipo_lampada.toLowerCase());
        if (produto && produto.quantidade_estoque > 0) {
          await estoque.registrarSaidaPedido(produto.id, 1, orderId);
        }
      }
    }
    if (error) console.error('Error approving pedido:', error);
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

  const defaultPage = (): Page => {
    if (userInfo.userType === 'diretor') return 'approval';
    if (userInfo.userType === 'estoque') return 'estoque';
    return 'order';
  };
  const activePage: Page = currentPage || defaultPage();
  const canAccessEstoque = userInfo.userType === 'diretor' || userInfo.userType === 'estoque';

  const empresaInfo = {
    nome: userInfo.municipio,
    municipio: userInfo.municipio,
    codigoAcesso: userInfo.codigoAcesso,
    cidade: userInfo.cidade,
    estado: userInfo.estado,
    logoUrl: userInfo.logoUrl,
    assinaturaUrl: userInfo.assinaturaUrl,
    responsavelNome: userInfo.responsavelNome,
    responsavelCargo: userInfo.responsavelCargo,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          userType={userInfo.userType}
          currentPage={activePage}
          onNavigate={setCurrentPage}
          onLogout={signOut}
          pendingCount={pendingOrders.length}
          lowStockCount={estoque.produtosEstoqueBaixo.length}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AppTopbar
            empresaNome={userInfo.municipio}
            cidade={userInfo.cidade}
            estado={userInfo.estado}
            codigoAcesso={userInfo.codigoAcesso}
            logoUrl={userInfo.logoUrl}
            displayName={userInfo.displayName}
            userType={userInfo.userType}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-surface">
            <div className="max-w-[1600px] mx-auto">
              {activePage === 'order' && userInfo.userType === 'funcionario' && (
                <OrdemServicoForm
                  onSubmit={async (data) => { await handleOrderSubmit(data); }}
                  empresa={empresaInfo}
                  responsavel={userInfo.displayName}
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
                  onLogout={signOut}
                  onNavigateToApproved={() => setCurrentPage('approved')}
                  onNavigateToEstoque={() => setCurrentPage('estoque')}
                  lowStockCount={estoque.produtosEstoqueBaixo.length}
                />
              )}

              {activePage === 'ordem-servico' && userInfo.userType === 'diretor' && (
                <OrdemServicoForm
                  onSubmit={handleOrdemServicoSubmit}
                  empresa={empresaInfo}
                  responsavel={userInfo.displayName}
                />
              )}

              {activePage === 'os-list' && userInfo.userType === 'diretor' && (
                <OrdemServicoList
                  orders={ordensServico}
                  empresa={empresaInfo}
                  userType={userInfo.userType}
                  responsavel={userInfo.displayName}
                  onUpdateStatus={updatePedidoStatus}
                />
              )}

              {activePage === 'empresa-config' && userInfo.userType === 'diretor' && (
                <EmpresaConfig userInfo={userInfo} />
              )}

              {activePage === 'approved' && (
                <ApprovedOrders
                  approvedOrders={legacyProcessed}
                  userInfo={legacyUserInfo}
                  onLogout={signOut}
                  onBackToOrders={() => setCurrentPage(defaultPage())}
                  allOrders={legacyAll}
                  empresa={empresaInfo}
                  responsavel={userInfo.displayName}
                />
              )}

              {activePage === 'estoque' && canAccessEstoque && (
                <EstoquePanel
                  produtos={estoque.produtos}
                  movimentacoes={estoque.movimentacoes}
                  produtosEstoqueBaixo={estoque.produtosEstoqueBaixo}
                  onAddProduto={estoque.addProduto}
                  onEditProduto={estoque.editProduto}
                  onDeleteProduto={estoque.deleteProduto}
                  onAddEntrada={estoque.addEntrada}
                  onAddSaida={estoque.addSaida}
                  onBack={() => setCurrentPage(defaultPage())}
                  userType={userInfo.userType}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
