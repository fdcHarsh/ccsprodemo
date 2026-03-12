import { useState } from 'react';
import { Search, UserPlus, Eye, Send, FileText, Users, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { rosterProviders, RosterProvider, PayerCredentialingStatus, GROUP_PAYERS } from '@/lib/mockData';
import { InviteProviderDialog } from '@/components/InviteProviderDialog';
import { PreFlightCheckDialog } from '@/components/PreFlightCheckDialog';
import { EmptyState } from '@/components/EmptyState';
import { CredentialingTooltip } from '@/components/CredentialingTooltip';

type FilterType = 'all' | 'packet-ready' | 'needs-attention' | 'expiring';

const caqhBadge = (status: string) => {
  if (status === 'Active') return <span className="status-badge status-current text-xs">{status}</span>;
  if (status === 'Inactive') return <span className="status-badge status-urgent text-xs">{status}</span>;
  return <span className="status-badge status-expiring text-xs">{status}</span>;
};

const licBadge = (s: string, days?: number) => {
  if (s === 'current') return <span className="status-badge status-current text-xs">Current</span>;
  if (s === 'urgent') return <span className="status-badge status-urgent text-xs">Exp. {days}d</span>;
  return <span className="status-badge status-expiring text-xs">Expiring</span>;
};

const payerStatusColor: Record<PayerCredentialingStatus, string> = {
  'Credentialed': 'text-success',
  'In Progress': 'text-primary',
  'Not Started': 'text-muted-foreground',
};

export default function GroupProvidersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<RosterProvider | null>(null);
  const [requestDocProvider, setRequestDocProvider] = useState<RosterProvider | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  // Download flow: payer selection → preflight → generate
  const [downloadProvider, setDownloadProvider] = useState<RosterProvider | null>(null);
  const [downloadStep, setDownloadStep] = useState<'payer' | 'preflight' | 'done'>('payer');
  const [downloadPayer, setDownloadPayer] = useState('');
  const [preflightChecking, setPreflightChecking] = useState(false);
  const [preflightPassed, setPreflightPassed] = useState(false);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);

  const filtered = rosterProviders.filter(p => {
    const matchSearch = `${p.name} ${p.specialty}`.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'packet-ready') return p.packetReady;
    if (filter === 'needs-attention') return p.needsAttention;
    if (filter === 'expiring') return p.licenseStatus === 'urgent' || p.malpracticeStatus === 'urgent';
    return true;
  });

  const handleSendRequest = () => {
    toast.success('Request sent!', { description: `Document request sent to ${requestDocProvider?.name}.` });
    setRequestDocProvider(null);
    setRequestMessage('');
  };

  const startDownloadFlow = (provider: RosterProvider) => {
    setDownloadProvider(provider);
    setDownloadStep('payer');
    setDownloadPayer('');
    setPreflightPassed(false);
    setWarningAcknowledged(false);
  };

  const runPreflight = async () => {
    setPreflightChecking(true);
    await new Promise(r => setTimeout(r, 1200));
    const passed = downloadProvider ? downloadProvider.packetReady && downloadProvider.licenseStatus === 'current' && downloadProvider.malpracticeStatus === 'current' : false;
    setPreflightPassed(passed);
    setPreflightChecking(false);
    setDownloadStep('preflight');
  };

  const handleGenerate = () => {
    toast.success(`Download initiated for ${downloadProvider?.name} — ${downloadPayer} packet.`);
    setDownloadProvider(null);
  };

  const getPreflightItems = (p: RosterProvider) => [
    { label: 'Profile Completion', pass: p.profileCompletion >= 90, value: `${p.profileCompletion}%` },
    { label: 'State License', pass: p.licenseStatus === 'current', value: p.licenseStatus },
    { label: 'Malpractice Insurance', pass: p.malpracticeStatus === 'current', value: p.malpracticeStatus },
    { label: 'CAQH Status', pass: p.caqhStatus === 'Active', value: p.caqhStatus },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Provider Roster</h1>
          <p className="text-muted-foreground">{rosterProviders.length} providers</p>
        </div>
        <Button className="btn-primary-gradient" onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Invite Provider
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search providers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={v => setFilter(v as FilterType)}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="packet-ready">Packet Ready</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
            <SelectItem value="expiring">Expiring Credentials</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No providers match your filter" description="Try adjusting your search or filter criteria." />
        ) : (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Profile %</TableHead>
                  <TableHead><CredentialingTooltip term="CAQH">CAQH</CredentialingTooltip></TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Malpractice</TableHead>
                  <TableHead>Packet Ready</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(provider => (
                  <TableRow key={provider.id} className={cn(provider.needsAttention && 'border-l-4 border-l-warning bg-warning/3')}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{provider.name}, {provider.credentials}</p>
                        <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={provider.profileCompletion} className="h-1.5 w-16" />
                        <span className="text-xs font-medium">{provider.profileCompletion}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{caqhBadge(provider.caqhStatus)}</TableCell>
                    <TableCell>{licBadge(provider.licenseStatus, provider.licenseDaysLeft)}</TableCell>
                    <TableCell>{licBadge(provider.malpracticeStatus, provider.malpracticeDaysLeft)}</TableCell>
                    <TableCell>
                      {provider.packetReady
                        ? <span className="status-badge status-current text-xs">Yes</span>
                        : <span className="status-badge status-urgent text-xs">No</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProvider(provider)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setRequestDocProvider(provider); setRequestMessage(''); }}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => startDownloadFlow(provider)} title="Download Packet">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* Provider Detail Drawer */}
      <Sheet open={!!selectedProvider} onOpenChange={open => !open && setSelectedProvider(null)}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          {selectedProvider && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-xl">{selectedProvider.name}, {selectedProvider.credentials}</SheetTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{selectedProvider.specialty}</span>
                  <Badge variant={selectedProvider.profileCompletion >= 90 ? 'default' : 'secondary'}>{selectedProvider.profileCompletion}% complete</Badge>
                </div>
              </SheetHeader>
              <Tabs defaultValue="overview">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
                  <TabsTrigger value="credentials" className="flex-1">Credentials</TabsTrigger>
                  <TabsTrigger value="payers" className="flex-1">Payers</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'NPI', value: selectedProvider.npi },
                      { label: 'CAQH ID', value: selectedProvider.caqhId || 'Not set' },
                      { label: 'Email', value: selectedProvider.email },
                      { label: 'Phone', value: selectedProvider.phone },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium break-all">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Practice Location</p>
                    <p className="text-sm font-medium">{selectedProvider.practiceLocation}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Profile Completion</p>
                    <Progress value={selectedProvider.profileCompletion} className="h-2" />
                    <p className="text-sm font-semibold mt-1">{selectedProvider.profileCompletion}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Last updated: {selectedProvider.lastUpdated}</p>
                </TabsContent>
                <TabsContent value="documents" className="pt-4">
                  <Button size="sm" variant="outline" className="mb-4 w-full" onClick={() => { setRequestDocProvider(selectedProvider); setSelectedProvider(null); }}>
                    <Send className="mr-2 h-4 w-4" /> Request Document
                  </Button>
                  <div className="space-y-2">
                    {selectedProvider.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          {doc.expirationDate && <p className="text-xs text-muted-foreground">Exp: {doc.expirationDate}</p>}
                        </div>
                        {doc.status === 'current' && <span className="status-badge status-current text-xs">Current</span>}
                        {doc.status === 'expiring' && <span className="status-badge status-expiring text-xs">Expiring</span>}
                        {doc.status === 'urgent' && <span className="status-badge status-urgent text-xs">Urgent</span>}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="credentials" className="pt-4 space-y-2">
                  {[
                    { label: 'License', status: selectedProvider.licenseStatus, days: selectedProvider.licenseDaysLeft },
                    { label: 'Malpractice Insurance', status: selectedProvider.malpracticeStatus, days: selectedProvider.malpracticeDaysLeft },
                    { label: 'CAQH Status', status: selectedProvider.caqhStatus === 'Active' ? 'current' : 'urgent', days: undefined },
                  ].map(cred => (
                    <div key={cred.label} className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      cred.status === 'current' ? 'bg-success/5 border border-success/20' :
                      cred.status === 'urgent' ? 'bg-destructive/5 border border-destructive/20' :
                      'bg-warning/5 border border-warning/20'
                    )}>
                      <p className="text-sm font-medium">{cred.label}</p>
                      {cred.days !== undefined && (
                        <p className={cn('text-xs', cred.status === 'urgent' ? 'text-destructive' : cred.status === 'expiring' ? 'text-warning' : 'text-success')}>
                          {cred.days} days left
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="payers" className="pt-4 space-y-2">
                  {Object.entries(selectedProvider.payerStatuses).map(([payer, status]) => (
                    <div key={payer} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{payer}</p>
                      <span className={cn('text-sm font-medium', payerStatusColor[status])}>{status}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Request Document Modal */}
      <Dialog open={!!requestDocProvider} onOpenChange={open => !open && setRequestDocProvider(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Document</DialogTitle>
            <DialogDescription>Send a document request to {requestDocProvider?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Label>Message</Label>
            <Textarea rows={4} placeholder="Describe what document you need..." value={requestMessage} onChange={e => setRequestMessage(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDocProvider(null)}>Cancel</Button>
            <Button className="btn-primary-gradient" onClick={handleSendRequest} disabled={!requestMessage}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Flow Dialog */}
      <Dialog open={!!downloadProvider} onOpenChange={open => !open && setDownloadProvider(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {downloadStep === 'payer' ? 'Select Payer' : 'Pre-Flight Check'} — {downloadProvider?.name}
            </DialogTitle>
          </DialogHeader>

          {downloadStep === 'payer' && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Payer</Label>
                <Select value={downloadPayer} onValueChange={setDownloadPayer}>
                  <SelectTrigger><SelectValue placeholder="Choose payer" /></SelectTrigger>
                  <SelectContent>
                    {GROUP_PAYERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDownloadProvider(null)}>Cancel</Button>
                <Button className="btn-primary-gradient" disabled={!downloadPayer || preflightChecking} onClick={runPreflight}>
                  {preflightChecking ? 'Checking...' : 'Run Pre-Flight Check'}
                </Button>
              </DialogFooter>
            </div>
          )}

          {downloadStep === 'preflight' && downloadProvider && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                {getPreflightItems(downloadProvider).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {item.pass ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className={cn('text-xs font-medium', item.pass ? 'text-success' : 'text-destructive')}>{item.value}</span>
                  </div>
                ))}
              </div>

              {!preflightPassed && (
                <label className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 cursor-pointer">
                  <Checkbox checked={warningAcknowledged} onCheckedChange={c => setWarningAcknowledged(!!c)} className="mt-0.5" />
                  <span className="text-sm text-warning">I acknowledge the issues above and want to proceed anyway.</span>
                </label>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDownloadProvider(null)}>Cancel</Button>
                <Button className="btn-primary-gradient" disabled={!preflightPassed && !warningAcknowledged} onClick={handleGenerate}>
                  <Download className="mr-1.5 h-4 w-4" /> Generate & Download
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <InviteProviderDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
