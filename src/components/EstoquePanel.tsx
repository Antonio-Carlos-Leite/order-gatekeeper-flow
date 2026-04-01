import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Package, Plus, ArrowDown, ArrowUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Produto, Movimentacao } from '@/hooks/useEstoque';

interface EstoquePanelProps {
  produtos: Produto[];
  movimentacoes: Movimentacao[];
  produtosEstoqueBaixo: Produto[];
  onAddProduto: (nome: string, descricao: string, estoque_minimo: number) => Promise<{ error: any }>;
  onAddEntrada: (produto_id: string, quantidade: number) => Promise<{ error: any }>;
  onBack: () => void;
}

const EstoquePanel = ({ produtos, movimentacoes, produtosEstoqueBaixo, onAddProduto, onAddEntrada, onBack }: EstoquePanelProps) => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [descProduto, setDescProduto] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('5');
  const [entradaProdutoId, setEntradaProdutoId] = useState('');
  const [entradaQtd, setEntradaQtd] = useState('');
  const { toast } = useToast();

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

  const getProdutoNome = (id: string) => produtos.find(p => p.id === id)?.nome || '—';

  return (
    <div>
      <div className="max-w-6xl mx-auto">

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
        </div>

        {/* Tabela de produtos */}
        <Card className="shadow-lg border-0 bg-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {produtos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead className="text-center">Mínimo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{p.descricao || '—'}</TableCell>
                      <TableCell className="text-center font-bold">{p.quantidade_estoque}</TableCell>
                      <TableCell className="text-center">{p.estoque_minimo}</TableCell>
                      <TableCell className="text-center">
                        {p.quantidade_estoque <= p.estoque_minimo ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Baixo
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Movimentações recentes */}
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Movimentações Recentes</CardTitle>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstoquePanel;
