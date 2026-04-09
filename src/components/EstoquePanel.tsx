import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, ArrowDown, ArrowUp, AlertTriangle, Search, Edit, Trash2, Download, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Produto, Movimentacao } from '@/hooks/useEstoque';

interface EstoquePanelProps {
  produtos: Produto[];
  movimentacoes: Movimentacao[];
  produtosEstoqueBaixo: Produto[];
  onAddProduto: (nome: string, descricao: string, estoque_minimo: number) => Promise<{ error: any }>;
  onEditProduto?: (id: string, nome: string, descricao: string, estoque_minimo: number) => Promise<{ error: any }>;
  onDeleteProduto?: (id: string) => Promise<{ error: any }>;
  onAddEntrada: (produto_id: string, quantidade: number) => Promise<{ error: any }>;
  onAddSaida: (produto_id: string, quantidade: number) => Promise<{ error: any }>;
  onBack: () => void;
  userType?: string;
}

const EstoquePanel = ({ produtos, movimentacoes, produtosEstoqueBaixo, onAddProduto, onEditProduto, onDeleteProduto, onAddEntrada, onAddSaida, userType }: EstoquePanelProps) => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [descProduto, setDescProduto] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('5');
  const [entradaProdutoId, setEntradaProdutoId] = useState('');
  const [entradaQtd, setEntradaQtd] = useState('');
  const [saidaProdutoId, setSaidaProdutoId] = useState('');
  const [saidaQtd, setSaidaQtd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMinimo, setEditMinimo] = useState('');
  const { toast } = useToast();

  const isDiretor = userType === 'diretor';

  // Summary stats
  const today = new Date().toISOString().split('T')[0];
  const entradasHoje = movimentacoes.filter(m => m.tipo === 'entrada' && m.created_at.startsWith(today));
  const saidasHoje = movimentacoes.filter(m => m.tipo === 'saida' && m.created_at.startsWith(today));
  const totalEntradasHoje = entradasHoje.reduce((sum, m) => sum + m.quantidade, 0);
  const totalSaidasHoje = saidasHoje.reduce((sum, m) => sum + m.quantidade, 0);

  const filteredProdutos = useMemo(() =>
    produtos.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase())),
    [produtos, searchTerm]
  );

  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeProduto) return;
    const { error } = await onAddProduto(nomeProduto, descProduto, parseInt(estoqueMinimo) || 5);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produto cadastrado!", description: `${nomeProduto} adicionado ao estoque.` });
      setNomeProduto('');
      setDescProduto('');
      setEstoqueMinimo('5');
    }
  };

  const handleAddEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entradaProdutoId || !entradaQtd) return;
    const { error } = await onAddEntrada(entradaProdutoId, parseInt(entradaQtd));
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Entrada registrada!", description: `${entradaQtd} unidades adicionadas.` });
      setEntradaProdutoId('');
      setEntradaQtd('');
    }
  };

  const handleAddSaida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saidaProdutoId || !saidaQtd) return;
    const { error } = await onAddSaida(saidaProdutoId, parseInt(saidaQtd));
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saída registrada!", description: `${saidaQtd} unidades removidas.` });
      setSaidaProdutoId('');
      setSaidaQtd('');
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !onEditProduto) return;
    const { error } = await onEditProduto(editingProduct.id, editNome, editDesc, parseInt(editMinimo) || 5);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produto atualizado!" });
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id: string, nome: string) => {
    if (!onDeleteProduto) return;
    const { error } = await onDeleteProduto(id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produto removido!", description: `${nome} foi removido do estoque.` });
    }
  };

  const openEditDialog = (p: Produto) => {
    setEditingProduct(p);
    setEditNome(p.nome);
    setEditDesc(p.descricao || '');
    setEditMinimo(String(p.estoque_minimo));
  };

  const getProdutoNome = (id: string) => produtos.find(p => p.id === id)?.nome || '—';

  // Chart data: movimentações dos últimos 6 meses
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; entradas: number; saidas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push({ key, label, entradas: 0, saidas: 0 });
    }
    movimentacoes.forEach(m => {
      const mKey = m.created_at.substring(0, 7);
      const month = months.find(mo => mo.key === mKey);
      if (month) {
        if (m.tipo === 'entrada') month.entradas += m.quantidade;
        else month.saidas += m.quantidade;
      }
    });
    return months;
  }, [movimentacoes]);

  // Backup functions
  const exportEstoquePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Estoque', 105, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 24);

    (doc as any).autoTable({
      startY: 30,
      head: [['Produto', 'Descrição', 'Estoque', 'Mínimo', 'Status']],
      body: produtos.map(p => [
        p.nome,
        p.descricao || '—',
        p.quantidade_estoque,
        p.estoque_minimo,
        p.quantidade_estoque <= p.estoque_minimo ? 'Baixo' : 'OK',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    doc.save('estoque.pdf');
  };

  const exportMovimentacoesPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Movimentações de Estoque', 105, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 24);

    (doc as any).autoTable({
      startY: 30,
      head: [['Data', 'Produto', 'Tipo', 'Quantidade', 'Origem', 'Usuário']],
      body: movimentacoes.map(m => [
        new Date(m.created_at).toLocaleString('pt-BR'),
        getProdutoNome(m.produto_id),
        m.tipo === 'entrada' ? 'Entrada' : 'Saída',
        m.quantidade,
        m.origem,
        m.usuario_nome || '—',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    doc.save('movimentacoes_estoque.pdf');
  };

  const exportEstoqueExcel = () => {
    const wsData = [
      ['Produto', 'Descrição', 'Estoque', 'Mínimo', 'Status'],
      ...produtos.map(p => [p.nome, p.descricao || '', p.quantidade_estoque, p.estoque_minimo, p.quantidade_estoque <= p.estoque_minimo ? 'Baixo' : 'OK']),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
    XLSX.writeFile(wb, 'estoque.xlsx');
  };

  const exportMovimentacoesExcel = () => {
    const wsData = [
      ['Data', 'Produto', 'Tipo', 'Quantidade', 'Origem', 'Usuário'],
      ...movimentacoes.map(m => [
        new Date(m.created_at).toLocaleString('pt-BR'),
        getProdutoNome(m.produto_id),
        m.tipo === 'entrada' ? 'Entrada' : 'Saída',
        m.quantidade,
        m.origem,
        m.usuario_nome || '—',
      ]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Movimentações');
    XLSX.writeFile(wb, 'movimentacoes_estoque.xlsx');
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-md border-0 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtos</p>
                <p className="text-2xl font-bold">{produtos.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entradas Hoje</p>
                <p className="text-2xl font-bold">{totalEntradasHoje}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saídas Hoje</p>
                <p className="text-2xl font-bold">{totalSaidasHoje}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">{produtosEstoqueBaixo.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de estoque baixo */}
        {produtosEstoqueBaixo.length > 0 && (
          <Card className="mb-6 border-orange-300 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Estoque Baixo ({produtosEstoqueBaixo.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {produtosEstoqueBaixo.map(p => (
                  <Badge key={p.id} variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                    {p.nome}: {p.quantidade_estoque}/{p.estoque_minimo}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Cadastrar produto */}
          <Card className="shadow-lg border-0 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5" />
                Cadastrar Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduto} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Produto</Label>
                  <Input placeholder="Ex: Lâmpada LED 100W" value={nomeProduto} onChange={e => setNomeProduto(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input placeholder="Descrição opcional" value={descProduto} onChange={e => setDescProduto(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <Input type="number" min="0" value={estoqueMinimo} onChange={e => setEstoqueMinimo(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registrar entrada */}
          <Card className="shadow-lg border-0 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowDown className="w-5 h-5" />
                Registrar Entrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEntrada} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select value={entradaProdutoId} onValueChange={setEntradaProdutoId}>
                    <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                    <SelectContent>
                      {produtos.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome} (atual: {p.quantidade_estoque})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" min="1" placeholder="Quantidade" value={entradaQtd} onChange={e => setEntradaQtd(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Registrar Entrada
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registrar saída manual */}
          <Card className="shadow-lg border-0 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowUp className="w-5 h-5" />
                Registrar Saída
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSaida} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select value={saidaProdutoId} onValueChange={setSaidaProdutoId}>
                    <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                    <SelectContent>
                      {produtos.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome} (atual: {p.quantidade_estoque})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" min="1" placeholder="Quantidade" value={saidaQtd} onChange={e => setSaidaQtd(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Registrar Saída
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de produtos */}
        <Card className="shadow-lg border-0 bg-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos em Estoque
              </CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProdutos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead className="text-center">Mínimo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{p.descricao || '—'}</TableCell>
                      <TableCell className="text-center font-bold">{p.quantidade_estoque}</TableCell>
                      <TableCell className="text-center">{p.estoque_minimo}</TableCell>
                      <TableCell className="text-center">
                        {p.quantidade_estoque <= p.estoque_minimo ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Estoque Baixo
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(p)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteProduct(p.id, p.nome)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Produto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={editNome} onChange={e => setEditNome(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <Input type="number" min="0" value={editMinimo} onChange={e => setEditMinimo(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                  <Button onClick={handleEditProduct}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Movimentações recentes */}
        <Card className="shadow-lg border-0 bg-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Movimentações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {movimentacoes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhuma movimentação registrada</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{new Date(m.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{getProdutoNome(m.produto_id)}</TableCell>
                      <TableCell className="text-center">
                        {m.tipo === 'entrada' ? (
                          <Badge className="bg-green-100 text-green-800"><ArrowDown className="w-3 h-3 mr-1" />Entrada</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800"><ArrowUp className="w-3 h-3 mr-1" />Saída</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold">{m.quantidade}</TableCell>
                      <TableCell className="capitalize">{m.origem}</TableCell>
                      <TableCell>{m.usuario_nome || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Backup - apenas diretores */}
        {isDiretor && (
          <Card className="shadow-lg border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5" />
                Backup do Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={exportBackupJSON} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar JSON
                </Button>
                <Button variant="outline" onClick={exportBackupCSV} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
                <Button variant="outline" onClick={exportBackupExcel} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EstoquePanel;
