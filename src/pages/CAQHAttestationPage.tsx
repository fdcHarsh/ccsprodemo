import { useState } from 'react';
import { format } from 'date-fns';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUI, type CAQHAttestation } from '@/contexts/UIContext';
import { useDocuments } from '@/contexts/DocumentsContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig = {
  attested: {
    label: 'Attested',
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
  },
  'not-attested': {
    label: 'Not Attested',
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
  },
};

function getDaysUntilExpiry(expiryDate: string): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CAQHAttestationPage() {
  const { caqhAttestation, updateCAQHAttestation } = useUI();
  const { documents, addDocument } = useDocuments();
  const [uploading, setUploading] = useState(false);

  const statusInfo = statusConfig[caqhAttestation.status];
  const StatusIcon = statusInfo.icon;
  const daysLeft = getDaysUntilExpiry(caqhAttestation.expiryDate);

  const linkedDocument = caqhAttestation.documentId
    ? documents.find((d) => d.id === caqhAttestation.documentId)
    : null;

  const handleStatusChange = (value: CAQHAttestation['status']) => {
    updateCAQHAttestation({ status: value });
    toast.success(`Attestation status updated to "${statusConfig[value].label}"`);
  };

  const handleDateChange = (field: 'attestationDate' | 'expiryDate', value: string) => {
    updateCAQHAttestation({ [field]: value });
  };

  const handleDocumentUpload = () => {
    const newDoc = {
      id: `doc-caqh-${Date.now()}`,
      name: 'CAQH Attestation Document',
      category: 'certifications' as const,
      uploadDate: format(new Date(), 'yyyy-MM-dd'),
      expirationDate: caqhAttestation.expiryDate || null,
      status: 'current' as const,
      fileType: 'PDF',
      fileSize: '0 KB',
    };

    setUploading(true);
    setTimeout(() => {
      addDocument(newDoc);
      updateCAQHAttestation({ documentId: newDoc.id });
      setUploading(false);
      toast.success('CAQH attestation document uploaded and linked.');
    }, 800);
  };

  const handleSave = () => {
    toast.success('CAQH attestation information saved.');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">CAQH Attestation</h1>
        <p className="text-muted-foreground">
          Manually track your CAQH ProView attestation status and dates
        </p>
      </div>

      {/* Status Overview Banner */}
      <Card className={cn('card-hover', statusInfo.border)}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={cn('h-16 w-16 rounded-full flex items-center justify-center', statusInfo.bg)}>
                <StatusIcon className={cn('h-8 w-8', statusInfo.color)} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Status: <span className={statusInfo.color}>{statusInfo.label}</span>
                </h2>
                {daysLeft !== null && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {daysLeft > 0
                      ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                      : daysLeft === 0
                      ? 'Expires today'
                      : `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`}
                  </p>
                )}
                {!caqhAttestation.expiryDate && (
                  <p className="text-muted-foreground text-sm mt-1">No expiry date set</p>
                )}
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="https://proview.caqh.org" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to CAQH ProView
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Attestation Details Form */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Attestation Details
            </CardTitle>
            <CardDescription>Enter your current CAQH attestation information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="caqh-status">Attestation Status</Label>
              <Select value={caqhAttestation.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="caqh-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attested">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Attested
                    </span>
                  </SelectItem>
                  <SelectItem value="not-attested">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Not Attested
                    </span>
                  </SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      Pending
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attestation Date */}
            <div className="space-y-2">
              <Label htmlFor="attestation-date">Attestation Date</Label>
              <Input
                id="attestation-date"
                type="date"
                value={caqhAttestation.attestationDate}
                onChange={(e) => handleDateChange('attestationDate', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The date you last completed your CAQH attestation
              </p>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Attestation Expiry Date</Label>
              <Input
                id="expiry-date"
                type="date"
                value={caqhAttestation.expiryDate}
                onChange={(e) => handleDateChange('expiryDate', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                CAQH attestation is typically valid for 120 days
              </p>
            </div>

            <Button onClick={handleSave} className="w-full btn-primary-gradient">
              Save Attestation Info
            </Button>
          </CardContent>
        </Card>

        {/* Supporting Document */}
        <div className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Supporting Document
              </CardTitle>
              <CardDescription>
                Upload your CAQH attestation confirmation or screenshot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedDocument ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{linkedDocument.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {linkedDocument.uploadDate} · {linkedDocument.fileSize}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30">
                  <Upload className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    No document uploaded yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 text-center mt-1">
                    Upload your attestation confirmation from CAQH ProView
                  </p>
                </div>
              )}

              <Button
                variant={linkedDocument ? 'outline' : 'default'}
                onClick={handleDocumentUpload}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading
                  ? 'Uploading...'
                  : linkedDocument
                  ? 'Replace Document'
                  : 'Upload Attestation Document'}
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
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
                    <li>• Review all sections even if no changes — attestation confirms accuracy</li>
                    <li>
                      •{' '}
                      <a
                        href="https://proview.caqh.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary/80"
                      >
                        Visit CAQH ProView
                      </a>{' '}
                      to complete your attestation online
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
