import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logoIppark from '@/assets/logo-ippark.jpeg';

const passwordPolicy = (pwd: string): string | null => {
  if (pwd.length < 8) return 'Mínimo de 8 caracteres.';
  if (!/[A-Z]/.test(pwd)) return 'Use ao menos uma letra maiúscula.';
  if (!/[0-9]/.test(pwd)) return 'Use ao menos um número.';
  if (!/[^A-Za-z0-9]/.test(pwd)) return 'Use ao menos um caractere especial.';
  return null;
};

interface Props {
  userId: string;
  onCompleted: () => void;
  onSignOut: () => void;
}

const FirstAccessGate = ({ userId, onCompleted, onSignOut }: Props) => {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = passwordPolicy(next);
    if (err) { toast({ title: 'Senha fraca', description: err, variant: 'destructive' }); return; }
    if (next !== confirm) { toast({ title: 'Confirmação inválida', description: 'As senhas não conferem.', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      setLoading(false);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    // Clear must_change_password flag
    await supabase.functions.invoke('admin-security', {
      body: { action: 'clear_must_change_password', target_user_id: userId },
    }).catch(() => {});
    setLoading(false);
    toast({ title: 'Senha definida com sucesso!', description: 'Acesso liberado.' });
    onCompleted();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <img src={logoIppark} alt="IPPARK" className="w-24 h-auto mx-auto mb-3 rounded-lg" />
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <CardTitle>Primeiro Acesso</CardTitle>
          </div>
          <CardDescription>
            Por segurança, você precisa definir uma nova senha pessoal antes de continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, com maiúscula, número e caractere especial.
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Definir senha e continuar'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={onSignOut}>
              Sair
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstAccessGate;
