import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Shield,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { SidebarNavLink } from './SidebarNavLink';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import ccsLogo from '@/assets/ccs-logo.png';

const navItems = [
  { to: '/group/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/group/providers', icon: Users, label: 'Provider Roster' },
  { to: '/group/payer-workflows', icon: Briefcase, label: 'Payer Workflows' },
  { to: '/group/compliance', icon: Shield, label: 'Compliance' },
  { to: '/group/packets', icon: FileText, label: 'Packet Generation' },
  { to: '/group/packet-history', icon: History, label: 'Packet History' },
  { to: '/group/settings', icon: Settings, label: 'Settings' },
];

export function GroupSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-sidebar',
      sidebarOpen ? 'w-64' : 'w-20',
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1">
                  <img src={ccsLogo} alt="CCS Pro" className="h-7 w-auto object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-sidebar-foreground leading-tight">CCS Pro</span>
                  <span className="text-[10px] text-sidebar-foreground/70 leading-tight">Group Admin</span>
                </div>
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1">
                <img src={ccsLogo} alt="CCS Pro" className="h-6 w-auto object-contain" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {navItems.map((item) => (
            <SidebarNavLink key={item.to} to={item.to} icon={item.icon} collapsed={!sidebarOpen}>
              {item.label}
            </SidebarNavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/40">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">MG</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">Maria Gonzalez</p>
                <p className="text-[10px] text-sidebar-foreground/70 truncate">Austin Regional Medical Group</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'nav-link nav-link-inactive w-full text-left',
              'hover:bg-destructive/20 hover:text-destructive'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
