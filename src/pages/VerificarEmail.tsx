import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, MailCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logoIppark from '@/assets/logo-ippark.jpeg';

type State = 'loading' | 'success' | 'error' | 'expired';

const VerificarEmail = () => {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      const token_hash = params.get('token_hash');
      const type = params.get('type') as any;
      const error = params.get('error') || params.get('error_description');
      if (error) {
        setState(/expired/i.test(error) ? 'expired' : 'error');
        setMessage(error);
        return;
      }
      if (!token_hash || !type) {
        // No params: just show success (came from session)
        const { data } = await supabase.auth.getSession();
        setState(data.session ? 'success' : 'error');
        if (!data.session) setMessage('Link inválido ou já utilizado.');
        return;
      }
      const { error: vErr } = await supabase.auth.verifyOtp({ token_hash, type });
      if (vErr) {
        setState(/expired/i.test(vErr.message) ? 'expired' : 'error');
        setMessage(vErr.message);
      } else {
        setState('success');
      }
    };
    run();
  }, [params]);

  const config = {
    loading: { icon: <Loader2 className="w-5 h-5 animate-spin text-primary" />, title: 'Verificando email...', desc: 'Aguarde um instante.' },
    success: { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, title: 'Email verificado!', desc: 'Seu email foi confirmado com sucesso. Você já pode acessar o sistema.' },
    error: { icon: <XCircle className="w-5 h-5 text-red-600" />, title: 'Não foi possível verificar', desc: message || 'O link de verificação é inválido.' },
    expired: { icon: <XCircle className="w-5 h-5 text-amber-600" />, title: 'Link expirado', desc: 'Solicite um novo email de verificação ao administrador.' },
  }[state];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <img src={logoIppark} alt="IPPARK" className="w-24 h-auto mx-auto mb-3 rounded-lg" />
          <div className="flex items-center justify-center gap-2 mb-1">
            <MailCheck className="w-5 h-5 text-primary" />
            <CardTitle>Verificação de Email</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 text-sm bg-slate-100 rounded-md p-3">
            {config.icon}
            <div>
              <p className="font-medium">{config.title}</p>
              <p className="text-muted-foreground">{config.desc}</p>
            </div>
          </div>
          <Button asChild className="w-full"><Link to="/">Ir para o login</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificarEmail;
