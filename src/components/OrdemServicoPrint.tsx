import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export interface EmpresaInfo {
  nome: string;
  codigoAcesso: string;
  municipio: string;
  cidade?: string;
  estado?: string;
  logoUrl?: string;
  assinaturaUrl?: string;
  responsavelNome?: string;
  responsavelCargo?: string;
}

interface OrdemServicoPrintProps {
  order: any;
  empresa: EmpresaInfo;
  responsavel?: string;
  onClose?: () => void;
  preview?: boolean;
}

const TIPOS_LAMPADA = ['LED', 'METÁLICA', 'VAPOR DE SÓDIO'] as const;
const POTENCIAS = ['50', '70', '80', '100', '150', '200', '250', '300', '400'] as const;

function parseLampada(str?: string | null) {
  const upper = (str || '').toUpperCase();
  let tipo: string | null = null;
  if (upper.includes('LED')) tipo = 'LED';
  else if (upper.includes('METÁLICA') || upper.includes('METALICA')) tipo = 'METÁLICA';
  else if (upper.includes('SÓDIO') || upper.includes('SODIO')) tipo = 'VAPOR DE SÓDIO';
  const match = upper.match(/(\d{2,4})\s*W?/);
  let potencia: string | null = null;
  if (match) {
    const v = match[1];
    if ((POTENCIAS as readonly string[]).includes(v)) potencia = v;
  }
  return { tipo, potencia };
}

const OrdemServicoPrint = ({ order, empresa, responsavel, onClose, preview }: OrdemServicoPrintProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const osNumber = String(order.id).slice(-6).toUpperCase();
  const ipparkWatermark = window.location.origin + '/images/ippark-watermark.png';
  const empresaLogo = empresa.logoUrl || ipparkWatermark;

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
  const localizacaoCompleta = [empresa.cidade || empresa.municipio, empresa.estado].filter(Boolean).join(' - ');

  // Seção MANUAL — sempre vazia, para o técnico preencher à caneta no campo.
  const tecnicoTableHTML = `
    <table class="tecnico">
      <thead>
        <tr>
          <th style="width:30%">Tipo de lâmpada</th>
          <th style="width:42%">Potência (W)</th>
          <th style="width:28%">Outros</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            ${TIPOS_LAMPADA.map(t => `
              <div class="check"><span class="box"></span> ${t}</div>
            `).join('')}
          </td>
          <td>
            <div class="pot-grid">
              ${POTENCIAS.map(p => `
                <div class="check"><span class="box"></span> ${p}</div>
              `).join('')}
            </div>
          </td>
          <td>
            <div class="outros-label">Qual?</div>
            <div class="outros-line"></div>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>O.S. ${osNumber}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        @page { size: A4; margin: 8mm 12mm; }
        html, body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #1a1a1a; font-size: 10.5px; }
        .page { width: 100%; max-width: 210mm; margin: 0 auto; position: relative; min-height: 100vh; }
        .watermark {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex; align-items: center; justify-content: center;
          z-index: 0; pointer-events: none;
        }
        .watermark img {
          width: 85%;
          max-width: 170mm;
          height: auto;
          opacity: 0.08;
          object-fit: contain;
        }
        .content { position: relative; z-index: 1; }
        .header { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #0B2E59; padding-bottom: 8px; margin-bottom: 10px; }
        .header-logo { width: 70px; height: 70px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px; }
        .header-logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .header-center { flex: 1; text-align: center; }
        .header-center h1 { font-size: 17px; color: #0B2E59; letter-spacing: 3px; margin-bottom: 2px; }
        .header-center .empresa { font-size: 12px; font-weight: bold; color: #333; }
        .header-center .loc { font-size: 10px; color: #666; }
        .header-center .code { font-size: 9px; color: #888; }
        .header-right { text-align: right; min-width: 110px; }
        .header-right .num { font-size: 12px; font-weight: bold; color: #0B2E59; }
        .header-right .data { font-size: 9px; color: #555; margin: 2px 0; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 10px; }
        .section { border: 1px solid #e5e7eb; margin-bottom: 7px; border-radius: 5px; overflow: hidden; background: rgba(255,255,255,0.82); }
        .section-title { background: #0B2E59; color: #fff; padding: 5px 11px; font-size: 9.5px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        .section-body { padding: 6px 10px; }
        .field-row { display: flex; gap: 14px; margin-bottom: 2px; flex-wrap: wrap; }
        .field { flex: 1; min-width: 45%; font-size: 10px; }
        .field-label { font-weight: bold; color: #444; }
        .obs-box { min-height: 26px; padding: 4px 6px; background: rgba(250,250,250,0.7); border: 1px dashed #ddd; border-radius: 3px; white-space: pre-wrap; font-size: 9.5px; }
        table.materiais { width: 100%; border-collapse: collapse; font-size: 10px; }
        table.materiais th { background: #f0f4f8; color: #0B2E59; padding: 4px; text-align: left; border: 1px solid #d1d5db; }
        table.materiais td { padding: 4px; border: 1px solid #e5e7eb; }
        /* Tabela técnico */
        table.tecnico { width: 92%; margin: 4px auto; border-collapse: collapse; font-size: 10px; background: rgba(255,255,255,0.85); border-radius: 6px; overflow: hidden; }
        table.tecnico th { background: #f3f6fb; color: #0B2E59; padding: 5px 8px; text-align: left; border: 1px solid #e5e7eb; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.5px; }
        table.tecnico td { padding: 7px 10px; border: 1px solid #e5e7eb; vertical-align: top; }
        .check { display: flex; align-items: center; gap: 5px; margin: 2px 0; font-size: 10px; }
        .box { display: inline-block; width: 11px; height: 11px; border: 1.2px solid #0B2E59; border-radius: 2px; text-align: center; line-height: 9px; font-size: 10px; font-weight: bold; color: #0B2E59; }
        .pot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px 8px; }
        .outros-label { font-weight: bold; color: #444; font-size: 9.5px; margin-bottom: 4px; }
        .outros-line { border-bottom: 1px solid #999; min-height: 36px; padding: 2px; font-size: 10px; }
        .signatures { display: flex; justify-content: space-around; margin-top: 22px; gap: 30px; }
        .sig-block { flex: 1; text-align: center; }
        .sig-img { height: 50px; margin-bottom: 2px; display: flex; align-items: flex-end; justify-content: center; }
        .sig-img img { max-height: 50px; max-width: 180px; object-fit: contain; }
        .sig-line { border-top: 1px solid #333; margin: 0 10px 4px; padding-top: 3px; }
        .sig-block .nome { font-size: 10px; font-weight: bold; color: #222; }
        .sig-block .cargo { font-size: 9px; color: #555; }
        .footer { text-align: center; margin-top: 12px; font-size: 8px; color: #999; border-top: 1px solid #ddd; padding-top: 4px; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          button { display: none !important; }
          .watermark img { opacity: 0.10; }
        }
      </style>
      </head><body>
        <div class="page">
          <div class="watermark"><img src="${ipparkWatermark}" alt="" /></div>
          <div class="content">
            <div class="header">
              <div class="header-logo"><img src="${empresaLogo}" alt="Logo" /></div>
              <div class="header-center">
                <h1>ORDEM DE SERVIÇO</h1>
                <div class="empresa">${empresa.nome}</div>
                <div class="loc">${localizacaoCompleta || ''}</div>
                <div class="code">Código de Acesso: ${empresa.codigoAcesso}</div>
              </div>
              <div class="header-right">
                <div class="num">Nº ${osNumber}</div>
                <div class="data">Data: ${dataDoc}</div>
                <span class="status-badge" style="background:${statusBg};color:${statusColor}">${statusLabel}</span>
              </div>
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
                <div class="field-row">
                  <div class="field"><span class="field-label">Localização:</span> ${order.localizacao || '—'}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Dados do Atendimento</div>
              <div class="section-body">
                <div class="field-row">
                  <div class="field" style="min-width:100%"><span class="field-label">Descrição:</span> ${order.observacoes_atendimento || '—'}</div>
                </div>
                <div class="field-row">
                  <div class="field"><span class="field-label">Código do Poste:</span> ${order.codigo_poste || '—'}</div>
                  <div class="field"><span class="field-label">Tipo de Serviço:</span> ${order.tipo_servico || '—'}</div>
                </div>
                <div class="field-row">
                  <div class="field"><span class="field-label">Tipo de Lâmpada:</span> ${order.tipo_lampada || '—'}</div>
                  <div class="field"><span class="field-label">Data da Solicitação:</span> ${order.data_solicitacao || '—'}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Observações do Técnico</div>
              <div class="section-body">${tecnicoTableHTML}</div>
            </div>

            <div class="section">
              <div class="section-title">Materiais Utilizados</div>
              <div class="section-body">
                <table class="materiais">
                  <thead><tr><th style="width:75%">Produto</th><th>Quantidade</th></tr></thead>
                  <tbody>
                    ${order.tipo_lampada
                      ? `<tr><td>${order.tipo_lampada}</td><td>1</td></tr>`
                      : `<tr><td colspan="2" style="text-align:center;color:#999">Nenhum material registrado</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Observações</div>
              <div class="section-body">
                <div class="obs-box">${order.observacoes_atendimento || '—'}</div>
              </div>
            </div>

            <div class="signatures">
              <div class="sig-block">
                <div class="sig-img">${empresa.assinaturaUrl ? `<img src="${empresa.assinaturaUrl}" alt="Assinatura" />` : ''}</div>
                <div class="sig-line"></div>
                <div class="nome">${empresa.responsavelNome || '—'}</div>
                <div class="cargo">${empresa.responsavelCargo || 'Diretor'}</div>
              </div>
              <div class="sig-block">
                <div class="sig-img"></div>
                <div class="sig-line"></div>
                <div class="nome">&nbsp;</div>
                <div class="cargo">Técnico Responsável</div>
              </div>
            </div>

            <div class="footer">
              Documento gerado pelo sistema IPPARK – ${empresa.nome} – ${new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
        <script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const loadImg = (url: string): Promise<HTMLImageElement | null> =>
    new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });

  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Watermark IPPARK GRANDE central
    const wm = await loadImg(ipparkWatermark);
    if (wm) {
      const ratio = wm.width / wm.height || 1.5;
      const wmWidth = w * 0.8;
      const wmHeight = wmWidth / ratio;
      // @ts-ignore
      const gState = (doc as any).GState ? new (doc as any).GState({ opacity: 0.08 }) : null;
      if (gState) (doc as any).setGState(gState);
      doc.addImage(wm, 'PNG', (w - wmWidth) / 2, (h - wmHeight) / 2, wmWidth, wmHeight);
      if (gState) (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
    }

    let y = 12;

    // Logo empresa
    const logo = empresa.logoUrl ? await loadImg(empresa.logoUrl) : wm;
    if (logo) {
      doc.addImage(logo, 'PNG', 12, y, 18, 18);
    }

    // Centro - título
    doc.setTextColor(11, 46, 89);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('ORDEM DE SERVIÇO', w / 2, y + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(empresa.nome, w / 2, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(localizacaoCompleta, w / 2, y + 14, { align: 'center' });
    doc.text(`Código: ${empresa.codigoAcesso}`, w / 2, y + 17.5, { align: 'center' });

    // Direita
    doc.setTextColor(11, 46, 89);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Nº ${osNumber}`, w - 12, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(`Data: ${dataDoc}`, w - 12, y + 10, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(statusColor);
    doc.text(statusLabel, w - 12, y + 15, { align: 'right' });

    y += 22;
    doc.setDrawColor(11, 46, 89);
    doc.setLineWidth(0.7);
    doc.line(12, y, w - 12, y);
    y += 5;

    const addSection = (title: string, rows: string[][]) => {
      doc.setFillColor(11, 46, 89);
      doc.rect(12, y, w - 24, 6, 'F');
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(title.toUpperCase(), 14, y + 4);
      y += 8;
      doc.setTextColor(0);
      doc.setFontSize(9);
      rows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 14, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(value || '—', w - 70);
        doc.text(lines, 55, y);
        y += 4.5 * lines.length;
      });
      y += 2;
    };

    addSection('Dados do Solicitante', [
      ['Nome', order.solicitante || '—'],
      ['CPF', order.cpf || '—'],
      ['Rua', order.rua || '—'],
      ['Bairro', order.bairro || '—'],
      ['Localização', order.localizacao || '—'],
    ]);

    addSection('Dados do Atendimento', [
      ['Descrição', order.observacoes_atendimento || '—'],
      ['Código do Poste', order.codigo_poste || '—'],
      ['Tipo de Serviço', order.tipo_servico || '—'],
      ['Tipo de Lâmpada', order.tipo_lampada || '—'],
      ['Data Solicitação', order.data_solicitacao || '—'],
    ]);

    // ===== Observações do Técnico (tabela com checkboxes) =====
    doc.setFillColor(11, 46, 89);
    doc.rect(12, y, w - 24, 6, 'F');
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('OBSERVAÇÕES DO TÉCNICO', 14, y + 4);
    y += 8;

    const tecX = 14;
    const tecW = w - 28;
    const col1W = tecW * 0.30;
    const col2W = tecW * 0.42;
    const col3W = tecW * 0.28;
    const tecRowH = 32;

    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    // Header row
    doc.setFillColor(243, 246, 251);
    doc.rect(tecX, y, tecW, 5, 'F');
    doc.setTextColor(11, 46, 89);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('TIPO DE LÂMPADA', tecX + 2, y + 3.5);
    doc.text('POTÊNCIA (W)', tecX + col1W + 2, y + 3.5);
    doc.text('OUTROS', tecX + col1W + col2W + 2, y + 3.5);
    doc.rect(tecX, y, col1W, 5);
    doc.rect(tecX + col1W, y, col2W, 5);
    doc.rect(tecX + col1W + col2W, y, col3W, 5);
    y += 5;

    // Body row
    doc.rect(tecX, y, col1W, tecRowH);
    doc.rect(tecX + col1W, y, col2W, tecRowH);
    doc.rect(tecX + col1W + col2W, y, col3W, tecRowH);

    const drawCheck = (cx: number, cy: number, checked: boolean, label: string) => {
      doc.setDrawColor(11, 46, 89);
      doc.setLineWidth(0.3);
      doc.rect(cx, cy - 2.2, 2.6, 2.6);
      if (checked) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(11, 46, 89);
        doc.text('X', cx + 0.5, cy + 0.2);
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(40);
      doc.text(label, cx + 4, cy);
    };

    // Coluna 1 – tipos
    let cy = y + 5;
    TIPOS_LAMPADA.forEach(t => {
      drawCheck(tecX + 3, cy, tipoDetectado === t, t);
      cy += 5.5;
    });

    // Coluna 2 – potências em grid 3 colunas
    const potColWidth = col2W / 3;
    POTENCIAS.forEach((p, i) => {
      const cIdx = i % 3;
      const rIdx = Math.floor(i / 3);
      const px = tecX + col1W + 3 + cIdx * potColWidth;
      const py = y + 5 + rIdx * 6;
      drawCheck(px, py, potenciaDetectada === p, p);
    });

    // Coluna 3 – outros
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(60);
    doc.text('Qual?', tecX + col1W + col2W + 3, y + 4);
    doc.setDrawColor(140);
    doc.line(tecX + col1W + col2W + 3, y + tecRowH - 4, tecX + col1W + col2W + col3W - 3, y + tecRowH - 4);
    if (order.outros_tecnico) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(20);
      doc.text(String(order.outros_tecnico), tecX + col1W + col2W + 3, y + tecRowH - 5);
    }

    y += tecRowH + 4;

    addSection('Materiais Utilizados', [
      ['Produto', order.tipo_lampada ? `${order.tipo_lampada} — Qtd: 1` : 'Nenhum material registrado'],
    ]);

    addSection('Observações', [['', order.observacoes_atendimento || '—']]);

    // Assinaturas
    const sigY = Math.max(y + 12, h - 36);
    const leftX = w * 0.27;
    const rightX = w * 0.73;

    if (empresa.assinaturaUrl) {
      const sig = await loadImg(empresa.assinaturaUrl);
      if (sig) doc.addImage(sig, 'PNG', leftX - 22, sigY - 16, 44, 14);
    }

    doc.setDrawColor(60);
    doc.line(leftX - 30, sigY, leftX + 30, sigY);
    doc.line(rightX - 30, sigY, rightX + 30, sigY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text(empresa.responsavelNome || '—', leftX, sigY + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(empresa.responsavelCargo || 'Diretor', leftX, sigY + 8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text(' ', rightX, sigY + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text('Técnico Responsável', rightX, sigY + 8, { align: 'center' });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text(
      `Documento gerado pelo sistema IPPARK – ${empresa.nome} – ${new Date().toLocaleString('pt-BR')}`,
      w / 2, h - 6, { align: 'center' }
    );

    doc.save(`OS_${osNumber}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div ref={printRef} className="relative bg-white rounded-lg border shadow-sm p-6 max-w-4xl mx-auto text-sm overflow-hidden">
        {/* Marca d'água IPPARK – grande, centralizada */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={ipparkWatermark} alt="" className="w-[85%] max-w-[600px] opacity-[0.08]" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 border-b-[3px] border-[#0B2E59] pb-2 mb-3">
            <div className="w-[70px] h-[70px] flex items-center justify-center bg-white border rounded p-1 shrink-0">
              <img
                src={empresaLogo}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-[#0B2E59] tracking-[3px]">ORDEM DE SERVIÇO</h1>
              <p className="text-sm font-bold text-foreground">{empresa.nome}</p>
              <p className="text-[11px] text-muted-foreground">{localizacaoCompleta}</p>
              <p className="text-[10px] text-muted-foreground">Código de Acesso: {empresa.codigoAcesso}</p>
            </div>
            <div className="text-right min-w-[110px]">
              <div className="text-sm font-bold text-[#0B2E59]">Nº {osNumber}</div>
              <div className="text-[10px] text-muted-foreground my-0.5">Data: {dataDoc}</div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold inline-block" style={{ background: statusBg, color: statusColor }}>
                {statusLabel}
              </span>
            </div>
          </div>

          <Section title="Dados do Solicitante">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <Field label="Nome" value={order.solicitante} />
              <Field label="CPF" value={order.cpf} />
              <Field label="Rua" value={order.rua} />
              <Field label="Bairro" value={order.bairro} />
              <Field label="Localização" value={order.localizacao} />
            </div>
          </Section>

          <Section title="Dados do Atendimento">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="sm:col-span-2"><Field label="Descrição" value={order.observacoes_atendimento} /></div>
              <Field label="Código do Poste" value={order.codigo_poste} />
              <Field label="Tipo de Serviço" value={order.tipo_servico} />
              <Field label="Tipo de Lâmpada" value={order.tipo_lampada} />
              <Field label="Data da Solicitação" value={order.data_solicitacao} />
            </div>
          </Section>

          {/* === NOVA SEÇÃO: OBSERVAÇÕES DO TÉCNICO === */}
          <Section title="Observações do Técnico">
            <div className="w-[92%] mx-auto rounded-md border border-border overflow-hidden bg-white/85">
              <div className="grid grid-cols-[30%_42%_28%] text-[10px] font-bold uppercase tracking-wide text-[#0B2E59] bg-[#f3f6fb]">
                <div className="px-2 py-1.5 border-r border-border">Tipo de lâmpada</div>
                <div className="px-2 py-1.5 border-r border-border">Potência (W)</div>
                <div className="px-2 py-1.5">Outros</div>
              </div>
              <div className="grid grid-cols-[30%_42%_28%] text-[11px]">
                <div className="px-3 py-2 border-r border-border space-y-1">
                  {TIPOS_LAMPADA.map(t => (
                    <CheckRow key={t} label={t} checked={tipoDetectado === t} />
                  ))}
                </div>
                <div className="px-3 py-2 border-r border-border">
                  <div className="grid grid-cols-3 gap-y-1 gap-x-2">
                    {POTENCIAS.map(p => (
                      <CheckRow key={p} label={p} checked={potenciaDetectada === p} />
                    ))}
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="text-[10px] font-bold text-muted-foreground mb-1">Qual?</div>
                  <div className="border-b border-foreground/40 min-h-[36px] text-[11px] py-0.5">
                    {order.outros_tecnico || ''}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Materiais Utilizados">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue-50 text-[#0B2E59]">
                  <th className="text-left p-1.5 border">Produto</th>
                  <th className="text-left p-1.5 border w-24">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {order.tipo_lampada ? (
                  <tr><td className="p-1.5 border">{order.tipo_lampada}</td><td className="p-1.5 border">1</td></tr>
                ) : (
                  <tr><td colSpan={2} className="p-2 text-center text-muted-foreground border">Nenhum material registrado</td></tr>
                )}
              </tbody>
            </table>
          </Section>

          <Section title="Observações">
            <p className="min-h-[24px] bg-muted/30 p-2 rounded border border-dashed text-xs whitespace-pre-wrap">
              {order.observacoes_atendimento || '—'}
            </p>
          </Section>

          {/* Assinaturas */}
          <div className="grid grid-cols-2 gap-8 mt-6 pt-4">
            <div className="text-center">
              <div className="h-[55px] flex items-end justify-center mb-1">
                {empresa.assinaturaUrl && (
                  <img src={empresa.assinaturaUrl} alt="Assinatura" className="max-h-[55px] max-w-[200px] object-contain" />
                )}
              </div>
              <div className="border-t border-foreground/60 pt-1 mx-4">
                <p className="text-xs font-bold">{empresa.responsavelNome || '—'}</p>
                <p className="text-[10px] text-muted-foreground">{empresa.responsavelCargo || 'Diretor'}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="h-[55px]"></div>
              <div className="border-t border-foreground/60 pt-1 mx-4">
                <p className="text-xs font-bold">&nbsp;</p>
                <p className="text-[10px] text-muted-foreground">Técnico Responsável</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 pt-2 border-t">
            <p className="text-[9px] text-muted-foreground">
              Documento gerado pelo sistema IPPARK – {empresa.nome} – {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

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
    <div className="border rounded mb-2 overflow-hidden bg-white/85">
      <div className="bg-[#0B2E59] text-white px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase">{title}</div>
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

function CheckRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center w-[13px] h-[13px] border rounded-sm text-[10px] font-bold leading-none ${
          checked ? 'bg-[#0B2E59] text-white border-[#0B2E59]' : 'border-[#0B2E59] text-[#0B2E59]'
        }`}
      >
        {checked ? '✕' : ''}
      </span>
      <span className="text-[11px] text-foreground">{label}</span>
    </div>
  );
}

export default OrdemServicoPrint;
