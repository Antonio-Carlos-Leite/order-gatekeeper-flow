import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Ban, Unlock, KeyRound, Trash2, LogOut, RefreshCw, Search, ScrollText, Users as UsersIcon, MonitorSmartphone, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateUserDialog from './CreateUserDialog';

interface UserRow {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  empresa_id: string;
  user_roles?: { role: string }[];
  empresas?: { nome: string; codigo_acesso: string } | null;
  status?: { status: string; email_verificado: boolean; failed_attempts: number; locked_until: string | null; last_login_at: string | null } | null;
}

const callSecurity = async (action: string, payload: any = {}) => {
  const { data, error } = await supabase.functions.invoke('admin-security', {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    ativo: { label: 'Ativo', cls: 'bg-emerald-100 text-emerald-800' },
    pendente: { label: 'Pendente', cls: 'bg-amber-100 text-amber-800' },
    bloqueado: { label: 'Bloqueado', cls: 'bg-red-100 text-red-800' },
  };
  const it = map[status ?? 'pendente'] ?? map.pendente;
  return <Badge className={it.cls}>{it.label}</Badge>;
};

const SecurityPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, l, s, a] = await Promise.all([
        callSecurity('list_users'),
        callSecurity('list_audit_logs'),
        callSecurity('list_active_sessions'),
        callSecurity('list_login_attempts'),
      ]);
      setUsers(u.users ?? []);
      setLogs(l.logs ?? []);
      setSessions(s.sessions ?? []);
      setAttempts(a.attempts ?? []);
    } catch (e: any) {
      toast({ title: 'Erro ao carregar', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAction = async (action: string, payload: any, successMsg: string) => {
    try {
      await callSecurity(action, payload);
      toast({ title: successMsg });
      await loadAll();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.display_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.empresas?.nome?.toLowerCase().includes(q)
    );
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Segurança e Auditoria</CardTitle>
          <CardDescription>Gestão global de usuários, sessões e logs de toda a plataforma IPPark</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <CreateUserDialog onCreated={loadAll} />
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="users" className="gap-1"><UsersIcon className="w-4 h-4" />Usuários</TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1"><MonitorSmartphone className="w-4 h-4" />Sessões</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1"><ScrollText className="w-4 h-4" />Auditoria</TabsTrigger>
            <TabsTrigger value="attempts" className="gap-1"><AlertTriangle className="w-4 h-4" />Tentativas</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="relative mb-3 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, usuário ou município..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Município</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último login</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => {
                    const role = u.user_roles?.[0]?.role ?? 'funcionario';
                    const isBlocked = u.status?.status === 'bloqueado';
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.display_name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.username}</TableCell>
                        <TableCell>
                          {u.empresas ? (
                            <Badge variant="outline" className="font-mono">{u.empresas.codigo_acesso} · {u.empresas.nome}</Badge>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell><Badge variant="secondary">{role}</Badge></TableCell>
                        <TableCell><StatusBadge status={u.status?.status} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.status?.last_login_at ? new Date(u.status.last_login_at).toLocaleString('pt-BR') : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" title="Enviar reset de senha"
                              onClick={() => handleAction('send_password_reset', { email: u.username.includes('@') ? u.username : undefined }, 'Email de reset enviado')}>
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            {isBlocked ? (
                              <Button size="sm" variant="ghost" className="text-emerald-600" title="Desbloquear"
                                onClick={() => handleAction('unblock_user', { target_user_id: u.user_id }, 'Usuário desbloqueado')}>
                                <Unlock className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="text-amber-600" title="Bloquear"
                                onClick={() => handleAction('block_user', { target_user_id: u.user_id }, 'Usuário bloqueado')}>
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" title="Encerrar sessões"
                              onClick={() => handleAction('end_session', { target_user_id: u.user_id }, 'Sessões encerradas')}>
                              <LogOut className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-600" title="Excluir">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação remove permanentemente <strong>{u.display_name}</strong> e seu acesso. Não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleAction('delete_user', { target_user_id: u.user_id }, 'Usuário excluído')}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhum usuário encontrado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Usuário</TableHead><TableHead>IP</TableHead><TableHead>Dispositivo</TableHead><TableHead>Última atividade</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.user_id?.slice(0, 8)}…</TableCell>
                      <TableCell className="text-xs">{s.ip ?? '—'}</TableCell>
                      <TableCell className="text-xs truncate max-w-[280px]">{s.device ?? s.user_agent ?? '—'}</TableCell>
                      <TableCell className="text-xs">{new Date(s.last_seen_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleAction('end_session', { session_id: s.id, target_user_id: s.user_id }, 'Sessão encerrada')}>
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Sem sessões ativas registradas</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Data</TableHead><TableHead>Ação</TableHead><TableHead>Ator</TableHead><TableHead>Alvo</TableHead><TableHead>IP</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                      <TableCell className="text-xs">{l.actor_label ?? l.actor_id?.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs font-mono">{l.target_user_id?.slice(0, 8) ?? '—'}</TableCell>
                      <TableCell className="text-xs">{l.ip ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum log de auditoria</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="attempts" className="mt-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Data</TableHead><TableHead>Email</TableHead><TableHead>Sucesso</TableHead><TableHead>Motivo</TableHead><TableHead>IP</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {attempts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(a.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-xs">{a.email}</TableCell>
                      <TableCell>{a.success ? <Badge className="bg-emerald-100 text-emerald-800">OK</Badge> : <Badge variant="destructive">Falhou</Badge>}</TableCell>
                      <TableCell className="text-xs">{a.reason ?? '—'}</TableCell>
                      <TableCell className="text-xs">{a.ip ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {attempts.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhuma tentativa registrada</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SecurityPanel;
