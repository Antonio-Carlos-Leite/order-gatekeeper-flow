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

const MaintenanceSection = () => {
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    await signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setShowMaintenance(false);
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
                    {/* Tabs */}
                    <div className="flex gap-2 flex-wrap">
                      <Button variant={activeTab === 'codigos' ? 'default' : 'outline'} onClick={() => setActiveTab('codigos')} className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />Códigos de Acesso
                      </Button>
                      <Button variant={activeTab === 'cadastro' ? 'default' : 'outline'} onClick={() => setActiveTab('cadastro')} className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />Cadastro de Usuários
                      </Button>
                    </div>

                    <Separator />

                    {/* Aba: Códigos de Acesso */}
                    {activeTab === 'codigos' && (
                      <div className="space-y-6">
                        <Card className="border border-green-200 bg-green-50/50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-5 h-5" />Novo Código de Acesso</CardTitle>
                            <CardDescription>Cada código de acesso representa um município</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={handleRegisterAccessCode} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Código de Acesso (4 dígitos)</Label>
                                  <Input placeholder="Ex: 2601" value={newAccessCode} onChange={(e) => setNewAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className="font-mono tracking-widest" required />
                                </div>
                                <div className="space-y-2">
                                  <Label>Município</Label>
                                  <Input placeholder="Ex: Jucás" value={newAccessMunicipio} onChange={(e) => setNewAccessMunicipio(e.target.value)} required />
                                </div>
                              </div>
                              <Button type="submit" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />Cadastrar Código de Acesso
                              </Button>
                            </form>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Códigos de Acesso Cadastrados ({empresas.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Código</TableHead>
                                  <TableHead>Município</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {empresas.map((emp) => (
                                  <TableRow key={emp.id}>
                                    <TableCell className="font-mono font-bold">{emp.codigo_acesso}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                        <MapPin className="w-3 h-3" />{emp.nome}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Aba: Cadastro de Usuários */}
                    {activeTab === 'cadastro' && (
                      <div className="space-y-6">
                        <Card className="border border-blue-200 bg-blue-50/50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><UserPlus className="w-5 h-5" />Novo Usuário</CardTitle>
                            <CardDescription>Vincule o usuário a um município (empresa)</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={handleRegisterUser} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Nome Completo</Label>
                                  <Input placeholder="Nome do usuário" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input type="email" placeholder="email@exemplo.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                  <Label>Usuário (Nome de Login)</Label>
                                  <Input placeholder="Nome de usuário" value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                  <Label>Senha (mín. 6 caracteres)</Label>
                                  <Input type="password" placeholder="Senha do usuário" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                  <Label>Município (Empresa)</Label>
                                  <Select value={newUserEmpresaId} onValueChange={setNewUserEmpresaId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o município" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {empresas.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                          {emp.codigo_acesso} - {emp.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Tipo de Usuário</Label>
                                  <RadioGroup value={newUserType} onValueChange={(v) => setNewUserType(v as 'funcionario' | 'diretor')} className="flex gap-4 pt-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="funcionario" id="new-func" />
                                      <Label htmlFor="new-func" className="flex items-center gap-1 cursor-pointer"><Users className="w-4 h-4" /> Funcionário</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="diretor" id="new-dir" />
                                      <Label htmlFor="new-dir" className="flex items-center gap-1 cursor-pointer"><Crown className="w-4 h-4" /> Diretor</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </div>
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" disabled={isLoading}>
                                <UserPlus className="w-4 h-4" />{isLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                              </Button>
                            </form>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Usuários Cadastrados ({users.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Código</TableHead>
                                  <TableHead>Município</TableHead>
                                  <TableHead>Nome</TableHead>
                                  <TableHead>Usuário</TableHead>
                                  <TableHead>Tipo</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {users.map((user) => {
                                  const role = user.user_roles?.[0]?.role || 'funcionario';
                                  return (
                                    <TableRow key={user.id}>
                                      <TableCell className="font-mono font-bold">{getEmpresaCodigo(user.empresa_id)}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                          <MapPin className="w-3 h-3" />{getEmpresaNome(user.empresa_id)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{user.display_name}</TableCell>
                                      <TableCell>{user.username}</TableCell>
                                      <TableCell>
                                        <Badge className={role === 'diretor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                                          {role === 'diretor' ? <><Crown className="w-3 h-3 mr-1" />Diretor</> : <><Users className="w-3 h-3 mr-1" />Funcionário</>}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}
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
