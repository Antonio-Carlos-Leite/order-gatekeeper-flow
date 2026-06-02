import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail } from 'lucide-react';
import logoIppark from '@/assets/logo-ippark.jpeg';

const ContaPendente = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <img src={logoIppark} alt="IPPARK" className="w-24 h-auto mx-auto mb-3 rounded-lg" />
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-amber-600" />
          <CardTitle>Conta pendente de ativação</CardTitle>
        </div>
        <CardDescription>
          Sua conta foi criada, mas ainda não foi ativada. Verifique seu email para
          concluir o cadastro ou aguarde a liberação pelo administrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-md p-3">
          <Mail className="w-4 h-4 mt-0.5 text-amber-600" />
          <span>Caso não tenha recebido o email, confira a caixa de spam ou entre em contato com o administrador da sua empresa.</span>
        </div>
        <Button asChild className="w-full"><Link to="/">Voltar ao login</Link></Button>
      </CardContent>
    </Card>
  </div>
);

export default ContaPendente;
