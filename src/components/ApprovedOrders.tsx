import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Calendar, FileText, Printer, Download, FileJson, FileSpreadsheet, FileDown, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportJSON, exportPDF, exportExcel } from '@/utils/backupExports';
import { useState, useMemo } from 'react';
import OrdemServicoPrint, { type EmpresaInfo } from './OrdemServicoPrint';

interface ApprovedOrdersProps {
  approvedOrders: any[];
  userInfo: { username: string; password: string; userType: string; codigoAcesso: string; municipio: string; name?: string };
  onLogout: () => void;
  onBackToOrders: () => void;
  allOrders: any[];
  empresa: EmpresaInfo;
  responsavel?: string;
}

const ApprovedOrders = ({ approvedOrders, userInfo, onBackToOrders, allOrders, empresa, responsavel }: ApprovedOrdersProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const filteredOrders = useMemo(() => {
    return approvedOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        (order.solicitante || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.tipoServico || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.codigoDoPoste || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.produto || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [approvedOrders, searchTerm, statusFilter]);

  const handlePrintOrder = (order: any) => {
    // Converte legacy → novo formato esperado pelo OrdemServicoPrint
    setSelectedOrder({
      id: order.id,
      status: order.status === 'approved' ? 'aprovado' : order.status === 'rejected' ? 'rejeitado' : 'pendente',
      created_at: order.dataEnvio ? new Date().toISOString() : new Date().toISOString(),
      solicitante: order.solicitante,
      cpf: order.cpf,
      rua: order.Rua,
      bairro: order.Bairro,
      localizacao: order.localização,
      codigo_poste: order.codigoDoPoste,
      tipo_servico: order.tipoServico || order.produto,
      tipo_lampada: order.tipoLampada,
      data_solicitacao: order.DatadaSolicitação,
      observacoes_atendimento: order.observações,
      observacoes_tecnico: order.comments,
    });
  };

  const handleBackupJSON = () => {
    exportJSON(allOrders, approvedOrders, userInfo.username);
    toast({ title: "Backup JSON gerado", description: "O arquivo JSON foi baixado com sucesso!" });
  };

  const handleBackupPDF = () => {
    exportPDF(allOrders);
    toast({ title: "Relatório PDF gerado", description: "O relatório PDF foi baixado com sucesso!" });
  };

  const handleBackupExcel = () => {
    exportExcel(allOrders);
    toast({ title: "Planilha Excel gerada", description: "A planilha Excel foi baixada com sucesso!" });
  };

  const approvedCount = approvedOrders.filter(o => o.status === 'approved').length;
  const rejectedCount = approvedOrders.filter(o => o.status === 'rejected').length;

  return (
    <div>
      {/* Stats + Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-3">
          <Card className="px-4 py-2 border-0 shadow-sm bg-white/80">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-xl font-bold">{approvedOrders.length}</div>
          </Card>
          <Card className="px-4 py-2 border-0 shadow-sm bg-green-50">
            <div className="text-xs text-green-700">Aprovados</div>
            <div className="text-xl font-bold text-green-800">{approvedCount}</div>
          </Card>
          <Card className="px-4 py-2 border-0 shadow-sm bg-red-50">
            <div className="text-xs text-red-700">Rejeitados</div>
            <div className="text-xl font-bold text-red-800">{rejectedCount}</div>
          </Card>
        </div>

        <div className="flex gap-2 flex-1 items-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitante, serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/80"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[140px] bg-white/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-white/80">
                <Download className="w-4 h-4" />
                Backup
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="flex flex-col gap-1">
                <Button variant="ghost" className="justify-start gap-2 text-sm" onClick={handleBackupJSON}>
                  <FileJson className="w-4 h-4" /> Baixar JSON
                </Button>
                <Button variant="ghost" className="justify-start gap-2 text-sm" onClick={handleBackupPDF}>
                  <FileDown className="w-4 h-4" /> Gerar PDF
                </Button>
                <Button variant="ghost" className="justify-start gap-2 text-sm" onClick={handleBackupExcel}>
                  <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">
                {approvedOrders.length === 0 ? 'Nenhum pedido processado ainda' : 'Nenhum resultado encontrado'}
              </h2>
              <p>{approvedOrders.length === 0 ? 'Pedidos processados aparecerão aqui' : 'Tente ajustar os filtros'}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />
                      {order.produto || order.tipoServico || 'Pedido'}
                    </CardTitle>
                    <CardDescription>
                      Solicitante: {order.solicitante || '—'}
                    </CardDescription>
                  </div>
                  <Badge className={order.status === 'rejected' ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                    {order.status === 'rejected' ? <XCircle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                    {order.status === 'rejected' ? 'Reprovado' : 'Aprovado'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Código Poste</Label>
                    <p className="text-sm">{order.codigoDoPoste || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tipo de Serviço</Label>
                    <p className="text-sm">{order.tipoServico || '—'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Solicitado em</Label>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {order.dataEnvio}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Processado em</Label>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {order.approvedAt || '—'}
                    </p>
                  </div>
                </div>

                {order.tipoLampada && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tipo de Lâmpada</Label>
                    <p className="text-xs">{order.tipoLampada}</p>
                  </div>
                )}

                {order.comments && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Comentários do Gestor</Label>
                    <p className="text-xs bg-muted p-2 rounded mt-1">{order.comments}</p>
                  </div>
                )}

                <Button 
                  onClick={() => handlePrintOrder(order)}
                  className="w-full flex items-center gap-2 mt-2"
                  variant="outline"
                  size="sm"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir O.S.
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Ordem de Serviço</DialogTitle>
          {selectedOrder && (
            <OrdemServicoPrint
              order={selectedOrder}
              empresa={empresa}
              responsavel={responsavel}
              onClose={() => setSelectedOrder(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovedOrders;
