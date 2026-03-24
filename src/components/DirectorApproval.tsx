
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LogOut, CheckCircle, XCircle, Clock, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DirectorApprovalProps {
  orders: any[];
  userInfo: { username: string; password: string; userType: string; codigoAcesso: string; municipio: string; name?: string };
  onApprove: (orderId: string | number, status: 'approved' | 'rejected', comments?: string) => void;
  onLogout: () => void;
  onNavigateToApproved?: () => void;
  onNavigateToEstoque?: () => void;
  lowStockCount?: number;
}

const DirectorApproval = ({ orders, userInfo, onApprove, onLogout }: DirectorApprovalProps) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [comments, setComments] = useState('');
  const { toast } = useToast();

  const handleApprove = () => {
    if (!selectedOrder) return;
    
    onApprove(selectedOrder.id, 'approved', comments);
    toast({
      title: "Pedido Aprovado!",
      description: "O pedido foi aprovado com sucesso.",
    });
    setSelectedOrder(null);
    setComments('');
  };

  const handleReject = () => {
    if (!selectedOrder) return;
    
    onApprove(selectedOrder.id, 'rejected', comments);
    toast({
      title: "Pedido Rejeitado",
      description: "O pedido foi rejeitado.",
      variant: "destructive",
    });
    setSelectedOrder(null);
    setComments('');
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Diretor</h1>
            <p className="text-gray-600">Usuário: {userInfo.name || userInfo.username} (Diretor) - Município: {userInfo.municipio} - {orders.length} pedidos pendentes</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Pedidos */}
          <div>
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Pedidos Pendentes
                </CardTitle>
                <CardDescription>
                  Selecione um pedido para revisar e aprovar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum pedido pendente</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{order.produto || order.tipoServico || 'Pedido'}</h3>
                          <Badge className={getUrgencyColor(order.urgencia || 'normal')}>
                            {(order.urgencia || 'normal').charAt(0).toUpperCase() + (order.urgencia || 'normal').slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Solicitante: {order.solicitante}</p>
                        
                        <p className="text-xs text-gray-500">{order.dataEnvio}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Pedido Selecionado */}
          <div>
            {selectedOrder ? (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Detalhes do Pedido
                  </CardTitle>
                  <CardDescription>
                    Pedido #{selectedOrder.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Produto/Serviço</Label>
                      <p className="font-semibold">{selectedOrder.produto || selectedOrder.tipoServico || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Código do Poste</Label>
                      <p>{selectedOrder.codigoDoPoste ?? selectedOrder.quantidade ?? '—'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Serviço</Label>
                      <p>{selectedOrder.tipoServico || selectedOrder.fornecedor || '—'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Solicitante</Label>
                    <p>{selectedOrder.solicitante}</p>
                  </div>
                  {selectedOrder.enviadoPor && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Enviado por (usuário)</Label>
                      <p className="text-muted-foreground">{selectedOrder.enviadoPor}</p>
                    </div>
                  )}
                  {(selectedOrder.cpf || selectedOrder.Rua || selectedOrder.Bairro) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedOrder.cpf && <div><Label className="text-sm font-medium text-gray-500">CPF</Label><p>{selectedOrder.cpf}</p></div>}
                      {selectedOrder.Rua && <div><Label className="text-sm font-medium text-gray-500">Rua</Label><p>{selectedOrder.Rua}</p></div>}
                      {selectedOrder.Bairro && <div><Label className="text-sm font-medium text-gray-500">Bairro</Label><p>{selectedOrder.Bairro}</p></div>}
                      {selectedOrder.localização && <div><Label className="text-sm font-medium text-gray-500">Localização</Label><p>{selectedOrder.localização}</p></div>}
                    </div>
                  )}
                  {(selectedOrder.DatadaSolicitação || selectedOrder.tipoLampada) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedOrder.DatadaSolicitação && <div><Label className="text-sm font-medium text-gray-500">Data da solicitação</Label><p>{selectedOrder.DatadaSolicitação}</p></div>}
                      {selectedOrder.tipoLampada && <div><Label className="text-sm font-medium text-gray-500">Tipo de Lâmpada</Label><p>{selectedOrder.tipoLampada}</p></div>}
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data de Envio</Label>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedOrder.dataEnvio}
                    </p>
                  </div>

                  {(selectedOrder.justificativa || selectedOrder.observações) && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Justificativa / Observações</Label>
                      <p className="text-gray-700">{selectedOrder.justificativa || selectedOrder.observações}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="comments">Comentários</Label>
                      <Textarea
                        id="comments"
                        placeholder="Adicione comentários sobre a decisão..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2 flex-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </Button>
                      <Button 
                        onClick={handleReject}
                        variant="destructive"
                        className="flex items-center gap-2 flex-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione um pedido para ver os detalhes</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorApproval;
