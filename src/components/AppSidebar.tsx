import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Lightbulb,
  CheckCircle,
  PlusCircle,
  FileText,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

export type Page =
  | 'dashboard'
  | 'order'
  | 'meus-pedidos'
  | 'approval'
  | 'approved'
  | 'estoque'
  | 'ordem-servico'
  | 'os-list'
  | 'empresa-config';

interface AppSidebarProps {
  userType: 'funcionario' | 'diretor' | 'estoque';
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  pendingCount?: number;
  lowStockCount?: number;
}

interface MenuItem {
  page: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: 'default' | 'destructive';
}

const AppSidebar = ({
  userType,
  currentPage,
  onNavigate,
  onLogout,
  pendingCount = 0,
  lowStockCount = 0,
}: AppSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const menuByRole: Record<typeof userType, { label: string; items: MenuItem[] }[]> = {
    funcionario: [
      {
        label: 'Operação',
        items: [
          { page: 'order', label: 'Novo Pedido', icon: PlusCircle },
          { page: 'meus-pedidos', label: 'Meus Pedidos', icon: ClipboardList },
          { page: 'approved', label: 'Processados', icon: CheckCircle },
        ],
      },
    ],
    diretor: [
      {
        label: 'Gestão',
        items: [
          { page: 'approval', label: 'Pedidos', icon: FileText, badge: pendingCount, badgeVariant: 'destructive' },
          { page: 'approved', label: 'Processados', icon: CheckCircle },
          { page: 'ordem-servico', label: 'Nova O.S.', icon: Wrench },
          { page: 'os-list', label: 'Ordens de Serviço', icon: ClipboardList },
        ],
      },
      {
        label: 'Recursos',
        items: [
          { page: 'estoque', label: 'Estoque', icon: Package, badge: lowStockCount, badgeVariant: 'destructive' },
          { page: 'empresa-config', label: 'Configurações', icon: Settings },
        ],
      },
    ],
    estoque: [
      {
        label: 'Estoque',
        items: [
          { page: 'estoque', label: 'Estoque', icon: Package, badge: lowStockCount, badgeVariant: 'destructive' },
        ],
      },
    ],
  };

  const groups = menuByRole[userType];

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-sidebar-border"
    >
      <div className="flex flex-col h-full bg-gradient-sidebar text-sidebar-foreground">
        <SidebarHeader className="px-4 py-5 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant shrink-0">
              <Lightbulb className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-base font-bold tracking-wide text-white">IPPark</div>
                <div className="text-[10.5px] text-sidebar-foreground/70">Iluminação Pública</div>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4 flex-1">
          {groups.map((group) => (
            <SidebarGroup key={group.label}>
              {!collapsed && (
                <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-3">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = currentPage === item.page;
                    return (
                      <SidebarMenuItem key={item.page}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className={`group rounded-lg h-10 px-3 transition-smooth
                            ${active
                              ? 'bg-sidebar-primary/95 text-white shadow-elegant hover:bg-sidebar-primary'
                              : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-white'
                            }`}
                        >
                          <button onClick={() => onNavigate(item.page)} className="w-full flex items-center gap-3">
                            <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-white'}`} />
                            {!collapsed && (
                              <>
                                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                  <Badge
                                    variant={item.badgeVariant === 'destructive' ? 'destructive' : 'secondary'}
                                    className="h-5 px-1.5 text-[10px] font-bold"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/50 p-3 relative">
          {!collapsed && (
            <div className="absolute -top-12 right-3 opacity-[0.08] pointer-events-none">
              <Lightbulb className="w-24 h-24 text-white" />
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                tooltip="Sair"
                className="rounded-lg h-10 px-3 text-sidebar-foreground/85 hover:bg-destructive/15 hover:text-destructive-foreground transition-smooth"
              >
                <LogOut className="w-[18px] h-[18px]" />
                {!collapsed && <span className="text-sm font-medium">Sair</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {!collapsed && (
            <div className="text-center mt-3 text-[10px] text-sidebar-foreground/40">
              IPPARK © {new Date().getFullYear()}
            </div>
          )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
