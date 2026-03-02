
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogOut, CheckCircle, Calendar, DollarSign, FileText, User, Printer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovedOrdersProps {
  approvedOrders: any[];
  userInfo: { username: string; password: string; userType: string; codigoAcesso: string; municipio: string };
  onLogout: () => void;
  onBackToOrders: () => void;
  allOrders: any[];
}

const ApprovedOrders = ({ approvedOrders, userInfo, onLogout, onBackToOrders, allOrders }: ApprovedOrdersProps) => {
  const { toast } = useToast();

  const handlePrintOrder = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pedido ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; }
            .approved { color: #16a34a; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pedido de Compra</h1>
            <p>Pedido #${order.id}</p>
          </div>
          <div class="order-info">
            <div class="detail"><span class="label">Produto:</span> ${order.produto}</div>
            <div class="detail"><span class="label">Quantidade:</span> ${order.quantidade}</div>
            <div class="detail"><span class="label">Valor Total:</span> R$ ${parseFloat(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="detail"><span class="label">Fornecedor:</span> ${order.fornecedor}</div>
            <div class="detail"><span class="label">Solicitado em:</span> ${order.dataEnvio}</div>
            <div class="detail"><span class="label">Aprovado em:</span> ${order.approvedAt}</div>
            <div class="detail"><span class="label">Status:</span> <span class="approved">Aprovado</span></div>
            ${order.comments ? `<div class="detail"><span class="label">Comentários:</span> ${order.comments}</div>` : ''}
          </div>
          <button onclick="window.print()">Imprimir</button>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleBackupDownload = () => {
    const backupData = {
      approvedOrders,
      allOrders,
      generatedAt: new Date().toLocaleString('pt-BR'),
      user: userInfo.username
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pedidos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup gerado",
      description: "O arquivo de backup foi baixado com sucesso!",
    });
  };

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
              <p className="text-gray-600">Usuário: {userInfo.username} (Funcionário) - Município: {userInfo.municipio} - {approvedOrders.length} pedidos aprovados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBackupDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Backup
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
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

                  <Button 
                    onClick={() => handlePrintOrder(order)}
                    className="w-full flex items-center gap-2 mt-4"
                    variant="outline"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir Pedido
                  </Button>
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
