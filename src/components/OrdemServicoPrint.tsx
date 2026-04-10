import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrdemServicoPrintProps {
  order: any;
  municipio: string;
  onClose?: () => void;
}

const OrdemServicoPrint = ({ order, municipio, onClose }: OrdemServicoPrintProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const osNumber = String(order.id).slice(-6).toUpperCase();

  const statusLabel = order.status === 'executado' ? 'EXECUTADO' :
    order.status === 'aprovado' ? 'APROVADO' :
    order.status === 'rejeitado' ? 'REPROVADO' : 'PENDENTE';

  const statusColor = order.status === 'executado' ? '#1d4ed8' :
    order.status === 'aprovado' ? '#166534' :
    order.status === 'rejeitado' ? '#991b1b' : '#92400e';

  const statusBg = order.status === 'executado' ? '#dbeafe' :
    order.status === 'aprovado' ? '#dcfce7' :
    order.status === 'rejeitado' ? '#fecaca' : '#fef3c7';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !printRef.current) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>O.S. ${osNumber}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        @page { size: A4; margin: 12mm 15mm; }
        body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; font-size: 11px; }
        .page { width: 100%; max-width: 210mm; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 12px; }
        .header h1 { font-size: 18px; color: #1e3a5f; letter-spacing: 3px; margin-bottom: 2px; }
        .header h2 { font-size: 13px; color: #555; font-weight: normal; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 11px; }
        .meta-row .os-num { font-weight: bold; font-size: 13px; color: #1e3a5f; }
        .status-badge { display: inline-block; padding: 3px 12px; border-radius: 4px; font-weight: bold; font-size: 11px; }
        .section { border: 1px solid #ccc; margin-bottom: 10px; border-radius: 4px; overflow: hidden; }
        .section-title { background: #1e3a5f; color: #fff; padding: 6px 12px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        .section-body { padding: 8px 12px; }
        .field-row { display: flex; gap: 16px; margin-bottom: 4px; flex-wrap: wrap; }
        .field { flex: 1; min-width: 45%; }
        .field-label { font-weight: bold; color: #444; }
        .obs-box { min-height: 40px; padding: 6px; background: #fafafa; border: 1px dashed #ddd; border-radius: 3px; margin-top: 4px; white-space: pre-wrap; }
        .signatures { display: flex; justify-content: space-between; margin-top: 30px; gap: 20px; }
        .sig-block { flex: 1; text-align: center; padding-top: 30px; }
        .sig-block .line { border-top: 1px solid #333; margin-bottom: 4px; }
        .sig-block span { font-size: 10px; color: #555; }
        .footer { text-align: center; margin-top: 15px; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 6px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head><body>
        <div class="page">
          <div class="header">
            <h1>IPPARK</h1>
            <h2>Sistema de Iluminação Pública – ${municipio}</h2>
          </div>
          <div style="text-align:center;font-size:15px;font-weight:bold;color:#1e3a5f;margin-bottom:10px;letter-spacing:2px;">ORDEM DE SERVIÇO</div>
          <div class="meta-row">
            <div><span class="os-num">O.S. Nº ${osNumber}</span></div>
            <div>Data: ${order.data_solicitacao || new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
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
            Documento gerado em ${new Date().toLocaleString('pt-BR')} — IPPARK – Sistema de Iluminação Pública
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

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 95);
    doc.text('IPPARK', w / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Sistema de Iluminação Pública – ${municipio}`, w / 2, y, { align: 'center' });
    y += 4;
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.8);
    doc.line(15, y, w - 15, y);
    y += 8;

    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('ORDEM DE SERVIÇO', w / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`O.S. Nº ${osNumber}`, 15, y);
    doc.text(`Data: ${order.data_solicitacao || new Date(order.created_at).toLocaleDateString('pt-BR')}`, w / 2, y, { align: 'center' });
    doc.text(`Status: ${statusLabel}`, w - 15, y, { align: 'right' });
    y += 8;

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
        doc.text(value || '—', 60, y);
        y += 5;
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
      ['Código do Poste', order.codigo_poste || '—'],
      ['Localização', order.localizacao || '—'],
      ['Tipo de Serviço', order.tipo_servico || '—'],
      ['Tipo de Lâmpada', order.tipo_lampada || '—'],
      ['Data da Solicitação', order.data_solicitacao || '—'],
    ]);

    addSection('Observações', [
      ['Observações', order.observacoes_atendimento || '—'],
    ]);

    addSection('Observações Técnico/Gestor', [
      ['Observações', order.observacoes_tecnico || order.comments || '—'],
    ]);

    // Signatures
    y += 15;
    const sigPositions = [w * 0.2, w * 0.5, w * 0.8];
    const sigLabels = ['Solicitante', 'Resp. Técnico', 'Execução'];
    sigPositions.forEach((x, i) => {
      doc.line(x - 25, y, x + 25, y);
      doc.setFontSize(8);
      doc.text(sigLabels[i], x, y + 4, { align: 'center' });
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Documento gerado em ${new Date().toLocaleString('pt-BR')} — IPPARK`,
      w / 2, 285, { align: 'center' }
    );

    doc.save(`OS_${osNumber}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div ref={printRef} className="bg-white rounded-lg border shadow-sm p-6 max-w-3xl mx-auto text-sm">
        <div className="text-center border-b-2 border-[#1e3a5f] pb-3 mb-4">
          <h1 className="text-xl font-bold text-[#1e3a5f] tracking-widest">IPPARK</h1>
          <p className="text-xs text-muted-foreground">Sistema de Iluminação Pública – {municipio}</p>
        </div>
        <div className="text-center text-base font-bold text-[#1e3a5f] tracking-wider mb-3">ORDEM DE SERVIÇO</div>
        <div className="flex justify-between items-center mb-4 text-xs">
          <span className="font-bold text-[#1e3a5f]">O.S. Nº {osNumber}</span>
          <span>Data: {order.data_solicitacao || new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
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
            <Field label="Código do Poste" value={order.codigo_poste} />
            <Field label="Localização" value={order.localizacao} />
            <Field label="Tipo de Serviço" value={order.tipo_servico} />
            <Field label="Tipo de Lâmpada" value={order.tipo_lampada} />
            <Field label="Data da Solicitação" value={order.data_solicitacao} />
          </div>
        </Section>

        <Section title="Observações">
          <p className="min-h-[30px] bg-muted/30 p-2 rounded border border-dashed text-xs whitespace-pre-wrap">
            {order.observacoes_atendimento || '—'}
          </p>
        </Section>

        <Section title="Observações Técnico / Gestor">
          <p className="min-h-[30px] bg-muted/30 p-2 rounded border border-dashed text-xs whitespace-pre-wrap">
            {order.observacoes_tecnico || order.comments || '—'}
          </p>
        </Section>

        <div className="flex justify-between mt-8 pt-4">
          {['Solicitante', 'Responsável Técnico', 'Execução'].map(label => (
            <div key={label} className="text-center w-[30%]">
              <div className="border-t border-foreground/40 mb-1"></div>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="text-center text-[9px] text-muted-foreground mt-4 pt-2 border-t">
          Documento gerado em {new Date().toLocaleString('pt-BR')} — IPPARK
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
    <div className="border rounded mb-3 overflow-hidden">
      <div className="bg-[#1e3a5f] text-white px-3 py-1.5 text-xs font-bold tracking-wide uppercase">{title}</div>
      <div className="p-3">{children}</div>
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
