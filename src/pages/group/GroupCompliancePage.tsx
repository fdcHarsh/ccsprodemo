import { useState } from 'react';
import { AlertTriangle, ShieldCheck, Send, Mail, Bell as BellIcon, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import { GROUP_INFO, complianceIssues, documentCollectionRequests, expiryTimelineEvents, rosterProviders } from '@/lib/mockData';
import { EmptyState } from '@/components/EmptyState';

function computeDonut() {
  let fullyCompliant = 0;
  let attentionNeeded = 0;
  let actionRequired = 0;
  for (const p of rosterProviders) {
    const allCurrent = p.licenseStatus === 'current' && p.malpracticeStatus === 'current' && p.caqhStatus === 'Active';
    if (allCurrent && p.profileCompletion >= 90) fullyCompliant++;
    else if (p.licenseStatus === 'urgent' || p.malpracticeStatus === 'urgent' || p.caqhStatus === 'Inactive' || p.profileCompletion < 70) actionRequired++;
    else attentionNeeded++;
  }
  return [
    { name: 'Fully Compliant', value: fullyCompliant, color: 'hsl(var(--success))' },
    { name: 'Attention Needed', value: attentionNeeded, color: 'hsl(var(--warning))' },
    { name: 'Action Required', value: actionRequired, color: 'hsl(var(--destructive))' },
  ];
}
const donutData = computeDonut();

function getActionTemplate(issue: typeof complianceIssues[0]): string {
  return `Dear ${issue.provider},\n\nAction is required regarding: ${issue.issue}.\n\nPlease address this at your earliest convenience.\n\nThank you,\nAustin Regional Medical Group`;
}

interface RequestState {
  issue: typeof complianceIssues[0];
  editing: boolean;
  sent: boolean;
  sentAt?: string;
}

export default function GroupCompliancePage() {
  const hasIssues = complianceIssues.length > 0;
  const [requestState, setRequestState] = useState<RequestState | null>(null);
  const [notifMethod, setNotifMethod] = useState<'email' | 'app'>('email');
  const [templateText, setTemplateText] = useState('');
  const [urgency, setUrgency] = useState('Medium');

  // Track sent states per issue
  const [sentIssues, setSentIssues] = useState<Record<number, { sentAt: string }>>({});

  const openActionDialog = (issue: typeof complianceIssues[0], issueIndex: number) => {
    if (sentIssues[issueIndex]) return; // already sent
    setRequestState({ issue, editing: false, sent: false });
    setNotifMethod('email');
    setTemplateText(getActionTemplate(issue));
    setUrgency(issue.priority);
  };

  const handleSendNotification = () => {
    if (!requestState) return;
    const method = notifMethod === 'email' ? 'Email' : 'In-App';
    toast.success(`${method} notification sent to ${requestState.issue.provider}`, { description: `Re: ${requestState.issue.issue}` });
    const idx = complianceIssues.indexOf(requestState.issue);
    setSentIssues(prev => ({ ...prev, [idx]: { sentAt: new Date().toLocaleString() } }));
    setRequestState(null);
  };

  const cancelRequest = (idx: number) => {
    setSentIssues(prev => { const next = { ...prev }; delete next[idx]; return next; });
    toast.info('Request cancelled');
  };

  const resendRequest = (idx: number) => {
    toast.success(`Reminder resent to ${complianceIssues[idx].provider}`);
    setSentIssues(prev => ({ ...prev, [idx]: { sentAt: new Date().toLocaleString() } }));
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roster Compliance</h1>
        <p className="text-muted-foreground">Monitor credential expirations and compliance gaps across your entire provider roster.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Score</CardTitle>
            <CardDescription>Current roster status</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 items-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-warning">{GROUP_INFO.complianceScore}%</p>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <div className="mt-3 space-y-1 text-xs text-left">
                {donutData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}: <strong className="text-foreground">{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={donutData} dataKey="value" innerRadius={45} outerRadius={72} paddingAngle={3}>{donutData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Expiry Timeline (Next 180 days)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="daysFromNow" name="Days" domain={[0, 180]} />
                <YAxis type="category" dataKey="provider" name="Provider" width={90} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, _n, p: any) => [`${v} days`, `${p.payload.providerFull} — ${p.payload.credential}`]} />
                <Scatter data={expiryTimelineEvents} fill="hsl(var(--destructive))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Missing / Incomplete Items</CardTitle></CardHeader>
        {!hasIssues ? (
          <EmptyState icon={ShieldCheck} title="Your roster is fully compliant" description="All provider credentials are current and up to date." variant="success" />
        ) : (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Days Until Impact</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceIssues.map((issue, i) => {
                  const sent = sentIssues[i];
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{issue.provider}</TableCell>
                      <TableCell>{issue.issue}</TableCell>
                      <TableCell>
                        <Badge variant={issue.priority === 'High' ? 'destructive' : issue.priority === 'Medium' ? 'secondary' : 'outline'}>{issue.priority}</Badge>
                      </TableCell>
                      <TableCell>{issue.daysUntilImpact || '—'}</TableCell>
                      <TableCell>
                        {sent ? (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Document Requested — Pending</span>
                            <p className="text-xs text-muted-foreground">Sent {sent.sentAt}</p>
                            <div className="flex gap-2">
                              <button className="text-xs text-destructive hover:underline" onClick={() => cancelRequest(i)}>Cancel</button>
                              <button className="text-xs text-primary hover:underline" onClick={() => resendRequest(i)}>Resend</button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => openActionDialog(issue, i)}>{issue.action}</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Document Collection Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {documentCollectionRequests.map(req => (
            <div key={req.id} className="p-4 rounded-lg border bg-muted/30 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{req.providerName}</p>
                <p className="text-xs text-muted-foreground">{req.message}</p>
                <p className="text-xs text-muted-foreground mt-1">Sent {req.sentDate} · {req.status}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Reminder sent to ${req.providerName}`)}>
                <Send className="mr-1.5 h-4 w-4" /> Send Reminder
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!requestState} onOpenChange={open => !open && setRequestState(null)}>
        <DialogContent className="sm:max-w-[562px] max-h-[85vh] flex flex-col overflow-x-hidden overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{requestState?.editing ? 'Edit Request' : 'Send Notification'}</DialogTitle>
          </DialogHeader>
          {requestState && (
            <div className="space-y-4 pt-1 min-w-0">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium">{requestState.issue.provider}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{requestState.issue.issue}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={requestState.issue.priority === 'High' ? 'destructive' : 'secondary'}>{urgency} Priority</Badge>
                </div>
              </div>

              {requestState.editing && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Urgency Level</Label>
                  <Input value={urgency} onChange={e => setUrgency(e.target.value)} placeholder="e.g., High, Medium, Low" />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Notification Method</Label>
                <RadioGroup value={notifMethod} onValueChange={v => setNotifMethod(v as 'email' | 'app')}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg border flex-1 cursor-pointer hover:bg-muted/30" onClick={() => setNotifMethod('email')}>
                      <RadioGroupItem value="email" id="c-method-email" />
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="c-method-email" className="cursor-pointer text-sm">Email</Label>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border flex-1 cursor-pointer hover:bg-muted/30" onClick={() => setNotifMethod('app')}>
                      <RadioGroupItem value="app" id="c-method-app" />
                      <BellIcon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="c-method-app" className="cursor-pointer text-sm">In-App</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Message</Label>
                <Textarea rows={4} value={templateText} onChange={e => setTemplateText(e.target.value)} className="text-sm" />
              </div>
            </div>
          )}
          <DialogFooter className="flex-shrink-0 flex-col sm:flex-row sm:justify-end gap-2 items-center">
            {!requestState?.editing && (
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setRequestState(prev => prev ? { ...prev, editing: true } : null)}>
                <Pencil className="mr-1.5 h-4 w-4" /> Edit Request
              </Button>
            )}
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setRequestState(null)}>Cancel</Button>
            <Button className="btn-primary-gradient w-full sm:w-auto" onClick={handleSendNotification} disabled={!templateText.trim()}>
              <Send className="mr-1.5 h-4 w-4" /> Send Notification to Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
