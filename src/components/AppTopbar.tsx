import { Bell, Building2, KeyRound } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface AppTopbarProps {
  empresaNome: string;
  cidade?: string;
  estado?: string;
  codigoAcesso: string;
  logoUrl?: string;
  displayName: string;
  userType: 'funcionario' | 'diretor' | 'estoque';
}

const roleLabel = (t: AppTopbarProps['userType']) =>
  t === 'diretor' ? 'Diretor / Gestor' : t === 'estoque' ? 'Estoque' : 'Funcionário';

const AppTopbar = ({
  empresaNome,
  cidade,
  estado,
  codigoAcesso,
  logoUrl,
  displayName,
  userType,
}: AppTopbarProps) => {
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'U';

  const localizacao = [cidade, estado].filter(Boolean).join(' - ');

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur-md border-b shadow-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <SidebarTrigger className="md:hidden" />

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center shrink-0 overflow-hidden border">
            {logoUrl ? (
              <img src={logoUrl} alt={empresaNome} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground truncate text-sm md:text-base leading-tight">
              {empresaNome || 'Prefeitura'}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {localizacao && <span className="truncate">{localizacao}</span>}
              {localizacao && <span className="opacity-40">•</span>}
              <span className="inline-flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> {codigoAcesso}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-smooth"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="hidden sm:block h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block leading-tight">
            <div className="text-sm font-medium text-foreground">{displayName}</div>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">
              {roleLabel(userType)}
            </Badge>
          </div>
          <Avatar className="w-9 h-9 ring-2 ring-primary/15">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-primary text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default AppTopbar;
