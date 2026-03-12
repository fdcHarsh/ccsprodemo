import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  collapsed?: boolean;
  onClick?: () => void;
}

export function SidebarNavLink({ to, icon: Icon, children, collapsed, onClick }: SidebarNavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={cn(
        'nav-link group relative',
        isActive ? 'nav-link-active' : 'nav-link-inactive'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
      {!collapsed && (
        <span className="truncate">{children}</span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
          {children}
        </div>
      )}
    </RouterNavLink>
  );
}
