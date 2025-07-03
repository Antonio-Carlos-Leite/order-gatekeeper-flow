
import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import OrderForm from '@/components/OrderForm';
import DirectorApproval from '@/components/DirectorApproval';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'order' | 'approval'>('login');
  const [userInfo, setUserInfo] = useState({ username: '', password: '' });
  const [orderData, setOrderData] = useState(null);

  const handleLogin = (username: string, password: string) => {
    setUserInfo({ username, password });
    setCurrentPage('order');
  };

  const handleOrderSubmit = (data: any) => {
    setOrderData(data);
    setCurrentPage('approval');
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setUserInfo({ username: '', password: '' });
    setOrderData(null);
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
        />
      )}
      {currentPage === 'approval' && (
        <DirectorApproval 
          orderData={orderData}
          userInfo={userInfo}
          onBack={() => setCurrentPage('order')}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Index;
