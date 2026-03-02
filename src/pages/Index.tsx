
import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import OrderForm from '@/components/OrderForm';
import DirectorApproval from '@/components/DirectorApproval';
import ApprovedOrders from '@/components/ApprovedOrders';

export interface RegisteredUser {
  code: string;
  username: string;
  password: string;
  userType: 'funcionario' | 'diretor';
  name: string;
  municipio: string;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'order' | 'approval' | 'approved'>('login');
  const [userInfo, setUserInfo] = useState({ username: '', password: '', userType: '', code: '' });
  const [orders, setOrders] = useState<any[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [allOrdersHistory, setAllOrdersHistory] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([
    { code: '0001', username: 'Administrador', password: 'admin123', userType: 'diretor', name: 'Administrador', municipio: 'Sede' },
    { code: '0002', username: 'Funcionario', password: 'func123', userType: 'funcionario', name: 'Funcionário Padrão', municipio: 'Sede' },
  ]);

  const handleLogin = (username: string, password: string, userType: string, code: string) => {
    setUserInfo({ username, password, userType, code });
    if (userType === 'funcionario') {
      setCurrentPage('order');
    } else if (userType === 'diretor') {
      setCurrentPage('approval');
    }
  };

  const handleOrderSubmit = (data: any) => {
    const newOrder = { ...data, id: Date.now() };
    setOrders(prev => [...prev, newOrder]);
    setAllOrdersHistory(prev => [...prev, { ...newOrder, status: 'pending' }]);
    setCurrentPage('approved');
  };

  const handleOrderApproval = (orderId: number, status: 'approved' | 'rejected', comments?: string) => {
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (orderToUpdate) {
      const updatedOrder = { ...orderToUpdate, status, comments, approvedAt: new Date().toLocaleString('pt-BR') };
      
      if (status === 'approved') {
        setApprovedOrders(prev => [...prev, updatedOrder]);
      }
      
      setAllOrdersHistory(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status, comments, approvedAt: new Date().toLocaleString('pt-BR') }
            : order
        )
      );
    }
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setUserInfo({ username: '', password: '', userType: '', code: '' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentPage === 'login' && (
        <LoginForm 
          onLogin={handleLogin} 
          allOrders={allOrdersHistory} 
          registeredUsers={registeredUsers}
          onRegisterUser={handleRegisterUser}
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
          orders={orders}
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
