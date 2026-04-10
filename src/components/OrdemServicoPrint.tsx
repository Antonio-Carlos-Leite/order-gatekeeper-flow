import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export interface EmpresaInfo {
  nome: string;
  codigoAcesso: string;
  municipio: string;
}

interface OrdemServicoPrintProps {
  order: any;
  empresa: EmpresaInfo;
  responsavel?: string;
  onClose?: () => void;
}

const OrdemServicoPrint = ({ order, empresa, responsavel, onClose }: OrdemServicoPrintProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const osNumber = String(order.id).slice(-6).toUpperCase();
  const logoUrl = window.location.origin + '/images/ippark-watermark.png';

  const statusLabel = order.status === 'executado' ? 'EXECUTADO' :
    order.status === 'aprovado' ? 'APROVADO' :
    order.status === 'rejeitado' ? 'REPROVADO' : 'PENDENTE';

  const statusColor = order.status === 'executado' ? '#1d4ed8' :
    order.status === 'aprovado' ? '#166534' :
    order.status === 'rejeitado' ? '#991b1b' : '#92400e';

  const statusBg = order.status === 'executado' ? '#dbeafe' :
    order.status === 'aprovado' ? '#dcfce7' :
    order.status === 'rejeitado' ? '#fecaca' : '#fef3c7';

  const dataDoc = order.data_solicitacao || new Date(order.created_at).toLocaleDateString('pt-BR');
  const geradoEm = new Date().toLocaleString('pt-BR');

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>O.S. ${osNumber}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        @page { size: A4; margin: 10mm 15mm; }
        body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; font-size: 11px; }
        .page { width: 100%; max-width: 210mm; margin: 0 auto; }
        .header-bar { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 10px; }
        .header-logo img { width: 70px; height: 70px; object-fit: contain; }
        .header-info { flex: 1; }
        .header-info h1 { font-size: 18px; color: #1e3a5f; letter-spacing: 2px; margin-bottom: 1px; }
        .header-info .sub { font-size: 11px; color: #555; }
        .header-info .code { font-size: 10px; color: #777; margin-top: 2px; }
        .title-bar { text-align: center; font-size: 15px; font-weight: bold; color: #1e3a5f; margin-bottom: 8px; letter-spacing: 2px; padding: 6px 0; border: 2px solid #1e3a5f; border-radius: 4px; background: #f0f4f8; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; }
        .meta-row .os-num { font-weight: bold; font-size: 13px; color: #1e3a5f; }
        .status-badge { display: inline-block; padding: 3px 12px; border-radius: 4px; font-weight: bold; font-size: 11px; }
        .section { border: 1px solid #ccc; margin-bottom: 8px; border-radius: 4px; overflow: hidden; }
        .section-title { background: #1e3a5f; color: #fff; padding: 5px 12px; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        .section-body { padding: 6px 12px; }
        .field-row { display: flex; gap: 16px; margin-bottom: 3px; flex-wrap: wrap; }
        .field { flex: 1; min-width: 45%; }
        .field-label { font-weight: bold; color: #444; }
        .obs-box { min-height: 30px; padding: 5px; background: #fafafa; border: 1px dashed #ddd; border-radius: 3px; margin-top: 3px; white-space: pre-wrap; font-size: 10px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 25px; gap: 16px; }
        .sig-block { flex: 1; text-align: center; padding-top: 25px; }
        .sig-block .line { border-top: 1px solid #333; margin-bottom: 4px; }
        .sig-block span { font-size: 9px; color: #555; }
        .footer { text-align: center; margin-top: 12px; font-size: 8px; color: #999; border-top: 1px solid #ddd; padding-top: 5px; }
        .footer .resp { font-size: 9px; color: #555; margin-bottom: 2px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } button { display: none !important; } }
      </style>
      </head><body>
        <div class="page">
          <div class="header-bar">
            <div class="header-logo"><img src="${logoUrl}" alt="Logo" /></div>
            <div class="header-info">
              <h1>IPPARK</h1>
              <div class="sub">Iluminação Pública – ${empresa.municipio}</div>
              <div class="code">Código de Acesso: ${empresa.codigoAcesso}</div>
            </div>
            <div style="text-align:right;font-size:10px;color:#777;">
              <div style="font-weight:bold;color:#1e3a5f;">Empresa</div>
              <div>${empresa.nome}</div>
            </div>
          </div>

          <div class="title-bar">ORDEM DE SERVIÇO</div>

          <div class="meta-row">
            <div><span class="os-num">O.S. Nº ${osNumber}</span></div>
            <div>Data: ${dataDoc}</div>
            <div>Responsável: ${responsavel || '—'}</div>
            <div><span class="status-badge" style="background:${statusBg};color:${statusColor}">${statusLabel}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Solicitante</div>
            <div class="section-body">
              <div class="field-row">
                <div class="field"><span class="field-label">Nome:</span> ${order.solicitante || '—'}</div>
                <div class="field"><span class="field-label">CPF:</span> ${order.cpf || '—'}</div>
              </div>
              <div class="field-row">
                <div class="field"><span class="field-label">Rua:</span> ${order.rua || '—'}</div>
                <div class="field"><span class="field-label">Bairro:</span> ${order.bairro || '—'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Atendimento</div>
            <div class="section-body">
              <div class="field-row">
                <div class="field"><span class="field-label">Descrição:</span> ${order.observacoes_atendimento || '—'}</div>
              </div>
              <div class="field-row">
                <div class="field"><span class="field-label">Código do Poste:</span> ${order.codigo_poste || '—'}</div>
                <div class="field"><span class="field-label">Localização:</span> ${order.localizacao || '—'}</div>
              </div>
              <div class="field-row">
                <div class="field"><span class="field-label">Tipo de Serviço:</span> ${order.tipo_servico || '—'}</div>
                <div class="field"><span class="field-label">Tipo de Lâmpada:</span> ${order.tipo_lampada || '—'}</div>
              </div>
              <div class="field-row">
                <div class="field"><span class="field-label">Data da Solicitação:</span> ${order.data_solicitacao || '—'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Materiais Utilizados</div>
            <div class="section-body">
              <div class="obs-box">${order.tipo_lampada ? `• ${order.tipo_lampada} (1 unidade)` : 'Nenhum material registrado'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Observações</div>
            <div class="section-body">
              <div class="obs-box">${order.observacoes_atendimento || '—'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Observações Técnico / Gestor</div>
            <div class="section-body">
              <div class="obs-box">${order.observacoes_tecnico || order.comments || '—'}</div>
            </div>
          </div>

          <div class="signatures">
            <div class="sig-block"><div class="line"></div><span>Solicitante</span></div>
            <div class="sig-block"><div class="line"></div><span>Responsável Técnico</span></div>
            <div class="sig-block"><div class="line"></div><span>Execução</span></div>
          </div>

          <div class="footer">
            <div class="resp">Responsável: ${responsavel || '—'} | Data: ${geradoEm}</div>
            Documento gerado automaticamente pelo sistema – IPPARK – ${empresa.nome}
          </div>
        </div>
        <script>window.onload=function(){window.print()}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header with logo placeholder + empresa info
    doc.setFillColor(30, 58, 95);
    doc.rect(15, y - 5, 15, 15, 'F');
    doc.setTextColor(255);
    doc.setFontSize(7);
    doc.text('IP', 22.5, y + 3, { align: 'center' });

    doc.setTextColor(30, 58, 95);
    doc.setFontSize(18);
    doc.text('IPPARK', 35, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Iluminação Pública – ${empresa.municipio}`, 35, y);
    y += 4;
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(`${empresa.nome} | Código: ${empresa.codigoAcesso}`, 35, y);
    y += 5;
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.8);
    doc.line(15, y, w - 15, y);
    y += 7;

    // Title
    doc.setFillColor(240, 244, 248);
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y - 3, w - 30, 10, 2, 2, 'FD');
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 95);
    doc.text('ORDEM DE SERVIÇO', w / 2, y + 4, { align: 'center' });
    y += 12;

    // Meta info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`O.S. Nº ${osNumber}`, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${dataDoc}`, w / 2, y, { align: 'center' });
    doc.text(`Status: ${statusLabel}`, w - 15, y, { align: 'right' });
    y += 5;
    doc.text(`Responsável: ${responsavel || '—'}`, 15, y);
    y += 7;

    const addSection = (title: string, rows: string[][]) => {
      doc.setFillColor(30, 58, 95);
      doc.rect(15, y, w - 30, 7, 'F');
      doc.setTextColor(255);
      doc.setFontSize(9);
      doc.text(title.toUpperCase(), 18, y + 5);
      y += 9;
      doc.setTextColor(0);
      doc.setFontSize(9);
      rows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 18, y);
        doc.setFont('helvetica', 'normal');
        const maxW = w - 65;
        const lines = doc.splitTextToSize(value || '—', maxW);
        doc.text(lines, 60, y);
        y += 5 * lines.length;
      });
      y += 3;
    };

    addSection('Dados do Solicitante', [
      ['Nome', order.solicitante || '—'],
      ['CPF', order.cpf || '—'],
      ['Rua', order.rua || '—'],
      ['Bairro', order.bairro || '—'],
    ]);

    addSection('Dados do Atendimento', [
      ['Descrição', order.observacoes_atendimento || '—'],
      ['Código do Poste', order.codigo_poste || '—'],
      ['Localização', order.localizacao || '—'],
      ['Tipo de Serviço', order.tipo_servico || '—'],
      ['Tipo de Lâmpada', order.tipo_lampada || '—'],
      ['Data da Solicitação', order.data_solicitacao || '—'],
    ]);

    addSection('Materiais Utilizados', [
      ['Material', order.tipo_lampada ? `${order.tipo_lampada} (1 unidade)` : 'Nenhum material registrado'],
    ]);

    addSection('Observações', [
      ['Observações', order.observacoes_atendimento || '—'],
    ]);

    addSection('Observações Técnico/Gestor', [
      ['Observações', order.observacoes_tecnico || order.comments || '—'],
    ]);

    // Signatures
    y = Math.max(y + 10, 240);
    const sigPositions = [w * 0.2, w * 0.5, w * 0.8];
    const sigLabels = ['Solicitante', 'Resp. Técnico', 'Execução'];
    sigPositions.forEach((x, i) => {
      doc.line(x - 25, y, x + 25, y);
      doc.setFontSize(8);
      doc.setTextColor(80);
      doc.text(sigLabels[i], x, y + 4, { align: 'center' });
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Responsável: ${responsavel || '—'} | Data: ${geradoEm}`, w / 2, 280, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Documento gerado automaticamente pelo sistema – IPPARK – ${empresa.nome}`,
      w / 2, 285, { align: 'center' }
    );

    doc.save(`OS_${osNumber}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div ref={printRef} className="bg-white rounded-lg border shadow-sm p-6 max-w-3xl mx-auto text-sm">
        {/* Header with empresa identity */}
        <div className="flex items-center gap-4 border-b-2 border-[#1e3a5f] pb-3 mb-4">
          <img src={logoUrl} alt="Logo IPPARK" className="w-16 h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1e3a5f] tracking-widest">IPPARK</h1>
            <p className="text-xs text-muted-foreground">Iluminação Pública – {empresa.municipio}</p>
            <p className="text-[10px] text-muted-foreground">Código de Acesso: {empresa.codigoAcesso}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#1e3a5f]">Empresa</p>
            <p className="text-xs text-muted-foreground">{empresa.nome}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center text-base font-bold text-[#1e3a5f] tracking-wider mb-3 border-2 border-[#1e3a5f] rounded py-1.5 bg-blue-50/50">
          ORDEM DE SERVIÇO
        </div>

        {/* Meta */}
        <div className="flex flex-wrap justify-between items-center mb-4 text-xs gap-2">
          <span className="font-bold text-[#1e3a5f]">O.S. Nº {osNumber}</span>
          <span>Data: {dataDoc}</span>
          <span>Responsável: {responsavel || '—'}</span>
          <span className="px-3 py-1 rounded text-xs font-bold" style={{ background: statusBg, color: statusColor }}>{statusLabel}</span>
        </div>

        <Section title="Dados do Solicitante">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nome" value={order.solicitante} />
            <Field label="CPF" value={order.cpf} />
            <Field label="Rua" value={order.rua} />
            <Field label="Bairro" value={order.bairro} />
          </div>
        </Section>

        <Section title="Dados do Atendimento">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Descrição" value={order.observacoes_atendimento} />
            <Field label="Código do Poste" value={order.codigo_poste} />
            <Field label="Localização" value={order.localizacao} />
            <Field label="Tipo de Serviço" value={order.tipo_servico} />
            <Field label="Tipo de Lâmpada" value={order.tipo_lampada} />
            <Field label="Data da Solicitação" value={order.data_solicitacao} />
          </div>
        </Section>

        <Section title="Materiais Utilizados">
          <p className="min-h-[20px] bg-muted/30 p-2 rounded border border-dashed text-xs">
            {order.tipo_lampada ? `• ${order.tipo_lampada} (1 unidade)` : 'Nenhum material registrado'}
          </p>
        </Section>

        <Section title="Observações">
          <p className="min-h-[25px] bg-muted/30 p-2 rounded border border-dashed text-xs whitespace-pre-wrap">
            {order.observacoes_atendimento || '—'}
          </p>
        </Section>

        <Section title="Observações Técnico / Gestor">
          <p className="min-h-[25px] bg-muted/30 p-2 rounded border border-dashed text-xs whitespace-pre-wrap">
            {order.observacoes_tecnico || order.comments || '—'}
          </p>
        </Section>

        {/* Signatures */}
        <div className="flex justify-between mt-6 pt-4">
          {['Solicitante', 'Responsável Técnico', 'Execução'].map(label => (
            <div key={label} className="text-center w-[30%]">
              <div className="border-t border-foreground/40 mb-1"></div>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 pt-2 border-t space-y-0.5">
          <p className="text-[9px] text-muted-foreground">Responsável: {responsavel || '—'} | Data: {geradoEm}</p>
          <p className="text-[8px] text-muted-foreground">Documento gerado automaticamente pelo sistema – IPPARK – {empresa.nome}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Imprimir O.S.
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Exportar PDF
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="ghost">Fechar</Button>
        )}
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded mb-2 overflow-hidden">
      <div className="bg-[#1e3a5f] text-white px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase">{title}</div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="text-xs">
      <span className="font-bold text-muted-foreground">{label}:</span>{' '}
      <span>{value || '—'}</span>
    </div>
  );
}

export default OrdemServicoPrint;
