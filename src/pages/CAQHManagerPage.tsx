import { useState, useRef } from 'react';
import { format, addDays } from 'date-fns';
import {
  RefreshCw, Calendar, CheckCircle2, AlertTriangle, Upload, Bell, X, FileText, Info, Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUI } from '@/contexts/UIContext';
import { caqhAttestationHistory } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CredentialingTooltip } from '@/components/CredentialingTooltip';

type CAQHStatusType = 'Active' | 'Expiring Soon' | 'Expired';

const checklistItems = [
  { id: 'demographics', label: 'Personal and contact information', description: 'Verify name, address, phone, and email are current' },
  { id: 'practice-locations', label: 'Practice locations', description: 'Confirm all practice locations are up to date' },
  { id: 'education', label: 'Education and training history', description: 'Confirm CRNA program, certifications, and training' },
  { id: 'license-cert', label: 'License and certification currency', description: 'Verify RN license, APRN, and NBCRNA certification dates' },
  { id: 'liability', label: 'Professional liability insurance details', description: 'Confirm coverage dates, amounts, and carrier' },
  { id: 'work-history', label: 'Work history (no gaps greater than 6 months)', description: 'Ensure all positions and gaps are properly listed' },
  { id: 'hospital', label: 'Hospital affiliations', description: 'Add or remove hospital privileges as needed' },
  { id: 'dea-dps', label: 'DEA/DPS registration status (if applicable)', description: 'Confirm DEA and DPS controlled substances registration' },
  { id: 'disclosures', label: 'Disclosure questions accuracy', description: 'Review all 23 disclosure questions for accuracy' },
];

export default function CAQHManagerPage() {
  const { caqhChecklist, updateCAQHChecklist } = useUI();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status simulation
  const [caqhStatus, setCaqhStatus] = useState<CAQHStatusType>('Active');
  const [lastAttestedDate, setLastAttestedDate] = useState('2026-01-15');
  const nextDueDate = format(addDays(new Date(lastAttestedDate), 120), 'yyyy-MM-dd');

  const daysUntilDue = Math.ceil((new Date(nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const [localChecked, setLocalChecked] = useState<Record<string, boolean>>(
    checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: false }), {} as Record<string, boolean>)
  );

  const completedItems = Object.values(localChecked).filter(Boolean).length;
  const progressPercentage = (completedItems / checklistItems.length) * 100;

  const handleFileInput = (file: File) => {
    setUploadedFile(file.name);
    toast.success('CAQH Profile PDF uploaded', { description: `${file.name} is ready.` });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileInput(file);
  };

  const handleSetReminder = () => {
    setReminderOpen(false);
    toast.success('Reminder set!', { description: `You'll be reminded on ${format(new Date(reminderDate), 'MMMM d, yyyy')}.` });
  };

  const simulateExpiringSoon = () => {
    setCaqhStatus('Expiring Soon');
    toast.info('Status changed to Expiring Soon');
  };

  const simulateExpired = () => {
    setCaqhStatus('Expired');
    toast.warning('Status changed to Expired');
  };

  const markReAttested = () => {
    setCaqhStatus('Active');
    setLastAttestedDate(format(new Date(), 'yyyy-MM-dd'));
    toast.success('Re-attestation recorded. Status is now Active.');
  };

  const statusBannerStyles: Record<CAQHStatusType, { border: string; bg: string; textColor: string; badgeBg: string }> = {
    'Active': { border: 'border-success/40', bg: 'bg-success/5', textColor: 'text-success', badgeBg: 'bg-success/20 text-success border-success/30' },
    'Expiring Soon': { border: 'border-warning/40', bg: 'bg-warning/5', textColor: 'text-warning', badgeBg: 'bg-warning/20 text-warning border-warning/30' },
    'Expired': { border: 'border-destructive/40', bg: 'bg-destructive/5', textColor: 'text-destructive', badgeBg: 'bg-destructive/20 text-destructive border-destructive/30' },
  };

  const styles = statusBannerStyles[caqhStatus];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          <CredentialingTooltip term="CAQH">CAQH</CredentialingTooltip> Manager
        </h1>
        <p className="text-muted-foreground">Track your CAQH ProView attestation status and review checklist</p>
      </div>

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          CCS Pro does not connect directly to CAQH ProView. This section helps you track your attestation status and know what to review before you log in to CAQH directly to attest.
        </AlertDescription>
      </Alert>

      {/* Status Banner */}
      <Card className={cn(styles.border, styles.bg)}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={cn(
                'h-20 w-20 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0',
                caqhStatus === 'Active' ? 'bg-success/15 border-success/30' : caqhStatus === 'Expiring Soon' ? 'bg-warning/15 border-warning/30' : 'bg-destructive/15 border-destructive/30'
              )}>
                <span className={cn('text-2xl font-bold', styles.textColor)}>{Math.max(daysUntilDue, 0)}</span>
                <span className={cn('text-xs font-medium', styles.textColor)}>days</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {caqhStatus === 'Active' ? <CheckCircle2 className="h-4 w-4 text-success" /> : caqhStatus === 'Expiring Soon' ? <AlertTriangle className="h-4 w-4 text-warning" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <h2 className="text-lg font-semibold text-foreground">
                    {caqhStatus === 'Active' ? 'Profile Active & Attested' : caqhStatus === 'Expiring Soon' ? 'Attestation Due Soon' : 'Attestation Overdue'}
                  </h2>
                  <Badge className={cn('text-xs border', styles.badgeBg)}>{caqhStatus}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">CAQH ID</span>
                    <p className="font-mono font-semibold">12345678</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Status</span>
                    <p className={cn('font-medium', styles.textColor)}>{caqhStatus}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Last Attested</span>
                    <p className="font-medium">{format(new Date(lastAttestedDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Next Due</span>
                    <p className={cn('font-medium', styles.textColor)}>{format(new Date(nextDueDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Button onClick={() => { setReminderDate(format(addDays(new Date(nextDueDate), -14), 'yyyy-MM-dd')); setReminderOpen(true); }} variant="outline" className={cn('border-muted', styles.textColor)}>
                <Bell className="mr-2 h-4 w-4" /> Set Reminder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" /> Demo Status Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setCaqhStatus('Active'); toast.info('Status set to Active'); }} className={cn(caqhStatus === 'Active' && 'ring-2 ring-success')}>
              ✅ Active
            </Button>
            <Button size="sm" variant="outline" onClick={simulateExpiringSoon} className={cn(caqhStatus === 'Expiring Soon' && 'ring-2 ring-warning')}>
              ⚠️ Simulate: Expiring Soon
            </Button>
            <Button size="sm" variant="outline" onClick={simulateExpired} className={cn(caqhStatus === 'Expired' && 'ring-2 ring-destructive')}>
              🔴 Simulate: Attestation Expired
            </Button>
            <Button size="sm" className="btn-primary-gradient" onClick={markReAttested}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Mark as Re-Attested
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pre-Attestation Checklist */}
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">What to Review Before Attesting</CardTitle>
                <CardDescription>Key data categories a CRNA should verify before attesting</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{completedItems}/{checklistItems.length}</span>
                <p className="text-xs text-muted-foreground">reviewed</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className={cn('flex items-start gap-3 p-3 rounded-lg transition-colors', localChecked[item.id] ? 'bg-success/5' : 'bg-muted/50 hover:bg-muted')}>
                  <Checkbox id={item.id} checked={localChecked[item.id] || false} onCheckedChange={(checked) => setLocalChecked((prev) => ({ ...prev, [item.id]: !!checked }))} className="mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor={item.id} className={cn('font-medium text-sm cursor-pointer', localChecked[item.id] && 'line-through text-muted-foreground')}>{item.label}</label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  {localChecked[item.id] && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Attestation History */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><RefreshCw className="h-5 w-5" /> Attestation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {caqhAttestationHistory.map((attestation, i) => (
                  <div key={i} className={cn('flex items-center justify-between p-3 rounded-lg', attestation.status === 'upcoming' ? 'bg-warning/10 border border-warning/20' : 'bg-muted/50')}>
                    <div className="flex items-center gap-3">
                      {attestation.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Calendar className="h-5 w-5 text-warning" />}
                      <span className="text-sm font-medium">{format(new Date(attestation.date), 'MMMM d, yyyy')}</span>
                    </div>
                    {attestation.status === 'completed' ? <span className="status-badge status-current">Completed</span> : <span className="status-badge status-expiring">Upcoming</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PDF Upload */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5" /> CAQH Profile PDF</CardTitle>
              <CardDescription>Upload your latest CAQH profile export PDF</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFile ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-success">Upload successful</p>
                    <p className="text-xs text-muted-foreground truncate">{uploadedFile}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setUploadedFile(null)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div
                  className={cn('border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer', isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30')}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">Drop your CAQH PDF here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse — PDF, up to 10 MB</p>
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileInput(file); }} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">CAQH ProView Tips</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Attestation is required every 120 days to maintain active payer enrollment</li>
                <li>• Log in at least 30 days before your deadline to avoid any issues</li>
                <li>• Keep your malpractice insurance and hospital privileges updated</li>
                <li>• Review all sections even if no changes — attestation confirms accuracy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Reminder Modal */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-warning" /> Set Attestation Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Choose a date to receive a reminder. We recommend 2 weeks before your due date.</p>
            <div className="space-y-2">
              <Label htmlFor="reminder-date">Reminder Date</Label>
              <Input id="reminder-date" type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
              <p className="text-xs text-muted-foreground">Your attestation is due: <strong>{format(new Date(nextDueDate), 'MMMM d, yyyy')}</strong></p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReminderOpen(false)}>Cancel</Button>
            <Button className="btn-primary-gradient" onClick={handleSetReminder}><Bell className="mr-2 h-4 w-4" /> Set Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
