import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onCreated: () => void;
}

const CreateUserDialog = ({ onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const [empresas, setEmpresas] = useState<{ id: string; nome: string; codigo_acesso: string }[]>([]);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [role, setRole] = useState('funcionario');
  const [loading, setLoading] = useState(false);
  const [tempPwd, setTempPwd] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    supabase.functions.invoke('admin-security', { body: { action: 'list_empresas' } })
      .then(({ data }) => setEmpresas(data?.empresas ?? []));
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !displayName || !empresaId || !role) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-security', {
      body: { action: 'create_user', email, display_name: displayName, username: email, empresa_id: empresaId, role },
    });
    setLoading(false);
    if (error || data?.error) {
      toast({ title: 'Erro ao criar usuário', description: data?.error ?? error?.message, variant: 'destructive' });
      return;
    }
    setTempPwd(data.temporary_password);
    toast({ title: 'Usuário criado com sucesso!' });
    onCreated();
  };

  const reset = () => {
    setEmail(''); setDisplayName(''); setEmpresaId(''); setRole('funcionario');
    setTempPwd(null); setCopied(false);
  };

  const copyPwd = () => {
    if (!tempPwd) return;
    navigator.clipboard.writeText(tempPwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><UserPlus className="w-4 h-4" />Novo usuário</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar novo usuário</DialogTitle>
          <DialogDescription>
            O usuário receberá uma senha temporária e será obrigado a trocá-la no primeiro acesso.
          </DialogDescription>
        </DialogHeader>

        {!tempPwd ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Empresa / Município</Label>
              <Select value={empresaId} onValueChange={setEmpresaId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {empresas.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.codigo_acesso} · {e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Papel</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="funcionario">Funcionário</SelectItem>
                  <SelectItem value="diretor">Diretor</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar usuário'}</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border bg-amber-50 border-amber-200 p-3 text-sm">
              <p className="font-medium text-amber-900 mb-1">Senha temporária gerada</p>
              <p className="text-amber-800 text-xs">Compartilhe esta senha com o usuário por canal seguro. Ele será obrigado a trocá-la no primeiro login. Esta senha não será exibida novamente.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input readOnly value={tempPwd} className="font-mono" />
              <Button type="button" variant="outline" onClick={copyPwd}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => { setOpen(false); reset(); }}>Concluir</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
