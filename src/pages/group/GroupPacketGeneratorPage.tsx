import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Package, Download, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { rosterProviders, GROUP_PAYERS } from '@/lib/mockData';
import { PreFlightCheckDialog } from '@/components/PreFlightCheckDialog';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

function isProviderCompliant(p: typeof rosterProviders[0]): boolean {
  return p.packetReady && p.licenseStatus === 'current' && p.malpracticeStatus === 'current' && p.profileCompletion >= 90;
}

function getPreflightItems(p: typeof rosterProviders[0]) {
  const items: { label: string; status: 'pass' | 'fail' | 'warn' }[] = [];
  items.push({ label: 'Profile Completion', status: p.profileCompletion >= 90 ? 'pass' : p.profileCompletion >= 70 ? 'warn' : 'fail' });
  items.push({ label: 'State License', status: p.licenseStatus === 'current' ? 'pass' : p.licenseStatus === 'expiring' ? 'warn' : 'fail' });
  items.push({ label: 'Malpractice Insurance', status: p.malpracticeStatus === 'current' ? 'pass' : p.malpracticeStatus === 'expiring' ? 'warn' : 'fail' });
  items.push({ label: 'CAQH Status', status: p.caqhStatus === 'Active' ? 'pass' : p.caqhStatus === 'Pending' ? 'warn' : 'fail' });
  const hasDEA = p.documents.some(d => d.name.toLowerCase().includes('dea'));
  if (hasDEA) {
    const deaDoc = p.documents.find(d => d.name.toLowerCase().includes('dea'));
    items.push({ label: 'DEA Certificate', status: deaDoc?.status === 'current' ? 'pass' : 'warn' });
  }
  return items;
}

export default function GroupPacketGeneratorPage() {
  const [providerId, setProviderId] = useState('');
  const [payer, setPayer] = useState('');
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [generatedSingle, setGeneratedSingle] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [bulkPayer, setBulkPayer] = useState('');
  const [selectedBulk, setSelectedBulk] = useState<string[]>([]);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  // Preflight detail panel
  const [preflightDetailProvider, setPreflightDetailProvider] = useState<typeof rosterProviders[0] | null>(null);

  const selectedProvider = rosterProviders.find(p => p.id === providerId);
  const readyProviders = rosterProviders.filter(p => p.packetReady);

  // Build bulk list from roster providers
  const bulkProviders = rosterProviders.map(p => ({
    ...p,
    compliant: isProviderCompliant(p),
  }));

  const compliantProviders = bulkProviders.filter(p => p.compliant);
  const allCompliantSelected = compliantProviders.length > 0 && compliantProviders.every(p => selectedBulk.includes(p.name));

  const packetName = useMemo(() => {
    if (!selectedProvider || !payer) return 'Credentialing Packet';
    return `${selectedProvider.name} — ${payer} Packet`;
  }, [selectedProvider, payer]);

  const runBulk = async () => {
    setBulkGenerating(true);
    for (const _name of selectedBulk) {
      await new Promise(r => setTimeout(r, 450));
    }
    setBulkGenerating(false);
    setBulkDone(true);
    toast.success(`${selectedBulk.length} packets generated successfully.`);
  };

  const toggleSelectAllCompliant = () => {
    if (allCompliantSelected) {
      setSelectedBulk([]);
    } else {
      setSelectedBulk(compliantProviders.map(p => p.name));
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Generate Packets</h1>
        <p className="text-muted-foreground">Generate credentialing packets for your providers to submit to payers.</p>
      </div>

      {/* Single Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Single Provider Packet</CardTitle>
          <CardDescription>Select one provider and payer, then run pre-flight checks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Provider</Label>
              <Select value={providerId} onValueChange={setProviderId}>
                <SelectTrigger><SelectValue placeholder="Choose provider" /></SelectTrigger>
                <SelectContent>
                  {rosterProviders.map(p => (
                    <SelectItem key={p.id} value={p.id} disabled={!p.packetReady}>
                      {p.name} {!p.packetReady ? '(Not ready)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProvider && !selectedProvider.packetReady && (
                <p className="text-xs text-warning">{selectedProvider.packetNotReadyReason}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Select Payer</Label>
              <Select value={payer} onValueChange={setPayer}>
                <SelectTrigger><SelectValue placeholder="Choose payer" /></SelectTrigger>
                <SelectContent>
                  {[...GROUP_PAYERS, 'Custom'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="btn-primary-gradient" disabled={!providerId || !payer} onClick={() => setPreflightOpen(true)}>
            Run Pre-Flight Check
          </Button>

          {generatedSingle && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/30 space-y-3">
              <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {packetName}</p>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => toast.success('Packet downloaded (demo).')}>
                  <Download className="mr-1.5 h-4 w-4" /> Download
                </Button>
                <div className="flex items-center gap-2">
                  <Label htmlFor="submitted-toggle" className="text-sm">Mark as submitted</Label>
                  <Switch id="submitted-toggle" checked={submitted} onCheckedChange={setSubmitted} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Packet Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Packet Generation</CardTitle>
          <CardDescription>Generate packets for multiple providers. Non-compliant providers are grayed out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bulkProviders.length === 0 ? (
            <EmptyState icon={Package} title="No providers available" description="Add providers to your roster to generate packets." />
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Providers</Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={allCompliantSelected} onCheckedChange={toggleSelectAllCompliant} />
                    <span className="text-sm font-medium">Select All Compliant</span>
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {bulkProviders.map(bp => {
                    const checked = selectedBulk.includes(bp.name);
                    return (
                      <div
                        key={bp.id}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg',
                          bp.compliant ? 'bg-muted/40 cursor-pointer' : 'bg-muted/20 opacity-60 cursor-not-allowed'
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={!bp.compliant}
                          onCheckedChange={() => {
                            if (!bp.compliant) return;
                            setSelectedBulk(prev => checked ? prev.filter(n => n !== bp.name) : [...prev, bp.name]);
                          }}
                        />
                        <span className={cn('text-sm flex-1', !bp.compliant && 'text-muted-foreground')}>{bp.name}</span>
                        <button
                          className="flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); setPreflightDetailProvider(bp); }}
                          title={bp.compliant ? 'Compliant — View preflight' : 'Not compliant — View issues'}
                        >
                          {bp.compliant ? (
                            <ShieldCheck className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payer</Label>
                <Select value={bulkPayer} onValueChange={setBulkPayer}>
                  <SelectTrigger className="w-full md:w-72"><SelectValue placeholder="Select payer" /></SelectTrigger>
                  <SelectContent>
                    {GROUP_PAYERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-primary-gradient" disabled={selectedBulk.length === 0 || !bulkPayer || bulkGenerating} onClick={runBulk}>
                {bulkGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : `Generate Packets for Selected Providers`}
              </Button>

              {bulkDone && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-center justify-between">
                  <p className="text-sm font-medium">{selectedBulk.length} packets generated successfully. Ready to download.</p>
                  <Button variant="outline" size="sm" onClick={() => toast.success('Download all started (demo).')}>Download All</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Preflight Detail Dialog */}
      <Dialog open={!!preflightDetailProvider} onOpenChange={open => !open && setPreflightDetailProvider(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Preflight Checklist — {preflightDetailProvider?.name}</DialogTitle>
          </DialogHeader>
          {preflightDetailProvider && (
            <div className="space-y-2 py-2">
              {getPreflightItems(preflightDetailProvider).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <span className="text-sm">{item.label}</span>
                  {item.status === 'pass' && <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">Pass</Badge>}
                  {item.status === 'warn' && <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">Warning</Badge>}
                  {item.status === 'fail' && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">Fail</Badge>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PreFlightCheckDialog
        open={preflightOpen}
        onOpenChange={(open) => { setPreflightOpen(open); }}
        packetName={packetName}
        onComplete={() => setGeneratedSingle(true)}
        providerData={selectedProvider ? {
          profileCompletion: selectedProvider.profileCompletion,
          licenseStatus: selectedProvider.licenseStatus,
          licenseDaysLeft: selectedProvider.licenseDaysLeft,
          malpracticeStatus: selectedProvider.malpracticeStatus,
          malpracticeDaysLeft: selectedProvider.malpracticeDaysLeft,
          caqhStatus: selectedProvider.caqhStatus,
          hasDEA: selectedProvider.documents.some(d => d.name.toLowerCase().includes('dea')),
          deaStatus: selectedProvider.documents.find(d => d.name.toLowerCase().includes('dea'))?.status || 'current',
        } : undefined}
        documents={selectedProvider?.documents.map(d => d.name)}
      />
    </div>
  );
}
