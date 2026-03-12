import { Outlet } from 'react-router-dom';
import { GroupSidebar } from './GroupSidebar';
import { GroupTopNav } from './GroupTopNav';
import { useUI } from '@/contexts/UIContext';
import { cn } from '@/lib/utils';

export function GroupDashboardLayout() {
  const { sidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-background">
      <GroupSidebar />
      <GroupTopNav />
      <main className={cn(
        'pt-16 min-h-screen transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-20'
      )}>
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
