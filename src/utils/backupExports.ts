import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface OrderData {
  id: number;
  tipoServico?: string;
  fornecedor?: string;
  status: string;
  solicitante?: string;
  enviadoPor?: string;
  codigoDoPoste?: string;
  quantidade?: string;
  tipoLampada?: string;
  observações?: string;
  comments?: string;
  dataEnvio?: string;
  approvedAt?: string;
  produto?: string;
  municipio?: string;
}

const getStatusLabel = (status: string) => {
  if (status === 'approved') return 'Aprovado';
  if (status === 'rejected') return 'Reprovado';
  return 'Pendente';
};

const mapOrder = (order: OrderData) => ({
  pedido: `#${String(order.id).slice(-6).padStart(6, '0')}`,
  status: getStatusLabel(order.status),
  solicitante: order.solicitante || '—',
  enviadoPor: order.enviadoPor || '—',
  codigoDoPoste: order.codigoDoPoste ?? order.quantidade ?? '—',
  tipoServico: order.tipoServico || order.fornecedor || '—',
  tipoLampada: order.tipoLampada || '—',
  observacoes: order.observações || '—',
  observacoesTecnico: order.comments || '—',
  dataSolicitacao: order.dataEnvio || '—',
  dataAprovacao: order.approvedAt || '—',
});

export const exportJSON = (allOrders: OrderData[], approvedOrders: OrderData[], username: string) => {
  const backupData = {
    approvedOrders,
    allOrders,
    generatedAt: new Date().toLocaleString('pt-BR'),
    user: username,
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-ippark-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportPDF = (orders: OrderData[]) => {
  const doc = new jsPDF();
  const mapped = orders.map(mapOrder);
  const now = new Date().toLocaleString('pt-BR');

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Pedidos - IPPark', 105, 20, { align: 'center' });

  // Subtitle info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data do backup: ${now}`, 14, 32);
  doc.text(`Total de pedidos: ${mapped.length}`, 14, 38);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 42, 196, 42);

  let yPos = 50;

  mapped.forEach((order, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(12, yPos - 4, 186, 56, 3, 3, 'FD');

    // Status badge color
    const isApproved = order.status === 'Aprovado';
    const isRejected = order.status === 'Reprovado';

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Pedido ${order.pedido}`, 16, yPos + 4);

    // Status badge
    if (isApproved) {
      doc.setFillColor(220, 252, 231);
      doc.setTextColor(22, 101, 52);
    } else if (isRejected) {
      doc.setFillColor(254, 202, 202);
      doc.setTextColor(153, 27, 27);
    } else {
      doc.setFillColor(254, 243, 199);
      doc.setTextColor(133, 77, 14);
    }
    const statusWidth = doc.getTextWidth(order.status) + 8;
    doc.roundedRect(170, yPos - 2, statusWidth, 7, 2, 2, 'F');
    doc.setFontSize(8);
    doc.text(order.status, 174, yPos + 3);

    // Fields
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const fields = [
      [`Solicitante: ${order.solicitante}`, `Enviado por: ${order.enviadoPor}`],
      [`Código do Poste: ${order.codigoDoPoste}`, `Tipo de Serviço: ${order.tipoServico}`],
      [`Tipo de Lâmpada: ${order.tipoLampada}`, `Solicitado em: ${order.dataSolicitacao}`],
      [`Obs. Atendimento: ${order.observacoes}`, `Aprovado em: ${order.dataAprovacao}`],
      [`Obs. Técnico/Gestor: ${order.observacoesTecnico}`, ''],
    ];

    fields.forEach((pair, i) => {
      const lineY = yPos + 11 + i * 7;
      doc.text(pair[0].substring(0, 55), 16, lineY);
      if (pair[1]) doc.text(pair[1].substring(0, 55), 110, lineY);
    });

    yPos += 64;
  });

  doc.save(`relatorio-ippark-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportExcel = (orders: OrderData[]) => {
  const mapped = orders.map(mapOrder);

  const wsData = [
    ['Pedido', 'Status', 'Solicitante', 'Enviado Por', 'Código do Poste', 'Tipo de Serviço', 'Tipo de Lâmpada', 'Observações', 'Obs. Técnico/Gestor', 'Data de Solicitação', 'Data de Aprovação'],
    ...mapped.map(o => [
      o.pedido, o.status, o.solicitante, o.enviadoPor, o.codigoDoPoste,
      o.tipoServico, o.tipoLampada, o.observacoes, o.observacoesTecnico,
      o.dataSolicitacao, o.dataAprovacao,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 16 },
    { wch: 20 }, { wch: 16 }, { wch: 30 }, { wch: 30 }, { wch: 18 }, { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
  XLSX.writeFile(wb, `backup-ippark-${new Date().toISOString().split('T')[0]}.xlsx`);
};
