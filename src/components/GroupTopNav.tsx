import { Bell, Moon, Sun, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { needsAttentionItems } from '@/lib/mockData';

const UNREAD_COUNT = needsAttentionItems.length; // 5

export function GroupTopNav() {
  const { user, logout } = useAuth();
  const { sidebarOpen } = useUI();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
    setIsDark(shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    document.documentElement.classList.toggle('dark', newIsDark);
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const top3 = needsAttentionItems.slice(0, 3);

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-20'}`}>
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Austin Regional Medical Group</h2>
          <p className="text-sm text-muted-foreground">Group Admin Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Bell with dropdown showing top 3 needs-attention items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {UNREAD_COUNT > 0 && (
                  <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {UNREAD_COUNT}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Needs Attention</span>
                <Badge variant="destructive" className="text-xs">{UNREAD_COUNT} items</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {top3.map(item => (
                <DropdownMenuItem key={item.providerId} className="flex flex-col items-start gap-1 py-3 cursor-pointer" onClick={() => navigate('/group/compliance')}>
                  <span className="font-medium text-sm">{item.providerName}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{item.issue}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/group/compliance')} className="text-primary font-medium flex items-center justify-between">
                View all {UNREAD_COUNT} issues
                <ChevronRight className="h-3.5 w-3.5" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-bold">MG</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block font-medium">{user?.name || 'Maria Gonzalez'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Group Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/group/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
