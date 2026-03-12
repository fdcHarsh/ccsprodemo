import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { payerPipelineData, rosterProviders, PayerCredentialingStatus } from '@/lib/mockData';
import { PreFlightCheckDialog } from '@/components/PreFlightCheckDialog';

const PAYER_COLORS: Record<string, string> = {
  'Bexar County': 'bg-primary',
  Humana: 'bg-success',
  Aetna: 'bg-destructive',
};

export default function GroupPayerWorkflowsPage() {
  const navigate = useNavigate();
  const [expandedPayer, setExpandedPayer] = useState<string | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<Record<string, Record<string, PayerCredentialingStatus>>>({});
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [preflightProvider, setPreflightProvider] = useState<typeof rosterProviders[0] | null>(null);

  const toggle = (payer: string) => setExpandedPayer(prev => (prev === payer ? null : payer));

  const handleUpdateStatus = (payer: string, provider: string, newStatus: PayerCredentialingStatus) => {
    setProviderStatuses(prev => ({
      ...prev,
      [payer]: { ...(prev[payer] || {}), [provider]: newStatus },
    }));
    toast.success(`Notification sent to ${provider}: Your credentialing status with ${payer} has been updated to ${newStatus}.`);
  };

  const getStatus = (payer: string, provider: string, defaultStatus: PayerCredentialingStatus): PayerCredentialingStatus => {
    return providerStatuses[payer]?.[provider] ?? defaultStatus;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payer Workflows</h1>
        <p className="text-muted-foreground">Track credentialing status for all providers across each payer.</p>
      </div>

      <div className="space-y-4">
        {Object.entries(payerPipelineData).map(([payer, data]) => {
          const total = 9;
          const credentialedPct = (data.credentialed.length / total) * 100;
          const isExpanded = expandedPayer === payer;

          const allProviders = rosterProviders.map(p => {
            const name = p.name;
            let defaultStatus: PayerCredentialingStatus = 'Not Started';
            if (data.credentialed.includes(name)) defaultStatus = 'Credentialed';
            else if (data.inProgress.includes(name)) defaultStatus = 'In Progress';
            const status = getStatus(payer, name, defaultStatus);
            const isCompliant = p.packetReady;
            return { provider: p, status, isCompliant };
          });

          return (
            <Card key={payer} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', PAYER_COLORS[payer] || 'bg-primary', 'text-white')}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{payer}</CardTitle>
                      <CardDescription className="text-xs">
                        {data.credentialed.length} / {total} credentialed · {data.inProgress.length} in progress
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <Progress value={credentialedPct} className="h-2 w-24" />
                      <p className="text-xs text-muted-foreground mt-1">{Math.round(credentialedPct)}%</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggle(payer)}>
                      View Details
                      {isExpanded ? <ChevronUp className="ml-1.5 h-3.5 w-3.5" /> : <ChevronDown className="ml-1.5 h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProviders.map(({ provider, status, isCompliant }) => (
                        <TableRow key={provider.id} className={cn(!isCompliant && 'bg-destructive/3')}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm font-medium">{provider.name}, {provider.credentials}</p>
                                <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                              </div>
                              {!isCompliant && (
                                <Badge variant="destructive" className="text-[10px] flex-shrink-0">
                                  <AlertTriangle className="h-3 w-3 mr-0.5" /> Action Required
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              'status-badge text-xs',
                              status === 'Credentialed' && 'status-current',
                              status === 'In Progress' && 'bg-primary/10 text-primary',
                              status === 'Not Started' && 'status-expired',
                            )}>
                              {status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Select
                                value={status}
                                onValueChange={v => handleUpdateStatus(payer, provider.name, v as PayerCredentialingStatus)}
                              >
                                <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Credentialed">Credentialed</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Not Started">Not Started</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="sm" className="text-xs" disabled={!provider.packetReady}
                                onClick={() => { if (provider.packetReady) { setPreflightProvider(provider); setPreflightOpen(true); } }}
                                title={!provider.packetReady ? provider.packetNotReadyReason : 'Generate packet'}
                              >
                                Packet
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
          );
        })}
      </div>

      <PreFlightCheckDialog
        open={preflightOpen}
        onOpenChange={(open) => { setPreflightOpen(open); if (!open) setPreflightProvider(null); }}
        packetName={preflightProvider ? `${preflightProvider.name} — Credentialing Packet` : ''}
        providerData={preflightProvider ? {
          profileCompletion: preflightProvider.profileCompletion,
          licenseStatus: preflightProvider.licenseStatus,
          licenseDaysLeft: preflightProvider.licenseDaysLeft,
          malpracticeStatus: preflightProvider.malpracticeStatus,
          malpracticeDaysLeft: preflightProvider.malpracticeDaysLeft,
          caqhStatus: preflightProvider.caqhStatus,
          hasDEA: preflightProvider.documents.some(d => d.name.toLowerCase().includes('dea')),
          deaStatus: preflightProvider.documents.find(d => d.name.toLowerCase().includes('dea'))?.status || 'current',
        } : undefined}
        documents={preflightProvider?.documents.map(d => d.name)}
      />
    </div>
  );
}
