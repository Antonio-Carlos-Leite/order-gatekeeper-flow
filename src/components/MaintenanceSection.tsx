
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Download, Printer, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceSectionProps {
  allOrders: any[];
}

const MaintenanceSection = ({ allOrders }: MaintenanceSectionProps) => {
  const [showMaintenance, setShowMaintenance] = useState(false);
  const { toast } = useToast();

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const approvedCount = allOrders.filter(order => order.status === 'approved').length;
      const rejectedCount = allOrders.filter(order => order.status === 'rejected').length;
      const pendingCount = allOrders.filter(order => order.status === 'pending').length;
      const totalValue = allOrders
        .filter(order => order.status === 'approved')
        .reduce((sum, order) => sum + parseFloat(order.valor || 0), 0);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório Completo de Pedidos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-item { text-align: center; padding: 10px; }
            .summary-number { font-size: 24px; font-weight: bold; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-approved { color: #16a34a; font-weight: bold; }
            .status-rejected { color: #dc2626; font-weight: bold; }
            .status-pending { color: #ca8a04; font-weight: bold; }
            .total-row { background-color: #f8f9fa; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Completo de Pedidos</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-number">${allOrders.length}</div>
              <div>Total de Pedidos</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${approvedCount}</div>
              <div>Aprovados</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${rejectedCount}</div>
              <div>Rejeitados</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${pendingCount}</div>
              <div>Pendentes</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div>Valor Total Aprovado</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor</th>
                <th>Fornecedor</th>
                <th>Data Envio</th>
                <th>Status</th>
                <th>Data Aprovação</th>
                <th>Comentários</th>
              </tr>
            </thead>
            <tbody>
              ${allOrders.map(order => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.produto}</td>
                  <td>${order.quantidade}</td>
                  <td>R$ ${parseFloat(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${order.fornecedor}</td>
                  <td>${order.dataEnvio}</td>
                  <td class="status-${order.status}">${
                    order.status === 'approved' ? 'Aprovado' :
                    order.status === 'rejected' ? 'Rejeitado' : 'Pendente'
                  }</td>
                  <td>${order.approvedAt || '-'}</td>
                  <td>${order.comments || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Imprimir Relatório</button>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      summary: {
        total: allOrders.length,
        approved: allOrders.filter(order => order.status === 'approved').length,
        rejected: allOrders.filter(order => order.status === 'rejected').length,
        pending: allOrders.filter(order => order.status === 'pending').length,
        totalValue: allOrders
          .filter(order => order.status === 'approved')
          .reduce((sum, order) => sum + parseFloat(order.valor || 0), 0)
      },
      orders: allOrders
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-completo-pedidos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório baixado",
      description: "O relatório completo foi baixado com sucesso!",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const approvedCount = allOrders.filter(order => order.status === 'approved').length;
  const rejectedCount = allOrders.filter(order => order.status === 'rejected').length;
  const pendingCount = allOrders.filter(order => order.status === 'pending').length;
  const totalValue = allOrders
    .filter(order => order.status === 'approved')
    .reduce((sum, order) => sum + parseFloat(order.valor || 0), 0);

  return (
    <div className="mt-8">
      <Button
        variant="outline"
        onClick={() => setShowMaintenance(!showMaintenance)}
        className="flex items-center gap-2 mb-4"
      >
        <Settings className="w-4 h-4" />
        {showMaintenance ? 'Ocultar Manutenção' : 'Área de Manutenção'}
      </Button>

      {showMaintenance && (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Área de Manutenção
            </CardTitle>
            <CardDescription>
              Relatório completo de todos os pedidos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{allOrders.length}</div>
                <div className="text-sm text-gray-600">Total de Pedidos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                <div className="text-sm text-gray-600">Aprovados</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                <div className="text-sm text-gray-600">Rejeitados</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600">Valor Total Aprovado</div>
            </div>

            <Separator />

            {/* Ações */}
            <div className="flex gap-4 justify-center">
              <Button onClick={handlePrintReport} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Imprimir Relatório
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download JSON
              </Button>
            </div>

            <Separator />

            {/* Tabela de Pedidos */}
            {allOrders.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Data Envio</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.produto}</TableCell>
                        <TableCell>{order.quantidade}</TableCell>
                        <TableCell>R$ {parseFloat(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{order.fornecedor}</TableCell>
                        <TableCell>{order.dataEnvio}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
                <p>Não há pedidos no sistema ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceSection;
