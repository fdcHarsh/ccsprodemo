import { useNavigate } from 'react-router-dom';
import { Bell, Users, ShieldAlert, FileText, Package, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Notification } from '@/lib/mockData';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useState } from 'react';

const typeIcon = (type: Notification['type']) => {
  if (type === 'group') return <Users className="h-4 w-4" />;
  if (type === 'caqh') return <ShieldAlert className="h-4 w-4" />;
  if (type === 'document') return <FileText className="h-4 w-4" />;
  return <Package className="h-4 w-4" />;
};

const typeColor = (type: Notification['type']) => {
  if (type === 'group') return 'bg-primary/10 text-primary';
  if (type === 'caqh') return 'bg-warning/10 text-warning';
  if (type === 'document') return 'bg-accent/10 text-accent';
  return 'bg-success/10 text-success';
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, deleteNotification, deleteAllNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'groups') return n.type === 'group';
    if (activeTab === 'documents') return n.type === 'document';
    if (activeTab === 'caqh') return n.type === 'caqh';
    return true;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="mr-1.5 h-4 w-4" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={deleteAllNotifications}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete All
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">{notifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-4 px-1 text-xs">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="caqh">CAQH</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No notifications in this category.</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border bg-card transition-colors',
                !notif.read && 'border-primary/20 bg-primary/3',
                notif.read && 'border-border',
              )}
            >
              <div className={cn('h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0', typeColor(notif.type))}>
                {typeIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cn('text-sm font-medium', !notif.read && 'text-foreground font-semibold')}>
                      {notif.title}
                      {!notif.read && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary align-middle" />
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.timeAgo}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {notif.actionLabel && notif.actionRoute && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(notif.actionRoute!)}
                      >
                        {notif.actionLabel}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNotification(notif.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
