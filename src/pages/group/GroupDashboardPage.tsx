import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, AlertTriangle, Package, Activity, UserPlus,
  Building2, FileText, Clock, Send, Pencil, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  GROUP_INFO,
  GROUP_PAYERS,
  needsAttentionItems,
  payerPipelineData,
  recentActivityFeed,
} from '@/lib/mockData';
import { InviteProviderDialog } from '@/components/InviteProviderDialog';
import { format } from 'date-fns';

const PAYER_COLORS: Record<string, string> = {
  'Bexar County': 'bg-primary',
  Humana: 'bg-success',
  Aetna: 'bg-destructive',
};

export default function GroupDashboardPage() {
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionItem, setActionItem] = useState<typeof needsAttentionItems[0] | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [sentRequests, setSentRequests] = useState<Record<string, { time: string }>>({});

  const totalProviders = 9;
  const expiringCredentials = 3;
  const packetsThisMonth = 7;

  const handleSendNotification = () => {
    if (!actionItem) return;
    const now = new Date();
    setSentRequests(prev => ({ ...prev, [actionItem.providerId]: { time: format(now, 'MMM d, h:mm a') } }));
    toast.success(`Notification sent to ${actionItem.providerName}`, {
      description: `Re: ${actionItem.issue}`,
    });
    setActionItem(null);
    setEditMode(false);
    setRequestMessage('');
  };

  const handleCancelRequest = (providerId: string) => {
    setSentRequests(prev => { const n = { ...prev }; delete n[providerId]; return n; });
    toast.info('Request cancelled.');
  };

  const handleResend = (providerId: string, providerName: string) => {
    setSentRequests(prev => ({ ...prev, [providerId]: { time: format(new Date(), 'MMM d, h:mm a') } }));
    toast.success(`Request resent to ${providerName}.`);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Group Dashboard</h1>
          <p className="text-muted-foreground">Austin Regional Medical Group</p>
        </div>
        <Button className="btn-primary-gradient" onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Invite Provider
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover"><CardContent className="p-5"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Total Providers</p><div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div></div><p className="text-3xl font-bold">{totalProviders}</p></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-5"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Roster Compliance</p><div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-warning" /></div></div><p className="text-3xl font-bold text-warning">{GROUP_INFO.complianceScore}%</p><Progress value={GROUP_INFO.complianceScore} className="mt-2 h-1.5" /></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-5"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Expiring Credentials</p><div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div></div><div className="flex items-center gap-2"><p className="text-3xl font-bold text-destructive">{expiringCredentials}</p><Badge variant="destructive" className="text-xs">Urgent</Badge></div></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-5"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Packets This Month</p><div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center"><Package className="h-5 w-5 text-success" /></div></div><p className="text-3xl font-bold">{packetsThisMonth}</p></CardContent></Card>
      </div>

      {/* Needs Attention */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Needs Attention
            <Badge variant="destructive">{needsAttentionItems.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {needsAttentionItems.map(item => {
            const sent = sentRequests[item.providerId];
            return (
              <div key={item.providerId} className="p-4 rounded-lg bg-destructive/5 border border-destructive/15">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm">{item.providerName}</p>
                  <Badge variant={item.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs flex-shrink-0">{item.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.issue}</p>
                {item.daysUntilImpact !== undefined && item.daysUntilImpact > 0 && (
                  <p className="text-xs font-medium text-destructive mb-2">⏱ {item.daysUntilImpact} days remaining</p>
                )}
                {sent ? (
                  <div className="space-y-1">
                    <p className="text-xs text-success font-medium">✓ Document Requested — Pending</p>
                    <p className="text-[10px] text-muted-foreground">Sent {sent.time}</p>
                    <div className="flex gap-2 mt-1">
                      <button className="text-[10px] text-muted-foreground underline hover:text-foreground" onClick={() => handleCancelRequest(item.providerId)}>Cancel Request</button>
                      <button className="text-[10px] text-muted-foreground underline hover:text-foreground" onClick={() => handleResend(item.providerId, item.providerName)}>Resend</button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setActionItem(item); setRequestMessage(`Re: ${item.issue}`); }}>
                    {item.actionType}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-hover">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5" /> Payer Pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(payerPipelineData).map(([payer, data]) => {
              const total = 9;
              const credentialedPct = (data.credentialed.length / total) * 100;
              return (
                <div key={payer} className="p-3 rounded-lg bg-muted/40 hover:bg-muted/70 cursor-pointer transition-colors" onClick={() => navigate('/group/payer-workflows')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{payer}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="text-success font-medium">{data.credentialed.length} credentialed</span>
                      <span className="text-primary">{data.inProgress.length} in progress</span>
                      <span>{data.notStarted.length} not started</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', PAYER_COLORS[payer] || 'bg-primary')} style={{ width: `${credentialedPct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5" /> Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivityFeed.map(item => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {item.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionItem} onOpenChange={open => { if (!open) { setActionItem(null); setEditMode(false); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{actionItem?.actionType}</DialogTitle></DialogHeader>
          {actionItem && (
            <div className="space-y-4 pt-1">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium">{actionItem.providerName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{actionItem.issue}</p>
                <Badge variant={actionItem.priority === 'High' ? 'destructive' : 'secondary'} className="mt-1.5">{actionItem.priority} Priority</Badge>
              </div>
              {editMode ? (
                <div className="space-y-2">
                  <Label>Edit Request Message</Label>
                  <Textarea rows={4} value={requestMessage} onChange={e => setRequestMessage(e.target.value)} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{requestMessage}</p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> {editMode ? 'Done Editing' : 'Edit Request'}
            </Button>
            <Button className="btn-primary-gradient" onClick={handleSendNotification}>
              <Send className="mr-1.5 h-4 w-4" /> Send Notification to Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteProviderDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
