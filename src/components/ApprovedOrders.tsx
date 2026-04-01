import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Calendar, FileText, Printer, Download, FileJson, FileSpreadsheet, FileDown, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportJSON, exportPDF, exportExcel } from '@/utils/backupExports';
import { useState, useMemo } from 'react';

interface ApprovedOrdersProps {
  approvedOrders: any[];
  userInfo: { username: string; password: string; userType: string; codigoAcesso: string; municipio: string; name?: string };
  onLogout: () => void;
  onBackToOrders: () => void;
  allOrders: any[];
}

const ApprovedOrders = ({ approvedOrders, userInfo, onBackToOrders, allOrders }: ApprovedOrdersProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected'>('all');

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
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const watermarkUrl = window.location.origin + '/images/ippark-watermark.png';
      const isRejected = order.status === 'rejected';
      const stampUrl = window.location.origin + (isRejected ? '/images/carimbo-reprovado.png' : '/images/carimbo-aprovado.png');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ordem de Serviço - O.S. Nº ${order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 30px 40px; position: relative; color: #222; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.35; width: 500px; pointer-events: none; z-index: 9999; }
            .stamp-img { display: block; width: 150px; height: 150px; opacity: 0.85; pointer-events: none; }
            .content { position: relative; z-index: 1; }
            .page-title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .company-info { font-size: 12px; line-height: 1.6; }
            .stamp-center { display: flex; align-items: center; justify-content: center; flex: 1; }
            .company-name { font-size: 14px; font-weight: bold; }
            .os-box { border: 2px solid #333; padding: 8px 16px; text-align: center; font-size: 13px; }
            .os-box .os-number { font-weight: bold; font-size: 15px; }
            .section { border: 1.5px solid #333; margin-bottom: 12px; }
            .section-title { background: rgba(240,240,240,0.4); border-bottom: 1.5px solid #333; padding: 6px 12px; font-weight: bold; font-size: 13px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
            .section-body { padding: 10px 14px; font-size: 12px; line-height: 1.8; }
            .section-body .row { display: flex; gap: 20px; flex-wrap: wrap; }
            .section-body .field { flex: 1; min-width: 45%; }
            .field-label { font-weight: bold; }
            .signatures { display: flex; justify-content: space-around; margin-top: 50px; padding-top: 10px; }
            .sig-line { text-align: center; width: 40%; }
            .sig-line hr { border: none; border-top: 1px solid #333; margin-bottom: 5px; }
            .sig-line span { font-size: 11px; }
            .status-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            @media print { button { display: none !important; } body { margin: 15px 25px; } }
            .print-btn { display: block; margin: 20px auto; padding: 10px 30px; background: #333; color: #fff; border: none; cursor: pointer; font-size: 14px; border-radius: 4px; }
            .print-btn:hover { background: #555; }
          </style>
        </head>
        <body>
          <img src="${watermarkUrl}" class="watermark" />
          <div class="content">
            <div class="page-title">REGISTRO DE ORDEM DE SERVIÇO</div>
            <div class="header-row">
              <div class="stamp-center" style="flex: 0 0 auto;"><img src="${stampUrl}" class="stamp-img" /></div>
              <div class="company-info" style="flex: 1; text-align: center;">
                <div class="company-name">IPPARK</div>
                <div>Iluminação Pública</div>
                <div>Município: ${order.municipio || '—'}</div>
              </div>
              <div class="os-box">
                <div class="os-number">O.S. Nº: ${String(order.id).slice(-6).padStart(6, '0')}</div>
                <div>Data de abertura: ${order.dataEnvio || '—'}</div>
                <div>Aprovado em: ${order.approvedAt || '—'}</div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Dados do Solicitante</div>
              <div class="section-body">
                <div class="row">
                  <div class="field"><span class="field-label">Solicitante:</span> ${order.solicitante || '—'}</div>
                  <div class="field"><span class="field-label">Enviado por:</span> ${order.enviadoPor || '—'}</div>
                </div>
                <div class="row">
                  <div class="field"><span class="field-label">Município:</span> ${order.municipio || '—'}</div>
                  <div class="field"><span class="field-label">Status:</span> <span class="status-badge" style="${isRejected ? 'background:#fecaca;color:#991b1b;' : ''}">${isRejected ? '✗ Reprovado' : '✓ Aprovado'}</span></div>
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Informações do Serviço</div>
              <div class="section-body">
                <div class="row">
                  <div class="field"><span class="field-label">Código do Poste:</span> ${order.codigoDoPoste ?? '—'}</div>
                  <div class="field"><span class="field-label">Tipo de Serviço:</span> ${order.tipoServico || '—'}</div>
                </div>
                ${order.tipoLampada ? `<div><span class="field-label">Tipo de Lâmpada:</span> ${order.tipoLampada}</div>` : ''}
                ${order.produto ? `<div><span class="field-label">Produto:</span> ${order.produto}</div>` : ''}
              </div>
            </div>
            <div class="section">
              <div class="section-title">Observações do Atendimento</div>
              <div class="section-body" style="min-height: 60px;">${order.observações || '&nbsp;'}</div>
            </div>
            <div class="section">
              <div class="section-title">Observações Técnico/Gestor</div>
              <div class="section-body" style="min-height: 60px;">${order.comments || '&nbsp;'}</div>
            </div>
            <div class="signatures">
              <div class="sig-line"><hr/><span>Assinatura Solicitante</span></div>
              <div class="sig-line"><hr/><span>Assinatura Responsável Técnico</span></div>
            </div>
            <button class="print-btn" onclick="window.print()">Imprimir</button>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
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
    </div>
  );
};

export default ApprovedOrders;
