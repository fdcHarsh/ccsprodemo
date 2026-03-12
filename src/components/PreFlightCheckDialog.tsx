import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Loader2, X, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DisclosureQuestion } from '@/types/lhl234Profile';

type CheckStatus = 'pending' | 'running' | 'pass' | 'warn' | 'fail' | 'info';

interface PreFlightCheck {
  label: string;
  detail: string;
  status: CheckStatus;
  message?: string;
}

export interface ProviderPreFlightData {
  profileCompletion: number;
  licenseStatus: string;
  licenseDaysLeft?: number;
  malpracticeStatus: string;
  malpracticeDaysLeft?: number;
  caqhStatus: string;
  hasDEA?: boolean;
  deaStatus?: string;
  deaDaysLeft?: number;
}

interface PreFlightCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packetName?: string;
  documents?: string[];
  onComplete?: () => void;
  missingDisclosureAttachments?: DisclosureQuestion[];
  providerData?: ProviderPreFlightData;
}

const DEFAULT_DOCS = [
  'Professional License',
  'DEA Certificate',
  'Malpractice Insurance Certificate',
  'Board Certification',
  'CV / Curriculum Vitae',
  'NPI Confirmation Letter',
];

function computeChecks(data: ProviderPreFlightData): { checks: Omit<PreFlightCheck, 'status'>[]; statuses: CheckStatus[] } {
  const checks: Omit<PreFlightCheck, 'status'>[] = [];
  const statuses: CheckStatus[] = [];

  // Profile
  const pct = data.profileCompletion;
  checks.push({
    label: 'Profile Completeness',
    detail: `${pct}%`,
    message: pct < 90 ? 'Profile must be at least 90% to generate. You can proceed but the packet may be incomplete.' : undefined,
  });
  statuses.push(pct >= 90 ? 'pass' : pct >= 70 ? 'warn' : 'fail');

  // License
  const licMsg = data.licenseStatus === 'current' ? undefined : data.licenseStatus === 'urgent' ? `License expires in ${data.licenseDaysLeft ?? '?'} days` : 'License expiring soon';
  checks.push({
    label: 'Professional License',
    detail: data.licenseStatus === 'current' ? 'Current' : data.licenseStatus === 'urgent' ? `${data.licenseDaysLeft ?? '?'} days left` : 'Expiring',
    message: licMsg,
  });
  statuses.push(data.licenseStatus === 'current' ? 'pass' : data.licenseStatus === 'urgent' ? 'fail' : 'warn');

  // DEA
  if (data.hasDEA !== false) {
    const deaSt = data.deaStatus || 'current';
    checks.push({
      label: 'DEA Certificate',
      detail: deaSt === 'current' ? 'Current' : data.deaDaysLeft ? `Expiring in ${data.deaDaysLeft} days` : 'Expiring',
      message: deaSt !== 'current' ? 'DEA Certificate expiring. Consider renewing.' : undefined,
    });
    statuses.push(deaSt === 'current' ? 'pass' : deaSt === 'urgent' ? 'fail' : 'warn');
  } else {
    checks.push({
      label: 'DEA Certificate',
      detail: 'Not on file',
      message: 'DEA Certificate not required for all providers. If you have one, consider adding it.',
    });
    statuses.push('info');
  }

  // Malpractice
  checks.push({
    label: 'Malpractice Insurance',
    detail: data.malpracticeStatus === 'current' ? 'Current' : data.malpracticeStatus === 'urgent' ? `${data.malpracticeDaysLeft ?? '?'} days left` : 'Expiring',
    message: data.malpracticeStatus !== 'current' ? `Malpractice insurance ${data.malpracticeStatus === 'urgent' ? 'expires very soon' : 'expiring'}. Please renew.` : undefined,
  });
  statuses.push(data.malpracticeStatus === 'current' ? 'pass' : data.malpracticeStatus === 'urgent' ? 'fail' : 'warn');

  // CAQH
  checks.push({
    label: 'CAQH Status',
    detail: data.caqhStatus,
    message: data.caqhStatus !== 'Active' ? `CAQH profile is ${data.caqhStatus}. Most payers require an active CAQH profile.` : undefined,
  });
  statuses.push(data.caqhStatus === 'Active' ? 'pass' : data.caqhStatus === 'Pending' ? 'warn' : 'fail');

  return { checks, statuses };
}

// Fallback defaults when no providerData
const DEFAULT_CHECKS: Omit<PreFlightCheck, 'status'>[] = [
  { label: 'Profile Completeness', detail: '78%', message: 'Profile must be at least 90% to generate. You can proceed but the packet may be incomplete.' },
  { label: 'Professional License', detail: 'Current', message: 'No professional license on file. This is optional for some provider types.' },
  { label: 'DEA Certificate', detail: 'Expiring in 68 days', message: 'DEA Certificate not required for all providers. If you have one, consider adding it.' },
  { label: 'Malpractice Insurance', detail: 'Current' },
  { label: 'CAQH Status', detail: 'Active' },
];
const DEFAULT_RESULTS: CheckStatus[] = ['fail', 'info', 'info', 'pass', 'pass'];

export function PreFlightCheckDialog({
  open,
  onOpenChange,
  packetName = 'Credentialing Packet',
  documents = DEFAULT_DOCS,
  onComplete,
  missingDisclosureAttachments = [],
  providerData,
}: PreFlightCheckDialogProps) {
  const [checks, setChecks] = useState<PreFlightCheck[]>([]);
  const [runningIdx, setRunningIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const [success, setSuccess] = useState(false);
  

  const buildChecks = () => {
    let baseChecks: Omit<PreFlightCheck, 'status'>[];
    let resultStatuses: CheckStatus[];

    if (providerData) {
      const computed = computeChecks(providerData);
      baseChecks = computed.checks;
      resultStatuses = computed.statuses;
    } else {
      baseChecks = [...DEFAULT_CHECKS];
      resultStatuses = [...DEFAULT_RESULTS];
    }

    if (missingDisclosureAttachments.length > 0) {
      baseChecks.push({
        label: 'Disclosure Attachments',
        detail: `${missingDisclosureAttachments.length} missing`,
        message: `Questions ${missingDisclosureAttachments.map(q => `#${q.questionNumber}`).join(', ')} answered "Yes" but have no supporting documents attached.`,
      });
      resultStatuses.push('warn');
    }

    return { baseChecks, resultStatuses };
  };

  // Stabilize providerData to avoid re-running effect on every render
  const providerDataRef = useRef(providerData);
  providerDataRef.current = providerData;
  const disclosureRef = useRef(missingDisclosureAttachments);
  disclosureRef.current = missingDisclosureAttachments;

  useEffect(() => {
    if (!open) return;
    
    const { baseChecks, resultStatuses } = buildChecks();
    const initialChecks = baseChecks.map(c => ({ ...c, status: 'pending' as CheckStatus }));
    setChecks(initialChecks);
    setRunningIdx(-1);
    setDone(false);
    setSuccess(false);

    let cancelled = false;

    const run = async () => {
      await new Promise(r => setTimeout(r, 300));
      if (cancelled) return;

      const results = baseChecks.map(c => ({ ...c, status: 'pending' as CheckStatus }));
      setChecks([...results]);

      for (let i = 0; i < baseChecks.length; i++) {
        if (cancelled) return;
        setRunningIdx(i);
        results[i] = { ...results[i], status: 'running' };
        setChecks([...results]);
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        results[i] = { ...results[i], status: resultStatuses[i] || 'pass' };
        setChecks([...results]);
      }
      if (!cancelled) {
        setRunningIdx(-1);
        setDone(true);
      }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleGenerateAnyway = async () => {
    await new Promise(r => setTimeout(r, 800));
    setSuccess(true);
    onComplete?.();
  };

  const handleDownload = () => {
    toast.success('Packet downloaded!', {
      description: `${packetName} — Demo mode: no actual file generated.`,
    });
  };

  const statusIcon = (status: CheckStatus) => {
    if (status === 'running') return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    if (status === 'pass') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === 'warn') return <AlertTriangle className="h-4 w-4 text-warning" />;
    if (status === 'fail') return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (status === 'info') return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{success ? 'Packet Ready' : 'Pre-flight Check'}</DialogTitle>
        </DialogHeader>

        {!success ? (
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              {checks.map((check, i) => (
                <div key={i} className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  check.status === 'pass' && 'bg-success/5 border-success/20',
                  check.status === 'warn' && 'bg-warning/5 border-warning/20',
                  check.status === 'fail' && 'bg-destructive/5 border-destructive/20',
                  check.status === 'info' && 'bg-muted/30 border-muted-foreground/20',
                  check.status === 'running' && 'bg-primary/5 border-primary/20',
                  check.status === 'pending' && 'bg-muted/40 border-border',
                )}>
                  <div className="mt-0.5 flex-shrink-0">{statusIcon(check.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{check.label}</span>
                      <span className={cn(
                        'text-xs font-medium',
                        check.status === 'pass' && 'text-success',
                        check.status === 'warn' && 'text-warning',
                        check.status === 'fail' && 'text-destructive',
                        check.status === 'info' && 'text-muted-foreground',
                        (check.status === 'pending' || check.status === 'running') && 'text-muted-foreground',
                      )}>{check.status === 'info' ? 'Optional' : check.detail}</span>
                    </div>
                    {check.message && (check.status === 'warn' || check.status === 'fail' || check.status === 'info') && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{check.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {done && (() => {
              const allPassed = checks.every(c => c.status === 'pass');
              return (
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                    <X className="mr-1.5 h-4 w-4" /> Cancel
                  </Button>
                  <Button className="flex-1 btn-primary-gradient" onClick={handleGenerateAnyway}>
                    {allPassed ? 'Generate' : 'Generate Anyway'}
                  </Button>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{packetName}</p>
                <p className="text-xs text-muted-foreground">{documents.length} documents included</p>
              </div>
            </div>

            <div className="space-y-1">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button className="flex-1 btn-primary-gradient" onClick={handleDownload}>
                Download Packet
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
