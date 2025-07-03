
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogOut, CheckCircle, XCircle, Clock, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DirectorApprovalProps {
  orderData: any;
  userInfo: { username: string; password: string };
  onBack: () => void;
  onLogout: () => void;
}

const DirectorApproval = ({ orderData, userInfo, onBack, onLogout }: DirectorApprovalProps) => {
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState('Aguardando Aprovação');
  const { toast } = useToast();

  const handleApprove = () => {
    setStatus('Aprovado');
    toast({
      title: "Pedido Aprovado!",
      description: "O pedido foi aprovado com sucesso.",
    });
  };

  const handleReject = () => {
    setStatus('Rejeitado');
    toast({
      title: "Pedido Rejeitado",
      description: "O pedido foi rejeitado.",
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getUrgencyColor = (urgencia: string) => {
    switch (urgencia) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Aprovação do Diretor</h1>
              <p className="text-gray-600">Revisar e aprovar pedido de compra</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detalhes do Pedido */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Detalhes do Pedido
                    </CardTitle>
                    <CardDescription>
                      Pedido #{Date.now().toString().slice(-6)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(status)}>
                    {status === 'Aguardando Aprovação' && <Clock className="w-3 h-3 mr-1" />}
                    {status === 'Aprovado' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {status === 'Rejeitado' && <XCircle className="w-3 h-3 mr-1" />}
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Produto/Serviço</Label>
                    <p className="text-lg font-semibold">{orderData.produto}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Quantidade</Label>
                    <p className="text-lg">{orderData.quantidade}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Valor Total</Label>
                    <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      R$ {parseFloat(orderData.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fornecedor</Label>
                    <p className="text-lg">{orderData.fornecedor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Categoria</Label>
                    <p className="text-lg capitalize">{orderData.categoria?.replace('-', ' ') || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Urgência</Label>
                    <Badge className={getUrgencyColor(orderData.urgencia)}>
                      {orderData.urgencia.charAt(0).toUpperCase() + orderData.urgencia.slice(1)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-500">Prazo de Entrega</Label>
                  <p className="text-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {orderData.prazoEntrega ? new Date(orderData.prazoEntrega).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>

                {orderData.justificativa && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Justificativa</Label>
                    <p className="text-gray-700 mt-1">{orderData.justificativa}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Painel de Aprovação */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Solicitante</Label>
                    <p className="text-lg">{orderData.solicitante}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data de Envio</Label>
                    <p className="text-sm text-gray-600">{orderData.dataEnvio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Ações do Diretor</CardTitle>
                <CardDescription>
                  Aprove ou rejeite este pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comments">Comentários</Label>
                  <Textarea
                    id="comments"
                    placeholder="Adicione comentários sobre a decisão..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    disabled={status !== 'Aguardando Aprovação'}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprovar Pedido
                  </Button>
                  <Button 
                    onClick={handleReject}
                    variant="destructive"
                    className="flex items-center gap-2"
                    disabled={status !== 'Aguardando Aprovação'}
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeitar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorApproval;
