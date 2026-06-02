import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldOff, LifeBuoy } from 'lucide-react';
import logoIppark from '@/assets/logo-ippark.jpeg';

const ContaBloqueada = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <Card className="w-full max-w-md shadow-xl border-red-200">
      <CardHeader className="text-center">
        <img src={logoIppark} alt="IPPARK" className="w-24 h-auto mx-auto mb-3 rounded-lg" />
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShieldOff className="w-5 h-5 text-red-600" />
          <CardTitle>Conta bloqueada</CardTitle>
        </div>
        <CardDescription>
          Sua conta está temporariamente bloqueada por motivos de segurança.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-red-50 border border-red-200 rounded-md p-3">
          <LifeBuoy className="w-4 h-4 mt-0.5 text-red-600" />
          <span>Entre em contato com o administrador da sua empresa ou com o suporte IPPARK para desbloquear seu acesso.</span>
        </div>
        <Button asChild variant="outline" className="w-full"><Link to="/">Voltar ao login</Link></Button>
      </CardContent>
    </Card>
  </div>
);

export default ContaBloqueada;
