import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const passwordPolicy = (pwd: string): string | null => {
  if (pwd.length < 8) return 'Mínimo de 8 caracteres.';
  if (!/[A-Z]/.test(pwd)) return 'Use ao menos uma letra maiúscula.';
  if (!/[0-9]/.test(pwd)) return 'Use ao menos um número.';
  if (!/[^A-Za-z0-9]/.test(pwd)) return 'Use ao menos um caractere especial.';
  return null;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userEmail: string;
}

const ChangePasswordDialog = ({ open, onOpenChange, userEmail }: Props) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = passwordPolicy(next);
    if (err) { toast({ title: 'Senha fraca', description: err, variant: 'destructive' }); return; }
    if (next !== confirm) { toast({ title: 'Confirmação inválida', description: 'As senhas não conferem.', variant: 'destructive' }); return; }
    if (next === current) { toast({ title: 'Senha repetida', description: 'A nova senha deve ser diferente da atual.', variant: 'destructive' }); return; }
    setLoading(true);
    // Verifica senha atual reautenticando
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: current });
    if (signErr) {
      setLoading(false);
      toast({ title: 'Senha atual incorreta', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Senha alterada com sucesso!' });
    setCurrent(''); setNext(''); setConfirm('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lock className="w-4 h-4" /> Alterar senha</DialogTitle>
          <DialogDescription>Por segurança, informe sua senha atual e crie uma nova senha forte.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Senha atual</Label>
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Confirmar nova senha</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <p className="text-xs text-muted-foreground">
            Mínimo 8 caracteres, com maiúscula, número e caractere especial.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Alterar senha'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
