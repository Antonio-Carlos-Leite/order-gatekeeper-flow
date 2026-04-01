import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, FileText, CheckCircle, ClipboardList, Package, AlertTriangle, PlusCircle } from 'lucide-react';

type Page = 'order' | 'meus-pedidos' | 'approval' | 'approved' | 'estoque';

interface AppHeaderProps {
  userInfo: {
    displayName: string;
    username: string;
    userType: 'funcionario' | 'diretor';
    municipio: string;
    codigoAcesso: string;
  };
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  pendingCount?: number;
  lowStockCount?: number;
}

const AppHeader = ({ userInfo, currentPage, onNavigate, onLogout, pendingCount = 0, lowStockCount = 0 }: AppHeaderProps) => {
  const isFuncionario = userInfo.userType === 'funcionario';
  const isDiretor = userInfo.userType === 'diretor';

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              IPPARK - {userInfo.municipio}
            </h1>
            <p className="text-sm text-muted-foreground">
              {userInfo.displayName} · {isDiretor ? 'Diretor' : 'Funcionário'} · Código: {userInfo.codigoAcesso}
            </p>
          </div>
          <Button variant="outline" onClick={onLogout} size="sm" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-1">
          {isFuncionario && (
            <>
              <NavButton active={currentPage === 'order'} onClick={() => onNavigate('order')} icon={<PlusCircle className="w-4 h-4" />} label="Novo Pedido" />
              <NavButton active={currentPage === 'meus-pedidos'} onClick={() => onNavigate('meus-pedidos')} icon={<ClipboardList className="w-4 h-4" />} label="Meus Pedidos" />
              <NavButton active={currentPage === 'approved'} onClick={() => onNavigate('approved')} icon={<CheckCircle className="w-4 h-4" />} label="Processados" />
            </>
          )}
          {isDiretor && (
            <>
              <NavButton active={currentPage === 'approval'} onClick={() => onNavigate('approval')} icon={<FileText className="w-4 h-4" />} label="Pendentes" badge={pendingCount > 0 ? pendingCount : undefined} />
              <NavButton active={currentPage === 'approved'} onClick={() => onNavigate('approved')} icon={<CheckCircle className="w-4 h-4" />} label="Processados" />
              <NavButton active={currentPage === 'estoque'} onClick={() => onNavigate('estoque')} icon={<Package className="w-4 h-4" />} label="Estoque" badge={lowStockCount > 0 ? lowStockCount : undefined} badgeVariant="destructive" />
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

function NavButton({ active, onClick, icon, label, badge, badgeVariant }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  badgeVariant?: 'default' | 'destructive';
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2 relative whitespace-nowrap"
    >
      {icon}
      {label}
      {badge !== undefined && (
        <Badge variant={badgeVariant || 'secondary'} className="ml-1 text-xs px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </Button>
  );
}

export default AppHeader;
