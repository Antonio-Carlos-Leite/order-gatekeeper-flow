
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Download, Printer, CheckCircle, XCircle, Clock, FileText, User, Lock, Shield, UserPlus, Users, Crown, Hash, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RegisteredUser, AccessCode } from '@/pages/Index';

interface MaintenanceSectionProps {
  allOrders: any[];
  registeredUsers: RegisteredUser[];
  accessCodes: AccessCode[];
  onRegisterUser: (user: RegisteredUser) => void;
  onRegisterAccessCode: (ac: AccessCode) => void;
}

const MaintenanceSection = ({ allOrders, registeredUsers, accessCodes, onRegisterUser, onRegisterAccessCode }: MaintenanceSectionProps) => {
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'relatorio' | 'cadastro' | 'codigos'>('relatorio');
  const { toast } = useToast();

  // Form de cadastro de usuário
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserType, setNewUserType] = useState<'funcionario' | 'diretor'>('funcionario');
  const [newUserCodigoAcesso, setNewUserCodigoAcesso] = useState('');

  // Form de cadastro de código de acesso
  const [newAccessCode, setNewAccessCode] = useState('');
  const [newAccessMunicipio, setNewAccessMunicipio] = useState('');

  const MAINTENANCE_CREDENTIALS = {
    email: 'admin@sistema.com',
    password: 'admin123'
  };

  const handleMaintenanceLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha email e senha.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (email === MAINTENANCE_CREDENTIALS.email && password === MAINTENANCE_CREDENTIALS.password) {
        setIsAuthenticated(true);
        toast({ title: "Acesso autorizado", description: "Bem-vindo à área de manutenção!" });
      } else {
        toast({ title: "Acesso negado", description: "Email ou senha incorretos.", variant: "destructive" });
      }
    }, 1000);
  };

  const handleLogoutMaintenance = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setShowMaintenance(false);
    toast({ title: "Logout realizado", description: "Você saiu da área de manutenção." });
  };

  const getMunicipioByCode = (code: string) => {
    return accessCodes.find(ac => ac.code === code)?.municipio || 'N/A';
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername || !newUserPassword || !newUserType || !newUserCodigoAcesso) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos para cadastrar.", variant: "destructive" });
      return;
    }

    const codeExists = accessCodes.find(ac => ac.code === newUserCodigoAcesso);
    if (!codeExists) {
      toast({ title: "Código de acesso inválido", description: "Este código de acesso não existe. Cadastre-o primeiro na aba 'Códigos de Acesso'.", variant: "destructive" });
      return;
    }

    const existingUsername = registeredUsers.find(u => u.username === newUserUsername && u.codigoAcesso === newUserCodigoAcesso);
    if (existingUsername) {
      toast({ title: "Usuário já cadastrado", description: "Este nome de usuário já está em uso neste código de acesso.", variant: "destructive" });
      return;
    }

    const newUser: RegisteredUser = {
      name: newUserName,
      username: newUserUsername,
      password: newUserPassword,
      userType: newUserType,
      codigoAcesso: newUserCodigoAcesso,
    };

    onRegisterUser(newUser);
    toast({ title: "Usuário cadastrado!", description: `Usuário "${newUserName}" vinculado ao código ${newUserCodigoAcesso} (${codeExists.municipio}).` });
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserType('funcionario');
    setNewUserCodigoAcesso('');
  };

  const handleRegisterAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccessCode || !newAccessMunicipio) {
      toast({ title: "Campos obrigatórios", description: "Preencha o código e o município.", variant: "destructive" });
      return;
    }
    if (newAccessCode.length !== 4 || !/^\d{4}$/.test(newAccessCode)) {
      toast({ title: "Código inválido", description: "O código de acesso deve ter exatamente 4 dígitos.", variant: "destructive" });
      return;
    }
    const existing = accessCodes.find(ac => ac.code === newAccessCode);
    if (existing) {
      toast({ title: "Código já existe", description: `O código ${newAccessCode} já está cadastrado para ${existing.municipio}.`, variant: "destructive" });
      return;
    }
    onRegisterAccessCode({ code: newAccessCode, municipio: newAccessMunicipio });
    toast({ title: "Código de acesso cadastrado!", description: `Código ${newAccessCode} - Município: ${newAccessMunicipio}` });
    setNewAccessCode('');
    setNewAccessMunicipio('');
  };

  // ... report functions
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const approvedCount = allOrders.filter(order => order.status === 'approved').length;
      const rejectedCount = allOrders.filter(order => order.status === 'rejected').length;
      const pendingCount = allOrders.filter(order => order.status === 'pending').length;
      const totalValue = allOrders.filter(order => order.status === 'approved').reduce((sum, order) => sum + parseFloat(order.valor || 0), 0);
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Relatório Completo de Pedidos</title><style>body{font-family:Arial,sans-serif;margin:20px}.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:10px}.summary{display:flex;justify-content:space-around;margin:20px 0}.summary-item{text-align:center;padding:10px}.summary-number{font-size:24px;font-weight:bold;color:#2563eb}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2;font-weight:bold}.status-approved{color:#16a34a;font-weight:bold}.status-rejected{color:#dc2626;font-weight:bold}.status-pending{color:#ca8a04;font-weight:bold}@media print{button{display:none}}</style></head><body><div class="header"><h1>Relatório Completo de Pedidos</h1><p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p></div><div class="summary"><div class="summary-item"><div class="summary-number">${allOrders.length}</div><div>Total</div></div><div class="summary-item"><div class="summary-number">${approvedCount}</div><div>Aprovados</div></div><div class="summary-item"><div class="summary-number">${rejectedCount}</div><div>Rejeitados</div></div><div class="summary-item"><div class="summary-number">${pendingCount}</div><div>Pendentes</div></div><div class="summary-item"><div class="summary-number">R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div><div>Valor Aprovado</div></div></div><table><thead><tr><th>ID</th><th>Produto</th><th>Qtd</th><th>Valor</th><th>Fornecedor</th><th>Município</th><th>Data</th><th>Status</th></tr></thead><tbody>${allOrders.map(order => `<tr><td>${order.id}</td><td>${order.produto}</td><td>${order.quantidade}</td><td>R$ ${parseFloat(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>${order.fornecedor}</td><td>${order.municipio || '-'}</td><td>${order.dataEnvio}</td><td class="status-${order.status}">${order.status === 'approved' ? 'Aprovado' : order.status === 'rejected' ? 'Rejeitado' : 'Pendente'}</td></tr>`).join('')}</tbody></table><button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Imprimir</button></body></html>`);
      printWindow.document.close();
    }
  };

  const handleDownloadReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      summary: {
        total: allOrders.length,
        approved: allOrders.filter(order => order.status === 'approved').length,
        rejected: allOrders.filter(order => order.status === 'rejected').length,
        pending: allOrders.filter(order => order.status === 'pending').length,
        totalValue: allOrders.filter(order => order.status === 'approved').reduce((sum, order) => sum + parseFloat(order.valor || 0), 0)
      },
      orders: allOrders
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-completo-pedidos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Relatório baixado", description: "O relatório completo foi baixado com sucesso!" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const approvedCount = allOrders.filter(order => order.status === 'approved').length;
  const rejectedCount = allOrders.filter(order => order.status === 'rejected').length;
  const pendingCount = allOrders.filter(order => order.status === 'pending').length;
  const totalValue = allOrders.filter(order => order.status === 'approved').reduce((sum, order) => sum + parseFloat(order.valor || 0), 0);

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
            className="relative bg-background rounded-lg shadow-xl max-w-sm w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto "
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
                  <Button variant={activeTab === 'relatorio' ? 'default' : 'outline'} onClick={() => setActiveTab('relatorio')} className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />Relatório de Pedidos
                  </Button>
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
                        <CardTitle className="text-lg">Códigos de Acesso Cadastrados ({accessCodes.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código</TableHead>
                              <TableHead>Município</TableHead>
                              <TableHead>Usuários Vinculados</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {accessCodes.map((ac) => (
                              <TableRow key={ac.code}>
                                <TableCell className="font-mono font-bold">{ac.code}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                    <MapPin className="w-3 h-3" />{ac.municipio}
                                  </Badge>
                                </TableCell>
                                <TableCell>{registeredUsers.filter(u => u.codigoAcesso === ac.code).length}</TableCell>
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
                        <CardDescription>Vincule o usuário a um código de acesso (município)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleRegisterUser} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome Completo</Label>
                              <Input placeholder="Nome do usuário" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Usuário (Nome de Login)</Label>
                              <Input placeholder="Nome de usuário" value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Senha</Label>
                              <Input type="password" placeholder="Senha do usuário" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Código de Acesso (Município)</Label>
                              <Select value={newUserCodigoAcesso} onValueChange={setNewUserCodigoAcesso}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o código de acesso" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accessCodes.map(ac => (
                                    <SelectItem key={ac.code} value={ac.code}>
                                      {ac.code} - {ac.municipio}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
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
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />Cadastrar Usuário
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Usuários Cadastrados ({registeredUsers.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código de Acesso</TableHead>
                              <TableHead>Município</TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead>Usuário</TableHead>
                              <TableHead>Tipo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {registeredUsers.map((user, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-mono font-bold">{user.codigoAcesso}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                    <MapPin className="w-3 h-3" />{getMunicipioByCode(user.codigoAcesso)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                  <Badge className={user.userType === 'diretor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                                    {user.userType === 'diretor' ? <><Crown className="w-3 h-3 mr-1" />Diretor</> : <><Users className="w-3 h-3 mr-1" />Funcionário</>}
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

                {/* Aba: Relatório */}
                {activeTab === 'relatorio' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{allOrders.length}</div>
                        <div className="text-sm text-gray-600">Total de Pedidos</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                        <div className="text-sm text-gray-600">Aprovados</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                        <div className="text-sm text-gray-600">Rejeitados</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        <div className="text-sm text-gray-600">Pendentes</div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-sm text-gray-600">Valor Total Aprovado</div>
                    </div>
                    <Separator />
                    <div className="flex gap-4 justify-center">
                      <Button onClick={handlePrintReport} className="flex items-center gap-2"><Printer className="w-4 h-4" />Imprimir Relatório</Button>
                      <Button onClick={handleDownloadReport} variant="outline" className="flex items-center gap-2"><Download className="w-4 h-4" />Download JSON</Button>
                    </div>
                    <Separator />
                    {allOrders.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Produto</TableHead>
                              <TableHead>Município</TableHead>
                              <TableHead>Quantidade</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead>Fornecedor</TableHead>
                              <TableHead>Data Envio</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.produto}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                    <MapPin className="w-3 h-3" />{order.municipio || '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{order.quantidade}</TableCell>
                                <TableCell>R$ {parseFloat(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell>{order.fornecedor}</TableCell>
                                <TableCell>{order.dataEnvio}</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
                        <p>Não há pedidos no sistema ainda</p>
                      </div>
                    )}
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
