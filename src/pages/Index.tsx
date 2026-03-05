
import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import OrderForm from '@/components/OrderForm';
import DirectorApproval from '@/components/DirectorApproval';
import ApprovedOrders from '@/components/ApprovedOrders';

export interface AccessCode {
  code: string;
  municipio: string;
}

export interface RegisteredUser {
  username: string;
  password: string;
  userType: 'funcionario' | 'diretor';
  name: string;
  codigoAcesso: string; // referência ao código de acesso (município)
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'order' | 'approval' | 'approved'>('login');
  const [userInfo, setUserInfo] = useState({ username: '', password: '', userType: '', codigoAcesso: '', municipio: '', name: '' });
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [allOrdersHistory, setAllOrdersHistory] = useState<any[]>([]);

  const pendingOrders = allOrdersHistory.filter(
    (o: any) => o.status === 'pending' && (!userInfo.codigoAcesso || o.codigoAcesso === userInfo.codigoAcesso)
  );
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([
    { code: '0001', municipio: 'Sede' },
    { code: '2601', municipio: 'Jucás' },
  ]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([
    { username: 'Administrador', password: 'admin123', userType: 'diretor', name: 'Administrador', codigoAcesso: '0001' },
    { username: 'Funcionario', password: 'func123', userType: 'funcionario', name: 'Funcionário Padrão', codigoAcesso: '0001' },
  ]);

  const handleLogin = (username: string, password: string, userType: string, codigoAcesso: string, municipio: string, displayName?: string) => {
    setUserInfo({ username, password, userType, codigoAcesso, municipio, name: displayName || username });
    if (userType === 'funcionario') {
      setCurrentPage('order');
    } else if (userType === 'diretor') {
      setCurrentPage('approval');
    }
  };

  const handleOrderSubmit = (data: any) => {
    const newOrder = {
      ...data,
      id: Date.now(),
      codigoAcesso: userInfo.codigoAcesso,
      municipio: userInfo.municipio,
      status: 'pending',
      solicitante: data.solicitante ?? '',
    };
    setAllOrdersHistory(prev => [...prev, newOrder]);
    setCurrentPage('order');
  };

  const handleOrderApproval = (orderId: number, status: 'approved' | 'rejected', comments?: string) => {
    setAllOrdersHistory(prev => {
      const orderToUpdate = prev.find((order: any) => order.id === orderId);
      if (!orderToUpdate) return prev;
      const updatedOrder = {
        ...orderToUpdate,
        status,
        comments,
        approvedAt: new Date().toLocaleString('pt-BR'),
        solicitante: orderToUpdate.solicitante ?? '',
      };
      if (status === 'approved') {
        setApprovedOrders(approved => [...approved, updatedOrder]);
      }
      return prev.map((order: any) => (order.id === orderId ? updatedOrder : order));
    });
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setUserInfo({ username: '', password: '', userType: '', codigoAcesso: '', municipio: '', name: '' });
  };

  const handleNavigateToApproved = () => {
    setCurrentPage('approved');
  };

  const handleBackToOrders = () => {
    setCurrentPage('order');
  };

  const handleRegisterUser = (user: RegisteredUser) => {
    setRegisteredUsers(prev => [...prev, user]);
  };

  const handleRegisterAccessCode = (ac: AccessCode) => {
    setAccessCodes(prev => [...prev, ac]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentPage === 'login' && (
        <LoginForm 
          onLogin={handleLogin} 
          allOrders={allOrdersHistory} 
          registeredUsers={registeredUsers}
          accessCodes={accessCodes}
          onRegisterUser={handleRegisterUser}
          onRegisterAccessCode={handleRegisterAccessCode}
        />
      )}
      {currentPage === 'order' && (
        <OrderForm 
          userInfo={userInfo} 
          onSubmit={handleOrderSubmit}
          onLogout={handleLogout}
          onNavigateToApproved={handleNavigateToApproved}
        />
      )}
      {currentPage === 'approval' && (
        <DirectorApproval 
          orders={pendingOrders}
          userInfo={userInfo}
          onApprove={handleOrderApproval}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'approved' && (
        <ApprovedOrders
          approvedOrders={approvedOrders}
          userInfo={userInfo}
          onLogout={handleLogout}
          onBackToOrders={handleBackToOrders}
          allOrders={allOrdersHistory}
        />
      )}
    </div>
  );
};

export default Index;
