
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Hash, User } from 'lucide-react';
import logoIppark from '@/assets/logo-ippark.jpeg';
import backgroundImage from '@/src/assets/tela de fundo.png';
import { useToast } from '@/hooks/use-toast';
import MaintenanceSection from './MaintenanceSection';
import type { RegisteredUser, AccessCode } from '@/pages/Index';

interface LoginFormProps {
  onLogin: (username: string, password: string, userType: string, codigoAcesso: string, municipio: string, displayName?: string) => void;
  allOrders: any[];
  registeredUsers: RegisteredUser[];
  accessCodes: AccessCode[];
  onRegisterUser: (user: RegisteredUser) => void;
  onRegisterAccessCode: (ac: AccessCode) => void;
}

const LoginForm = ({ onLogin, allOrders, registeredUsers, accessCodes, onRegisterUser, onRegisterAccessCode }: LoginFormProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setAccessCode(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode || !username || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (accessCode.length !== 4) {
      toast({
        title: "Código inválido",
        description: "O código de acesso deve ter 4 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);

      // Verificar se o código de acesso existe
      const foundAccessCode = accessCodes.find(ac => ac.code === accessCode);
      if (!foundAccessCode) {
        toast({
          title: "Código de acesso inválido",
          description: "Este código de acesso não existe no sistema.",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar usuário vinculado a este código de acesso
      const foundUser = registeredUsers.find(
        u => u.codigoAcesso === accessCode && u.username === username && u.password === password
      );

      if (foundUser) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${foundUser.name}! Município: ${foundAccessCode.municipio}`,
        });
        onLogin(foundUser.username, password, foundUser.userType, foundAccessCode.code, foundAccessCode.municipio, foundUser.name);
      } else {
        toast({
          title: "Acesso negado",
          description: "Código de acesso, usuário ou senha incorretos.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-2 bg-slate-50 bg-no-repeat bg-bottom bg-contain"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: '60%' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <img src={logoIppark} alt="IPPARK Logo" className="w-36 h-auto mb-2 shadow-lg rounded-xl mx-auto" />
          <h1 className="text-2xl font-bold text-foreground mb-0.5">Sistema de Iluminação Pública</h1>
          <p className="text-base font-medium text-muted-foreground">Prefeitura Municipal</p>
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            Bem-vindo ao Sistema de Iluminação Pública Municipais.<br />
            Para sua segurança esta conexão é monitorada e todas as operações poderão ser auditadas.
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/20 backdrop-blur-none">
          <CardHeader className="space-y-1 pb-2 pt-4">
            <CardTitle className="text-xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center text-xs ">
              Digite seu código de acesso, usuário e senha
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleSubmit} className="space-y-3 ">
              <div className="space-y-2">
                <Label htmlFor="accessCode ">Código de Acesso</Label>
                <div className="relative ">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="0000"
                    value={accessCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="pl-10 text-center text-lg tracking-widest font-mono bg-white/80 backdrop-blur-none"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-none"
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
                    className="pl-10 bg-white/80 backdrop-blur-none"
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

        <MaintenanceSection 
          allOrders={allOrders} 
          registeredUsers={registeredUsers}
          accessCodes={accessCodes}
          onRegisterUser={onRegisterUser}
          onRegisterAccessCode={onRegisterAccessCode}
        />
      </div>
    </div>
  );
};

export default LoginForm;
