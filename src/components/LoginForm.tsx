
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Building2, Hash, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MaintenanceSection from './MaintenanceSection';
import type { RegisteredUser } from '@/pages/Index';

interface LoginFormProps {
  onLogin: (username: string, password: string, userType: string, code: string) => void;
  allOrders: any[];
  registeredUsers: RegisteredUser[];
  onRegisterUser: (user: RegisteredUser) => void;
}

const LoginForm = ({ onLogin, allOrders, registeredUsers, onRegisterUser }: LoginFormProps) => {
  const [userCode, setUserCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCodeChange = (value: string) => {
    // Apenas números, máximo 4 dígitos
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setUserCode(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userCode || !email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (userCode.length !== 4) {
      toast({
        title: "Código inválido",
        description: "O código de usuário deve ter 4 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      const foundUser = registeredUsers.find(
        u => u.code === userCode && u.email === email && u.password === password
      );

      if (foundUser) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${foundUser.name}! (${foundUser.userType === 'funcionario' ? 'Funcionário' : 'Diretor'})`,
        });
        onLogin(foundUser.name, password, foundUser.userType, foundUser.code);
      } else {
        toast({
          title: "Acesso negado",
          description: "Código de usuário ou senha incorretos.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Pedidos</h1>
          <p className="text-gray-600">Faça login com seu código de usuário</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite seu código de 4 dígitos e senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userCode">Código do Usuário (4 dígitos)</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="userCode"
                    type="text"
                    placeholder="0000"
                    value={userCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="pl-10 text-center text-lg tracking-widest font-mono"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Área de Manutenção */}
        <MaintenanceSection 
          allOrders={allOrders} 
          registeredUsers={registeredUsers}
          onRegisterUser={onRegisterUser}
        />
      </div>
    </div>
  );
};

export default LoginForm;
