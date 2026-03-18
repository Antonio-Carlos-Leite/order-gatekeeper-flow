
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogOut, CheckCircle, Calendar, FileText, Printer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovedOrdersProps {
  approvedOrders: any[];
  userInfo: { username: string; password: string; userType: string; codigoAcesso: string; municipio: string; name?: string };
  onLogout: () => void;
  onBackToOrders: () => void;
  allOrders: any[];
}

const ApprovedOrders = ({ approvedOrders, userInfo, onLogout, onBackToOrders, allOrders }: ApprovedOrdersProps) => {
  const { toast } = useToast();

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
            .watermark {
              position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
              opacity: 0.35; width: 500px; pointer-events: none; z-index: 0;
            }
            .stamp-img {
              display: block; width: 150px; height: 150px;
              opacity: 0.85; pointer-events: none;
            }
            .content { position: relative; z-index: 1; }
            .page-title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .company-info { font-size: 12px; line-height: 1.6; }
            .stamp-center { display: flex; align-items: center; justify-content: center; flex: 1; }
            .company-name { font-size: 14px; font-weight: bold; }
            .os-box { border: 2px solid #333; padding: 8px 16px; text-align: center; font-size: 13px; }
            .os-box .os-number { font-weight: bold; font-size: 15px; }
            .section { border: 1.5px solid #333; margin-bottom: 12px; }
            .section-title { background: #f0f0f0; border-bottom: 1.5px solid #333; padding: 6px 12px; font-weight: bold; font-size: 13px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
            .section-body { padding: 10px 14px; font-size: 12px; line-height: 1.8; }
            .section-body .row { display: flex; gap: 20px; flex-wrap: wrap; }
            .section-body .field { flex: 1; min-width: 45%; }
            .field-label { font-weight: bold; }
            .signatures { display: flex; justify-content: space-around; margin-top: 50px; padding-top: 10px; }
            .sig-line { text-align: center; width: 40%; }
            .sig-line hr { border: none; border-top: 1px solid #333; margin-bottom: 5px; }
            .sig-line span { font-size: 11px; }
            .status-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            @media print { 
              button { display: none !important; } 
              body { margin: 15px 25px; }
            }
            .print-btn { display: block; margin: 20px auto; padding: 10px 30px; background: #333; color: #fff; border: none; cursor: pointer; font-size: 14px; border-radius: 4px; }
            .print-btn:hover { background: #555; }
          </style>
        </head>
        <body>
          <img src="${watermarkUrl}" class="watermark" />
          <div class="content">
            <div class="page-title">REGISTRO DE ORDEM DE SERVIÇO</div>
            
            <div class="header-row">
              <div class="stamp-center" style="flex: 0 0 auto;">
                <img src="${stampUrl}" class="stamp-img" />
              </div>
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
                  <div class="field"><span class="field-label">Código do Poste:</span> ${order.codigoDoPoste ?? order.quantidade ?? '—'}</div>
                  <div class="field"><span class="field-label">Tipo de Serviço:</span> ${order.tipoServico || order.fornecedor || '—'}</div>
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
              <p className="text-gray-600">Usuário: {userInfo.name || userInfo.username} (Funcionário) - Município: {userInfo.municipio} - {approvedOrders.length} pedidos aprovados</p>
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
                        {order.produto || order.tipoServico || 'Pedido'}
                      </CardTitle>
                      <CardDescription>
                        Pedido #{order.id} · Solicitante: {order.solicitante || '—'}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Solicitante</Label>
                    <p className="text-sm font-medium">{order.solicitante || '—'}</p>
                  </div>
                  {order.enviadoPor && (
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Enviado por</Label>
                      <p className="text-xs text-gray-600">{order.enviadoPor}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Código do Poste</Label>
                    <p className="text-sm">{order.codigoDoPoste ?? order.quantidade ?? '—'}</p>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500">Tipo de Serviço</Label>
                    <p className="text-sm">{order.tipoServico || order.fornecedor || '—'}</p>
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

                  {(order.tipoLampada || order.observações) && (
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Tipo de Lâmpada / Observações do Atendimento</Label>
                      <p className="text-xs text-gray-700">{[order.tipoLampada, order.observações].filter(Boolean).join(' · ')}</p>
                    </div>
                  )}
                  {order.comments && (
                    <div>
                      <Label className="text-xs font-medium text-gray-500">Observações Técnico/Gestor</Label>
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
