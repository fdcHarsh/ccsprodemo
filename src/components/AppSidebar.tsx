import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  ClipboardList,
  UserCircle,
  Package,
  ShieldCheck,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Bell,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { SidebarNavLink } from './SidebarNavLink';
import { Button } from './ui/button';
import ccsLogo from '@/assets/ccs-logo.png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FolderOpen, label: 'Document Vault' },
  { to: '/credentials', icon: ClipboardList, label: 'Credential Tracker' },
  { to: '/calendar', icon: CalendarDays, label: 'Expiration Calendar' },
  { to: '/my-groups', icon: Users, label: 'My Groups' },
  { to: '/notifications', icon: Bell, label: 'Notifications', hasBadge: true },
  { to: '/profile', icon: UserCircle, label: 'Profile Builder' },
  { to: '/packet', icon: Package, label: 'Create Packet' },
  { to: '/packet-history', icon: History, label: 'Packet History' },
  { to: '/caqh', icon: ShieldCheck, label: 'CAQH Manager' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useUI();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-20',
        'bg-sidebar',
        className
      )}
    >
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
                  <span className="text-[10px] text-sidebar-foreground/70 leading-tight">Credentialing Services</span>
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
            <div key={item.to} className="relative">
              <SidebarNavLink
                to={item.to}
                icon={item.icon}
                collapsed={!sidebarOpen}
              >
                {item.label}
              </SidebarNavLink>
              {item.hasBadge && unreadCount > 0 && (
                <span className={cn(
                  'absolute top-1.5 flex items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold leading-none',
                  sidebarOpen ? 'right-3 h-4 min-w-4 px-1' : 'right-2 h-4 w-4'
                )}>
                  {unreadCount}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3">
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
