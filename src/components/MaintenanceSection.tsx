import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Lock, Shield, UserPlus, Users, Crown, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface EmpresaRow {
  id: string;
  codigo_acesso: string;
  nome: string;
}

interface MaintenanceSectionProps {
  onExit?: () => void;
}

const MaintenanceSection = ({ onExit }: MaintenanceSectionProps) => {
  const [showMaintenance, setShowMaintenance] = useState(!!onExit);
  const [isAuthenticated, setIsAuthenticated] = useState(!!onExit);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cadastro' | 'codigos'>('codigos');
  const { toast } = useToast();
  const { signIn, signUp, signOut } = useAuth();

  // Data from DB
  const [empresas, setEmpresas] = useState<EmpresaRow[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Form de cadastro de usuário
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserType, setNewUserType] = useState<'funcionario' | 'diretor'>('funcionario');
  const [newUserEmpresaId, setNewUserEmpresaId] = useState('');

  // Form de cadastro de código de acesso
  const [newAccessCode, setNewAccessCode] = useState('');
  const [newAccessMunicipio, setNewAccessMunicipio] = useState('');

  // Maintenance uses the same Supabase auth

  const fetchEmpresas = async () => {
    const { data } = await supabase.from('empresas').select('*');
    if (data) setEmpresas(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*, user_roles(role)');
    if (data) setUsers(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmpresas();
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleMaintenanceLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha email e senha.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    setIsLoading(false);
    
    if (error) {
      toast({ title: "Acesso negado", description: "Email ou senha incorretos.", variant: "destructive" });
    } else {
      setIsAuthenticated(true);
      toast({ title: "Acesso autorizado", description: "Bem-vindo à área de manutenção!" });
    }
  };

  const handleLogoutMaintenance = async () => {
    if (onExit) {
      onExit();
    } else {
      await signOut();
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
      setShowMaintenance(false);
    }
    toast({ title: "Logout realizado", description: "Você saiu da área de manutenção." });
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserUsername || !newUserPassword || !newUserEmpresaId) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos para cadastrar.", variant: "destructive" });
      return;
    }

    if (newUserPassword.length < 6) {
      toast({ title: "Senha fraca", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Sign out current admin first, then sign up the new user
    const { error } = await signUp(newUserEmail, newUserPassword, {
      empresa_id: newUserEmpresaId,
      display_name: newUserName,
      username: newUserUsername,
      role: newUserType,
    });

    setIsLoading(false);

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Usuário cadastrado!", description: `Usuário "${newUserName}" cadastrado com sucesso.` });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserType('funcionario');
    setNewUserEmpresaId('');
    
    // Re-login as admin and refresh data
    await signIn(email, password);
    fetchUsers();
  };

  const handleRegisterAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccessCode || !newAccessMunicipio) {
      toast({ title: "Campos obrigatórios", description: "Preencha o código e o município.", variant: "destructive" });
      return;
    }
    if (newAccessCode.length !== 4 || !/^\d{4}$/.test(newAccessCode)) {
      toast({ title: "Código inválido", description: "O código de acesso deve ter exatamente 4 dígitos.", variant: "destructive" });
      return;
    }

    const existing = empresas.find(e => e.codigo_acesso === newAccessCode);
    if (existing) {
      toast({ title: "Código já existe", description: `O código ${newAccessCode} já está cadastrado para ${existing.nome}.`, variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('empresas').insert({
      codigo_acesso: newAccessCode,
      nome: newAccessMunicipio,
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Código de acesso cadastrado!", description: `Código ${newAccessCode} - Município: ${newAccessMunicipio}` });
    setNewAccessCode('');
    setNewAccessMunicipio('');
    fetchEmpresas();
  };

  const getEmpresaNome = (empresaId: string) => {
    return empresas.find(e => e.id === empresaId)?.nome || 'N/A';
  };

  const getEmpresaCodigo = (empresaId: string) => {
    return empresas.find(e => e.id === empresaId)?.codigo_acesso || 'N/A';
  };

  // Full-page mode (called from Index.tsx when already authenticated)
  if (onExit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Área de Manutenção</CardTitle>
                  <CardDescription>Gerenciamento do sistema</CardDescription>
                </div>
                <Button variant="outline" onClick={onExit} className="text-red-600 border-red-200 hover:bg-red-50">Sair</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                <Button variant={activeTab === 'codigos' ? 'default' : 'outline'} onClick={() => setActiveTab('codigos')} className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />Códigos de Acesso
                </Button>
                <Button variant={activeTab === 'cadastro' ? 'default' : 'outline'} onClick={() => setActiveTab('cadastro')} className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />Cadastro de Usuários
                </Button>
              </div>
              <Separator />
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Inline mode (rendered inside LoginForm)
  return (
    <div className="mt-4">
      <Button variant="outline" onClick={() => setShowMaintenance(!showMaintenance)} className="flex items-center gap-2 mb-2">
        <Settings className="w-4 h-4" />
        {showMaintenance ? 'Ocultar Manutenção' : 'Área de Manutenção'}
      </Button>

      {showMaintenance && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setShowMaintenance(false)}
        >
          <div
            className="relative bg-background rounded-lg shadow-xl max-w-sm w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex justify-end p-2 bg-background border-b rounded-t-lg">
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowMaintenance(false)} aria-label="Fechar">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 pt-0">
              {!isAuthenticated ? (
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Acesso Restrito - Área de Manutenção</CardTitle>
                    <CardDescription>Digite suas credenciais para acessar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleMaintenanceLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="maintenance-email">Email</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="maintenance-email" type="email" placeholder="Digite seu email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maintenance-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="maintenance-password" type="password" placeholder="Digite sua senha" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 transition-colors" disabled={isLoading}>
                        {isLoading ? "Verificando..." : "Acessar Manutenção"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Área de Manutenção</CardTitle>
                        <CardDescription>Gerenciamento do sistema</CardDescription>
                      </div>
                      <Button variant="outline" onClick={handleLogoutMaintenance} className="text-red-600 border-red-200 hover:bg-red-50">Sair</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-2 flex-wrap">
                      <Button variant={activeTab === 'codigos' ? 'default' : 'outline'} onClick={() => setActiveTab('codigos')} className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />Códigos de Acesso
                      </Button>
                      <Button variant={activeTab === 'cadastro' ? 'default' : 'outline'} onClick={() => setActiveTab('cadastro')} className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />Cadastro de Usuários
                      </Button>
                    </div>
                    <Separator />
                    {renderContent()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceSection;
