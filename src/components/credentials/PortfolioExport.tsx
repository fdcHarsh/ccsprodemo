import { useState } from 'react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import {
  Download,
  FileArchive,
  Loader2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useCredentials } from '@/contexts/CredentialsContext';
import { useLHL234Profile } from '@/hooks/useLHL234Profile';
import { generateLHL234PDF } from '@/lib/generateLHL234PDF';
import { toast } from 'sonner';

interface PortfolioExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortfolioExport({ open, onOpenChange }: PortfolioExportProps) {
  const { documents } = useDocuments();
  const { credentials } = useCredentials();
  const { profile, completionPercentage } = useLHL234Profile();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [includeLHL234, setIncludeLHL234] = useState(true);
  const [includeCoverSheet, setIncludeCoverSheet] = useState(true);
  const [includeCredentialSummary, setIncludeCredentialSummary] = useState(true);

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const docsFolder = zip.folder('Documents');
      const totalSteps = documents.length + 3;
      let step = 0;

      // 1. Cover sheet
      if (includeCoverSheet) {
        const coverPdf = generateCoverSheet();
        docsFolder?.file('00-Cover-Sheet.pdf', coverPdf);
      }
      step++;
      setProgress(Math.round((step / totalSteps) * 100));

      // 2. Credential summary
      if (includeCredentialSummary) {
        const summaryPdf = generateCredentialSummary();
        docsFolder?.file('01-Credential-Summary.pdf', summaryPdf);
      }
      step++;
      setProgress(Math.round((step / totalSteps) * 100));

      // 3. LHL234 form
      if (includeLHL234) {
        const lhl234Blob = await generateLHL234ForZip();
        if (lhl234Blob) {
          docsFolder?.file('02-LHL234-Application.pdf', lhl234Blob);
        }
      }
      step++;
      setProgress(Math.round((step / totalSteps) * 100));

      // 4. Document placeholders (since we don't have actual files in this MVP)
      documents.forEach((doc) => {
        const placeholder = generateDocPlaceholder(doc.name, doc.category, doc.expirationDate);
        const safeName = doc.name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-');
        docsFolder?.file(`${safeName}.pdf`, placeholder);
        step++;
        setProgress(Math.round((step / totalSteps) * 100));
      });

      setProgress(95);

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const providerName = [profile.individualInfo.firstName, profile.individualInfo.lastName]
        .filter(Boolean)
        .join('-') || 'Provider';
      const filename = `${providerName}-Credential-Portfolio-${format(new Date(), 'yyyy-MM-dd')}.zip`;

      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success('Credential portfolio exported successfully!');
      setTimeout(() => onOpenChange(false), 500);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  const generateCoverSheet = (): Uint8Array => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(31, 71, 136);
    doc.rect(0, 0, pw, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text('Credential Portfolio', pw / 2, 30, { align: 'center' });
    doc.setFontSize(12);
    const name = [profile.individualInfo.firstName, profile.individualInfo.lastName]
      .filter(Boolean)
      .join(' ') || 'Provider';
    doc.text(name, pw / 2, 44, { align: 'center' });

    // Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    let y = 75;
    const lines = [
      `Date Compiled: ${format(new Date(), 'MMMM d, yyyy')}`,
      `NPI: ${profile.licenses.providerNumbers.npi || 'Not provided'}`,
      `Specialty: ${profile.specialtyInfo.primarySpecialty.specialty || 'Not provided'}`,
      `Profile Completion: ${completionPercentage}%`,
      `Documents Included: ${documents.length}`,
      `Active Credentials: ${credentials.filter((c) => c.status === 'current').length}`,
    ];
    lines.forEach((line) => {
      doc.text(line, 25, y);
      y += 10;
    });

    // Table of contents
    y += 10;
    doc.setFontSize(14);
    doc.text('Contents', 25, y);
    y += 8;
    doc.setFontSize(10);
    let i = 1;
    if (includeCredentialSummary) {
      doc.text(`${i}. Credential Summary`, 30, y);
      y += 7;
      i++;
    }
    if (includeLHL234) {
      doc.text(`${i}. LHL234 Application (Texas Standardized Form)`, 30, y);
      y += 7;
      i++;
    }
    documents.forEach((d) => {
      doc.text(`${i}. ${d.name}`, 30, y);
      y += 7;
      i++;
      if (y > 270) {
        doc.addPage();
        y = 25;
      }
    });

    return doc.output('arraybuffer') as unknown as Uint8Array;
  };

  const generateCredentialSummary = (): Uint8Array => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Credential Summary', 20, 25);
    doc.setFontSize(10);
    let y = 40;

    credentials.forEach((cred) => {
      if (y > 260) {
        doc.addPage();
        y = 25;
      }
      doc.setFontSize(11);
      doc.text(cred.name, 20, y);
      doc.setFontSize(9);
      doc.text(
        `Issuer: ${cred.issuingOrganization} | Expires: ${format(new Date(cred.expirationDate), 'MMM d, yyyy')} | Status: ${cred.status.toUpperCase()}`,
        20,
        y + 5
      );
      y += 14;
    });

    return doc.output('arraybuffer') as unknown as Uint8Array;
  };

  const generateLHL234ForZip = async (): Promise<Uint8Array | null> => {
    try {
      // Generate in-memory (not download)
      const doc = new jsPDF();
      // Simplified LHL234 for ZIP inclusion
      doc.setFontSize(16);
      doc.text('Texas Standardized Credentialing Application (LHL234)', 20, 25);
      doc.setFontSize(10);
      let y = 40;
      const info = profile.individualInfo;
      const lines = [
        `Name: ${info.firstName} ${info.lastName}`,
        `Type: ${info.typeOfProfessional}`,
        `DOB: ${info.dateOfBirth}`,
        `SSN: ${info.ssn ? '***-**-' + info.ssn.slice(-4) : 'Not provided'}`,
        `NPI: ${profile.licenses.providerNumbers.npi}`,
        `DEA: ${profile.licenses.deaRegistration.deaNumber}`,
        `Specialty: ${profile.specialtyInfo.primarySpecialty.specialty}`,
        `Profile Completion: ${completionPercentage}%`,
      ];
      lines.forEach((l) => {
        doc.text(l, 25, y);
        y += 8;
      });
      return doc.output('arraybuffer') as unknown as Uint8Array;
    } catch {
      return null;
    }
  };

  const generateDocPlaceholder = (
    name: string,
    category: string,
    expDate: string | null
  ): Uint8Array => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(name, 20, 30);
    doc.setFontSize(10);
    doc.text(`Category: ${category}`, 20, 42);
    if (expDate) {
      doc.text(`Expiration: ${format(new Date(expDate), 'MMM d, yyyy')}`, 20, 50);
    }
    doc.text('This is a placeholder. In production, the actual scanned document would be included.', 20, 65);
    return doc.output('arraybuffer') as unknown as Uint8Array;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5 text-primary" />
            Export Credential Portfolio
          </DialogTitle>
          <DialogDescription>
            Download your complete credential portfolio as a ZIP file for credentialing
            companies or hospital MSOs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-cover"
                checked={includeCoverSheet}
                onCheckedChange={(v) => setIncludeCoverSheet(!!v)}
              />
              <Label htmlFor="include-cover" className="text-sm">Cover sheet with table of contents</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-summary"
                checked={includeCredentialSummary}
                onCheckedChange={(v) => setIncludeCredentialSummary(!!v)}
              />
              <Label htmlFor="include-summary" className="text-sm">Credential summary report</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-lhl234"
                checked={includeLHL234}
                onCheckedChange={(v) => setIncludeLHL234(!!v)}
              />
              <Label htmlFor="include-lhl234" className="text-sm">
                LHL234 Application ({completionPercentage}% complete)
              </Label>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>
                {documents.length} documents + {(includeCoverSheet ? 1 : 0) + (includeCredentialSummary ? 1 : 0) + (includeLHL234 ? 1 : 0)} supplemental files
              </span>
            </div>
          </div>

          {/* Progress */}
          {exporting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 100 ? 'Compiling portfolio...' : 'Done!'}
              </p>
            </div>
          )}

          {/* Export button */}
          <Button
            className="w-full btn-primary-gradient"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download ZIP Portfolio
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
