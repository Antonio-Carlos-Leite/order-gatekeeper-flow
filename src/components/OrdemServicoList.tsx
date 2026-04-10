import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, FileText, ClipboardCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import OrdemServicoPrint from './OrdemServicoPrint';

interface OrdemServicoListProps {
  orders: any[];
  municipio: string;
  userType: string;
  onUpdateStatus?: (orderId: string, status: string) => Promise<any>;
}

const OrdemServicoList = ({ orders, municipio, userType, onUpdateStatus }: OrdemServicoListProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !search ||
        (o.solicitante || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.codigo_poste || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.tipo_servico || '').toLowerCase().includes(search.toLowerCase()) ||
        String(o.id).toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(() => ({
    total: orders.length,
    pendente: orders.filter(o => o.status === 'aguardando_aprovacao' || o.status === 'rascunho').length,
    aprovado: orders.filter(o => o.status === 'aprovado').length,
    executado: orders.filter(o => o.status === 'executado').length,
    rejeitado: orders.filter(o => o.status === 'rejeitado').length,
  }), [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle className="w-3 h-3" />Aprovado</Badge>;
      case 'executado':
        return <Badge className="bg-blue-100 text-blue-800 gap-1"><ClipboardCheck className="w-3 h-3" />Executado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800 gap-1"><XCircle className="w-3 h-3" />Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 gap-1"><Clock className="w-3 h-3" />Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={counts.total} color="text-foreground" />
        <StatCard label="Pendentes" value={counts.pendente} color="text-yellow-700" />
        <StatCard label="Aprovados" value={counts.aprovado} color="text-green-700" />
        <StatCard label="Executados" value={counts.executado} color="text-blue-700" />
        <StatCard label="Rejeitados" value={counts.rejeitado} color="text-red-700" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por solicitante, poste, serviço..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/80" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white/80"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="aguardando_aprovacao">Pendente</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="executado">Executado</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" /> Ordens de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Nenhuma ordem de serviço encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº O.S.</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Tipo de Serviço</TableHead>
                    <TableHead>Cód. Poste</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{String(order.id).slice(-6).toUpperCase()}</TableCell>
                      <TableCell>{order.solicitante || '—'}</TableCell>
                      <TableCell>{order.tipo_servico || '—'}</TableCell>
                      <TableCell>{order.codigo_poste || '—'}</TableCell>
                      <TableCell className="text-xs">{order.data_solicitacao || new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)} title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {userType === 'diretor' && order.status === 'aprovado' && onUpdateStatus && (
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => onUpdateStatus(order.id, 'executado')}>
                              <ClipboardCheck className="w-3 h-3" /> Executar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Ordem de Serviço</DialogTitle>
          {selectedOrder && (
            <OrdemServicoPrint order={selectedOrder} municipio={municipio} onClose={() => setSelectedOrder(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="px-4 py-2 border-0 shadow-sm bg-white/80">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}

export default OrdemServicoList;
