import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

interface MeusPedidosProps {
  pedidos: any[];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: 'Aguardando', icon: <Clock className="w-3 h-3" />, className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Aprovado', icon: <CheckCircle className="w-3 h-3" />, className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeitado', icon: <XCircle className="w-3 h-3" />, className: 'bg-red-100 text-red-800' },
};

const MeusPedidos = ({ pedidos }: MeusPedidosProps) => {
  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Meus Pedidos ({pedidos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pedidos.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Nenhum pedido enviado ainda</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Código Poste</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Comentários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((order) => {
                const cfg = statusConfig[order.status] || statusConfig.pending;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm whitespace-nowrap">{order.dataEnvio}</TableCell>
                    <TableCell className="font-medium">{order.tipoServico || order.produto || '—'}</TableCell>
                    <TableCell>{order.solicitante || '—'}</TableCell>
                    <TableCell>{order.codigoDoPoste || '—'}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${cfg.className} flex items-center gap-1 w-fit mx-auto`}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {order.comments || '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MeusPedidos;
