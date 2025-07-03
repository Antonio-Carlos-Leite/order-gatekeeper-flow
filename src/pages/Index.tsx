
import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import OrderForm from '@/components/OrderForm';
import DirectorApproval from '@/components/DirectorApproval';
import ApprovedOrders from '@/components/ApprovedOrders';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'order' | 'approval' | 'approved'>('login');
  const [userInfo, setUserInfo] = useState({ username: '', password: '', userType: '' });
  const [orders, setOrders] = useState<any[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);

  const handleLogin = (username: string, password: string, userType: string) => {
    setUserInfo({ username, password, userType });
    if (userType === 'funcionario') {
      setCurrentPage('order');
    } else if (userType === 'diretor') {
      setCurrentPage('approval');
    }
  };

  const handleOrderSubmit = (data: any) => {
    const newOrder = { ...data, id: Date.now() };
    setOrders(prev => [...prev, newOrder]);
    // Funcionário vai para tela de aprovados após enviar pedido
    setCurrentPage('approved');
  };

  const handleOrderApproval = (orderId: number, status: 'approved' | 'rejected', comments?: string) => {
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (orderToUpdate && status === 'approved') {
      setApprovedOrders(prev => [...prev, { ...orderToUpdate, status, comments, approvedAt: new Date().toLocaleString('pt-BR') }]);
    }
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setUserInfo({ username: '', password: '', userType: '' });
  };

  const handleNavigateToApproved = () => {
    setCurrentPage('approved');
  };

  const handleBackToOrders = () => {
    setCurrentPage('order');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentPage === 'login' && (
        <LoginForm onLogin={handleLogin} />
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
        />
      )}
    </div>
  );
};

export default Index;
