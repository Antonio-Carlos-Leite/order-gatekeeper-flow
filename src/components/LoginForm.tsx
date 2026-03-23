import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Mail } from 'lucide-react';
import logoIppark from '@/assets/logo-ippark.jpeg';
import backgroundImage from '@/assets/tela-de-fundo.png';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MaintenanceSection from './MaintenanceSection';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    setIsLoading(false);

    if (error) {
      toast({
        title: "Acesso negado",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema!",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-2 bg-slate-50 bg-no-repeat bg-bottom bg-contain"
      style={{ backgroundImage: `url(${backgroundImage})` }}
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
            <CardDescription className="text-center text-xs">
              Digite seu email e senha para acessar
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleSubmit} className="space-y-3">
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

        <MaintenanceSection />
      </div>
    </div>
  );
};

export default LoginForm;
