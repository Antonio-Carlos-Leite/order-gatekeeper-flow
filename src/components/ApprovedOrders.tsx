
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogOut, CheckCircle, Calendar, DollarSign, FileText, User } from 'lucide-react';

interface ApprovedOrdersProps {
  approvedOrders: any[];
  userInfo: { username: string; password: string; userType: string };
  onLogout: () => void;
  onBackToOrders: () => void;
}

const ApprovedOrders = ({ approvedOrders, userInfo, onLogout, onBackToOrders }: ApprovedOrdersProps) => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackToOrders} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Pedidos
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pedidos Aprovados</h1>
              <p className="text-gray-600">Usuário: {userInfo.username} (Funcionário) - {approvedOrders.length} pedidos aprovados</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {approvedOrders.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">Nenhum pedido aprovado ainda</h2>
                <p>Seus pedidos aprovados aparecerão aqui</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedOrders.map((order) => (
              <Card key={order.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5" />
                        {order.produto}
                      </CardTitle>
                      <CardDescription>
                        Pedido #{order.id}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Quantidade</Label>
                      <p className="text-sm">{order.quantidade}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Valor Total</Label>
                      <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        R$ {parseFloat(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500">Fornecedor</Label>
                    <p className="text-sm">{order.fornecedor}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs font-medium text-gray-500">Solicitado em</Label>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {order.dataEnvio}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500">Aprovado em</Label>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {order.approvedAt}
                    </p>
                  </div>

                  {order.comments && (
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Comentários do Diretor</Label>
                      <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded mt-1">{order.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedOrders;
