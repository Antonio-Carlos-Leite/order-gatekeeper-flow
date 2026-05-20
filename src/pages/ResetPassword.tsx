import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const passwordPolicy = (pwd: string): string | null => {
  if (pwd.length < 8) return 'Mínimo de 8 caracteres.';
  if (!/[A-Z]/.test(pwd)) return 'Use ao menos uma letra maiúscula.';
  if (!/[0-9]/.test(pwd)) return 'Use ao menos um número.';
  if (!/[^A-Za-z0-9]/.test(pwd)) return 'Use ao menos um caractere especial.';
  return null;
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase places recovery in URL hash; auth.onAuthStateChange will detect PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // also accept if user is already in a recovery session
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = passwordPolicy(password);
    if (err) { toast({ title: 'Senha fraca', description: err, variant: 'destructive' }); return; }
    if (password !== confirm) { toast({ title: 'Confirmação inválida', description: 'As senhas não conferem.', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Senha redefinida!', description: 'Você já pode entrar com a nova senha.' });
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>Crie uma nova senha forte para sua conta IPPark.</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Validando link de redefinição...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" className="pl-10" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, com maiúscula, número e caractere especial.
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
