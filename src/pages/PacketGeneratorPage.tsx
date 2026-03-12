import { useState, useRef, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import {
  FileText,
  ClipboardList,
  Check,
  Download,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Eraser,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Package,
  FileArchive,
  Eye,
  Paperclip,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useCredits } from '@/contexts/CreditsContext';
import { useLHL234Profile } from '@/hooks/useLHL234Profile';
import { generateLHL234PDF } from '@/lib/generateLHL234PDF';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PreFlightCheckDialog } from '@/components/PreFlightCheckDialog';
import { CredentialingTooltip } from '@/components/CredentialingTooltip';

type PacketMode = null | 'tsca' | 'custom' | 'lhl234';

function getProfileFields(
  profile: ReturnType<typeof useLHL234Profile>['profile']
) {
  const fullName = [
    profile.individualInfo.firstName,
    profile.individualInfo.lastName,
  ]
    .filter(Boolean)
    .join(' ');
  return {
    fullName: fullName || 'Provider Name',
    npiNumber: profile.licenses.providerNumbers.npi,
    deaNumber: profile.licenses.deaRegistration.deaNumber,
    stateLicenseNumber: profile.licenses.stateLicenses[0]?.licenseNumber || '',
    specialty: profile.specialtyInfo.primarySpecialty.specialty,
    practiceName: profile.workHistory.currentPractice.employerName,
    practicePhone: profile.individualInfo.homePhone,
    email: profile.individualInfo.email,
    practiceAddress: profile.workHistory.currentPractice.address,
    practiceCity: profile.workHistory.currentPractice.city,
    practiceState: profile.workHistory.currentPractice.state,
    practiceZip: profile.workHistory.currentPractice.postalCode,
  };
}

export default function PacketGeneratorPage() {
  const { documents } = useDocuments();
  const { profile: lhl234Profile, completionPercentage } = useLHL234Profile();
  const { credits, purchaseCredits, useCredit } = useCredits();
  const providerInfo = getProfileFields(lhl234Profile);

  const [mode, setMode] = useState<PacketMode>(null);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const sigRef = useRef<SignatureCanvas>(null);

  // PDF Preview state
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewGenerating, setPreviewGenerating] = useState(false);

  // Custom mode state
  const [selectedCustomDocs, setSelectedCustomDocs] = useState<string[]>([]);
  const [includeLHL234InCustom, setIncludeLHL234InCustom] = useState(false);

  // LHL234 mode state
  const [lhl234SignType, setLhl234SignType] = useState<'signed' | 'unsigned'>('signed');

  // Check for missing disclosure attachments
  const missingDisclosureAttachments = useMemo(() => {
    return lhl234Profile.disclosures.questions.filter(
      q => q.answer === 'Yes' && (!q.attachments || q.attachments.length === 0)
    );
  }, [lhl234Profile.disclosures.questions]);

  const clearSignature = () => sigRef.current?.clear();

  const resetAll = () => {
    setMode(null);
    setStep(1);
    setGenerated(false);
    setSelectedCustomDocs([]);
    setIncludeLHL234InCustom(false);
    setLhl234SignType('signed');
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
    sigRef.current?.clear();
  };

  // Generate PDF preview (free - no credit used)
  const generatePreviewPDF = async () => {
    setPreviewGenerating(true);
    try {
      const sigData =
        sigRef.current && !sigRef.current.isEmpty()
          ? sigRef.current.toDataURL()
          : undefined;
      
      // Generate PDF in memory for preview
      const doc = new jsPDF();
      await generateLHL234ContentForPreview(doc, lhl234Profile, sigData, lhl234SignType === 'signed');
      
      // Create blob URL for preview
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      setPdfPreviewUrl(url);
      setPdfPreviewOpen(true);
    } catch (e) {
      console.error('Preview generation failed', e);
      toast.error('Failed to generate preview. Please try again.');
    }
    setPreviewGenerating(false);
  };

  const toggleCustomDoc = (id: string) => {
    setSelectedCustomDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const totalSteps = mode === 'lhl234' ? 3 : 4;

  const canProceed = () => {
    if (mode === 'custom') {
      if (step === 1) return selectedCustomDocs.length > 0 || includeLHL234InCustom;
    }
    if (mode === 'tsca') {
      if (step === 1) return true; // All docs auto-selected
    }
    return true;
  };

  const getSelectedDocNames = (): string[] => {
    if (mode === 'custom') {
      const docNames = documents
        .filter((d) => selectedCustomDocs.includes(d.id))
        .map((d) => d.name);
      if (includeLHL234InCustom) {
        docNames.unshift('LHL234 Application (TSCA)');
      }
      return docNames;
    }
    if (mode === 'tsca') {
      const docNames = documents.map((d) => d.name);
      docNames.unshift('LHL234 Application (TSCA)');
      // Add disclosure attachments
      lhl234Profile.disclosures.questions.forEach(q => {
        if (q.answer === 'Yes' && q.attachments && q.attachments.length > 0) {
          q.attachments.forEach(a => {
            docNames.push(`Disclosure Q${q.questionNumber}: ${a.filename}`);
          });
        }
      });
      return docNames;
    }
    return [];
  };

  const handlePurchaseCredits = (count: number) => {
    purchaseCredits(count);
    setPurchaseDialogOpen(false);
    toast.success(`${count} credit${count > 1 ? 's' : ''} purchased! You can now generate packets.`);
  };

  const handleConfirmGenerate = () => {
    if (credits <= 0) {
      setPurchaseDialogOpen(true);
      return;
    }
    setPreflightOpen(true);
  };

  const generateZIP = async () => {
    if (!useCredit()) {
      toast.error('No credits available. Please purchase credits first.');
      return;
    }

    setGenerating(true);

    try {
      const zip = new JSZip();
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const providerSlug = providerInfo.fullName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

      // Generate LHL234 PDF as multi-page
      const lhl234Doc = new jsPDF();
      await generateLHL234Content(lhl234Doc, lhl234Profile, sigRef.current);
      const lhl234Blob = lhl234Doc.output('blob');
      zip.file('LHL234_Application.pdf', lhl234Blob);

      // Add cover sheet
      const coverDoc = new jsPDF();
      generateCoverSheet(coverDoc, providerInfo, getSelectedDocNames());
      const coverBlob = coverDoc.output('blob');
      zip.file('00_Cover_Sheet.pdf', coverBlob);

      // Add document placeholders (in real app, would add actual uploaded files)
      if (mode === 'tsca') {
        documents.forEach((doc, idx) => {
          // Create placeholder PDF for each document
          const docPdf = new jsPDF();
          docPdf.setFontSize(16);
          docPdf.text(doc.name, 20, 30);
          docPdf.setFontSize(10);
          docPdf.text(`Document placeholder - ${doc.name}`, 20, 50);
          docPdf.text(`Category: ${doc.category}`, 20, 60);
          docPdf.text(`Status: ${doc.status}`, 20, 70);
          if (doc.expirationDate) {
            docPdf.text(`Expiration: ${doc.expirationDate}`, 20, 80);
          }
          const filename = `${String(idx + 1).padStart(2, '0')}_${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          zip.file(filename, docPdf.output('blob'));
        });

        // Add disclosure attachments
        lhl234Profile.disclosures.questions.forEach(q => {
          if (q.answer === 'Yes' && q.attachments && q.attachments.length > 0) {
            q.attachments.forEach((a, aIdx) => {
              const attachPdf = new jsPDF();
              attachPdf.setFontSize(14);
              attachPdf.text(`Disclosure Question #${q.questionNumber} - Attachment`, 20, 30);
              attachPdf.setFontSize(10);
              attachPdf.text(`File: ${a.filename}`, 20, 50);
              attachPdf.text(`Uploaded: ${format(new Date(a.uploadedAt), 'MMMM d, yyyy')}`, 20, 60);
              attachPdf.text('(Placeholder - actual file would be included)', 20, 80);
              const filename = `Attachment_G_Q${q.questionNumber}_${aIdx + 1}.pdf`;
              zip.file(filename, attachPdf.output('blob'));
            });
          }
        });
      } else if (mode === 'custom') {
        const selectedDocs = documents.filter(d => selectedCustomDocs.includes(d.id));
        selectedDocs.forEach((doc, idx) => {
          const docPdf = new jsPDF();
          docPdf.setFontSize(16);
          docPdf.text(doc.name, 20, 30);
          docPdf.setFontSize(10);
          docPdf.text(`Document placeholder - ${doc.name}`, 20, 50);
          const filename = `${String(idx + 1).padStart(2, '0')}_${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          zip.file(filename, docPdf.output('blob'));
        });
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFilename = mode === 'tsca'
        ? `TSCA_Packet_${providerSlug}_${dateStr}.zip`
        : `Custom_Packet_${providerSlug}_${dateStr}.zip`;

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      localStorage.setItem('ccspro_has_generated_packet', 'true');
      setGenerating(false);
      setGenerated(true);
      toast.success('Packet generated and downloaded!');
    } catch (e) {
      console.error('ZIP generation failed', e);
      setGenerating(false);
      toast.error('Failed to generate packet. Please try again.');
    }
  };

  const generateSingleLHL234 = async () => {
    if (!useCredit()) {
      toast.error('No credits available. Please purchase credits first.');
      return;
    }

    setGenerating(true);
    try {
      const sigData =
        sigRef.current && !sigRef.current.isEmpty()
          ? sigRef.current.toDataURL()
          : undefined;
      await generateLHL234PDF(lhl234Profile, {
        signed: lhl234SignType === 'signed',
        signatureData: sigData,
      });
      localStorage.setItem('ccspro_has_generated_packet', 'true');
      setGenerated(true);
      toast.success('LHL234 Application downloaded!');
    } catch (e) {
      console.error('LHL234 generation failed', e);
      toast.error('Failed to generate LHL234. Please try again.');
    }
    setGenerating(false);
  };

  // ────── Landing Screen ──────
  if (mode === null) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Packet</h1>
            <p className="text-muted-foreground">
              Choose how you'd like to generate your{' '}
              <CredentialingTooltip term="Credentialing Packet">
                credentialing packet
              </CredentialingTooltip>
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{credits} Credit{credits !== 1 ? 's' : ''}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPurchaseDialogOpen(true)}
              className="ml-2"
            >
              Buy Credits
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Option 1: TSCA Packet */}
          <Card
            className="card-hover cursor-pointer border-2 hover:border-primary/50 transition-colors"
            onClick={() => setMode('tsca')}
          >
            <CardHeader className="text-center pb-2">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">
                <CredentialingTooltip term="TSCA">TSCA</CredentialingTooltip> Packet
              </CardTitle>
              <CardDescription>
                Complete Texas Standardized Credentialing Application package with all your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileArchive className="h-4 w-4" />
                    <span>Downloads as ZIP file</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4" />
                    <span>LHL234 + {documents.length} documents</span>
                  </div>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded text-xs text-amber-800 dark:text-amber-200 font-medium">
                  <strong>Cost:</strong> 1 Credit ($69)
                </div>
                <Button
                  className="btn-primary-gradient w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode('tsca');
                  }}
                >
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Custom */}
          <Card
            className="card-hover cursor-pointer border-2 hover:border-primary/50 transition-colors"
            onClick={() => setMode('custom')}
          >
            <CardHeader className="text-center pb-2">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-7 w-7 text-accent" />
              </div>
              <CardTitle className="text-lg">Custom Packet</CardTitle>
              <CardDescription>
                Manually select which documents to include in your packet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {documents.length} documents available in your vault
                </p>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded text-xs text-amber-800 dark:text-amber-200 font-medium">
                  <strong>Cost:</strong> 1 Credit ($69)
                </div>
                <Button
                  className="btn-primary-gradient w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode('custom');
                  }}
                >
                  Select Documents <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Option 3: Single LHL234 */}
          <Card
            className="card-hover cursor-pointer border-2 hover:border-primary/50 transition-colors"
            onClick={() => setMode('lhl234')}
          >
            <CardHeader className="text-center pb-2">
              <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="h-7 w-7 text-success" />
              </div>
              <CardTitle className="text-lg">
                Single PDF (<CredentialingTooltip term="LHL234">LHL234</CredentialingTooltip>)
              </CardTitle>
              <CardDescription>
                Download just the Texas Standardized Credentialing Application form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <RadioGroup
                  value={lhl234SignType}
                  onValueChange={(v) => setLhl234SignType(v as 'signed' | 'unsigned')}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="signed" id="lhl-signed" />
                    <Label htmlFor="lhl-signed" className="text-sm">
                      Signed — includes e-signature
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="unsigned" id="lhl-unsigned" />
                    <Label htmlFor="lhl-unsigned" className="text-sm">
                      Unsigned — blank signature line
                    </Label>
                  </div>
                </RadioGroup>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded text-xs text-amber-800 dark:text-amber-200 font-medium">
                  <strong>Cost:</strong> 1 Credit ($69)
                </div>
                <Button
                  className="btn-primary-gradient w-full"
                  onClick={() => setMode('lhl234')}
                >
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Credits Dialog */}
        <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Purchase Credits
              </DialogTitle>
              <DialogDescription>
                Credits are used to generate credentialing packets. Each packet generation uses 1 credit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePurchaseCredits(1)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">1 Credit</p>
                    <p className="text-sm text-muted-foreground">Single packet generation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">$69</p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:border-primary transition-colors border-primary/50"
                onClick={() => handlePurchaseCredits(5)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">5 Credits</p>
                    <p className="text-sm text-muted-foreground">Save $46 (13% off)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">$299</p>
                    <p className="text-xs text-muted-foreground line-through">$345</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ────── Step Flow ──────
  const renderStepContent = () => {
    // Step 1: Document Selection (TSCA/Custom)
    if (step === 1 && (mode === 'tsca' || mode === 'custom')) {
      if (mode === 'tsca') {
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h3 className="font-semibold mb-2">TSCA Packet Contents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This packet will include your LHL234 application and all documents from your vault.
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="flex-1 text-sm font-medium">LHL234 Application (TSCA)</span>
                <span className="text-xs text-primary">Required</span>
              </div>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="flex-1 text-sm">{doc.name}</span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    doc.status === 'current' && 'bg-success/10 text-success',
                    doc.status === 'expiring' && 'bg-warning/10 text-warning',
                    doc.status === 'expired' && 'bg-destructive/10 text-destructive'
                  )}>
                    {doc.status}
                  </span>
                </div>
              ))}
              {/* Show disclosure attachments if any */}
              {lhl234Profile.disclosures.questions.some(q => q.answer === 'Yes' && q.attachments && q.attachments.length > 0) && (
                <>
                  <div className="pt-2 mt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      Disclosure Attachments (Attachment G)
                    </p>
                  </div>
                  {lhl234Profile.disclosures.questions.map(q => (
                    q.answer === 'Yes' && q.attachments && q.attachments.map(a => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
                      >
                        <Paperclip className="h-4 w-4 text-warning" />
                        <span className="flex-1 text-sm">Q{q.questionNumber}: {a.filename}</span>
                      </div>
                    ))
                  ))}
                </>
              )}
            </div>

            {missingDisclosureAttachments.length > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-foreground">Missing Disclosure Attachments</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Questions {missingDisclosureAttachments.map(q => `#${q.questionNumber}`).join(', ')} answered "Yes" but have no supporting documents. 
                      You can add them in Profile Builder → Disclosures.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      // Custom mode
      return (
        <div className="space-y-4">
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {/* LHL234 option */}
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                includeLHL234InCustom ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 hover:bg-muted'
              )}
              onClick={() => setIncludeLHL234InCustom(!includeLHL234InCustom)}
            >
              <Checkbox
                checked={includeLHL234InCustom}
                onCheckedChange={(checked) => setIncludeLHL234InCustom(!!checked)}
              />
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="flex-1 text-sm font-medium">LHL234 Application (TSCA)</span>
            </div>

            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedCustomDocs.includes(doc.id) ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 hover:bg-muted'
                )}
                onClick={() => toggleCustomDoc(doc.id)}
              >
                <Checkbox
                  checked={selectedCustomDocs.includes(doc.id)}
                  onCheckedChange={() => toggleCustomDoc(doc.id)}
                />
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{doc.name}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  doc.status === 'current' && 'bg-success/10 text-success',
                  doc.status === 'expiring' && 'bg-warning/10 text-warning',
                  doc.status === 'expired' && 'bg-destructive/10 text-destructive'
                )}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm">
              <strong>{selectedCustomDocs.length + (includeLHL234InCustom ? 1 : 0)}</strong> document(s) selected
            </p>
          </div>
        </div>
      );
    }

    // Step 1 for LHL234: Signature
    if (step === 1 && mode === 'lhl234') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Profile Completion: {completionPercentage}%</h3>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Your LHL234 will be pre-filled with your profile data.
            </p>
          </div>

          {lhl234SignType === 'signed' && (
            <div className="space-y-2">
              <Label>E-Signature</Label>
              <div className="border rounded-lg p-2 bg-white">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="black"
                  canvasProps={{
                    className: 'w-full h-32',
                    style: { width: '100%', height: '128px' },
                  }}
                />
              </div>
              <Button variant="outline" size="sm" onClick={clearSignature}>
                <Eraser className="mr-2 h-4 w-4" />
                Clear Signature
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Step 2: Provider Info Review (TSCA/Custom)
    if (step === 2 && (mode === 'tsca' || mode === 'custom')) {
      return (
        <div className="space-y-4">
          <div className="grid gap-3">
            {Object.entries(providerInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm font-medium">{value || '—'}</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              This information will appear on your packet cover sheet.
            </p>
          </div>
        </div>
      );
    }

    // Step 2 for LHL234: Preview
    if (step === 2 && mode === 'lhl234') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="font-semibold mb-2">Preview Your LHL234</h3>
            <p className="text-sm text-muted-foreground">
              Review your application before generating. Previewing is <strong>free</strong> — you'll only be charged when you download.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={generatePreviewPDF}
            disabled={previewGenerating}
          >
            {previewGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Preview...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Open PDF Preview (Free)
              </>
            )}
          </Button>

          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              Profile Completion: <strong>{completionPercentage}%</strong> • 
              Signature: <strong>{lhl234SignType === 'signed' ? 'Included' : 'Blank'}</strong>
            </p>
          </div>
        </div>
      );
    }

    // Step 3 for LHL234: Generate
    if (step === 3 && mode === 'lhl234') {
      return generated ? (
        <div className="space-y-4 text-center py-8">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold">LHL234 Downloaded!</h3>
          <p className="text-muted-foreground">
            Your Texas Standardized Credentialing Application has been downloaded.
          </p>
          <Button variant="outline" onClick={resetAll}>
            Create Another Packet
          </Button>
        </div>
      ) : (
        <div className="space-y-4 text-center py-8">
          <ClipboardList className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-lg font-semibold">Ready to Generate</h3>
          <p className="text-muted-foreground">
            Your LHL234 application will be generated with {lhl234SignType === 'signed' ? 'your e-signature' : 'a blank signature line'}.
          </p>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 inline-block text-left">
            <p className="text-sm">
              <strong>⚠️ Credit Usage:</strong> This will use <strong>1 credit</strong> ($69) from your balance.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You currently have {credits} credit(s). After generation: {credits - 1} credit(s) remaining.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={generatePreviewPDF} disabled={previewGenerating}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Again
            </Button>
            <Button
              className="btn-primary-gradient"
              onClick={() => {
                if (credits <= 0) {
                  setPurchaseDialogOpen(true);
                  return;
                }
                generateSingleLHL234();
              }}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download LHL234
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    // Step 3: Signature (TSCA/Custom)
    if (step === 3 && (mode === 'tsca' || mode === 'custom')) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>E-Signature</Label>
            <div className="border rounded-lg p-2 bg-white">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{
                  className: 'w-full h-32',
                  style: { width: '100%', height: '128px' },
                }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearSignature}>
              <Eraser className="mr-2 h-4 w-4" />
              Clear Signature
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your signature will be added to the LHL234 application and cover sheet.
          </p>
        </div>
      );
    }

    // Step 4: Preview & Generate (TSCA/Custom)
    if (step === 4 && (mode === 'tsca' || mode === 'custom')) {
      const docNames = getSelectedDocNames();
      return generated ? (
        <div className="space-y-4 text-center py-8">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold">Packet Generated!</h3>
          <p className="text-muted-foreground">
            Your {mode === 'tsca' ? 'TSCA' : 'Custom'} packet has been downloaded as a ZIP file.
          </p>
          <Button variant="outline" onClick={resetAll}>
            Create Another Packet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Preview & Confirm</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Review the documents that will be included. You can preview the LHL234 before generating.
            </p>
          </div>

          {/* Free LHL234 Preview Button */}
          {(mode === 'tsca' || includeLHL234InCustom) && (
            <Button
              variant="outline"
              className="w-full"
              onClick={generatePreviewPDF}
              disabled={previewGenerating}
            >
              {previewGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview LHL234 Application (Free)
                </>
              )}
            </Button>
          )}

          <div className="p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <FileArchive className="h-5 w-5 text-success" />
              <h3 className="font-semibold">Packet Contents</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {docNames.length} documents will be included in your ZIP file:
            </p>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {docNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <span>{name}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-sm">
              <strong>⚠️ Credit Usage:</strong> Generating this packet will use <strong>1 credit</strong> from your balance.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You currently have {credits} credit(s). After generation: {credits - 1} credit(s) remaining.
            </p>
          </div>

          <Button
            className="btn-primary-gradient w-full"
            onClick={handleConfirmGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate & Download ZIP
              </>
            )}
          </Button>
        </div>
      );
    }

    return null;
  };

  const getStepTitle = () => {
    if (mode === 'lhl234') {
      if (step === 1) return 'Add Signature';
      if (step === 2) return 'Preview';
      return 'Generate';
    }
    switch (step) {
      case 1: return 'Select Documents';
      case 2: return 'Review Information';
      case 3: return 'Add Signature';
      case 4: return 'Preview & Generate';
      default: return '';
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'tsca': return 'TSCA Packet';
      case 'custom': return 'Custom Packet';
      case 'lhl234': return 'Single PDF (LHL234)';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Button variant="ghost" size="sm" onClick={resetAll} className="h-auto p-0">
              Create Packet
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span>{getModeTitle()}</span>
          </div>
          <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
        </div>
        {mode !== 'lhl234' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
            <CreditCard className="h-4 w-4" />
            {credits} Credit{credits !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              i + 1 <= step ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation (except for final generate steps) */}
      {!(mode === 'lhl234' && step === 3) && !(step === 4 && (mode === 'tsca' || mode === 'custom')) && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => (step === 1 ? resetAll() : setStep(step - 1))}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {step === 1 ? 'Back to Options' : 'Back'}
          </Button>
          <Button
            className="btn-primary-gradient"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pre-flight Check Dialog */}
      <PreFlightCheckDialog
        open={preflightOpen}
        onOpenChange={setPreflightOpen}
        packetName={getModeTitle()}
        documents={getSelectedDocNames()}
        onComplete={() => {
          setPreflightOpen(false);
          generateZIP();
        }}
        missingDisclosureAttachments={missingDisclosureAttachments}
      />

      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              LHL234 Preview (Free)
            </DialogTitle>
            <DialogDescription>
              Review your application before generating. This preview is free — you'll only be charged when you download.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 h-full">
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-[55vh] border rounded-lg"
                title="PDF Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Credits Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Purchase Credits
            </DialogTitle>
            <DialogDescription>
              Credits are used to generate credentialing packets. Each packet generation uses 1 credit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handlePurchaseCredits(1)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">1 Credit</p>
                  <p className="text-sm text-muted-foreground">Single packet generation</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">$69</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:border-primary transition-colors border-primary/50"
              onClick={() => handlePurchaseCredits(5)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">5 Credits</p>
                  <p className="text-sm text-muted-foreground">Save $46 (13% off)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">$299</p>
                  <p className="text-xs text-muted-foreground line-through">$345</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to generate LHL234 content
async function generateLHL234Content(
  doc: jsPDF,
  profile: ReturnType<typeof useLHL234Profile>['profile'],
  sigCanvas: SignatureCanvas | null
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Cover page
  doc.setFillColor(31, 71, 136);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Texas Standardized Credentialing Application', pageWidth / 2, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.text('LHL234 Form', pageWidth / 2, 42, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  let y = 70;
  
  const fullName = [profile.individualInfo.firstName, profile.individualInfo.lastName].filter(Boolean).join(' ');
  doc.text(`Provider: ${fullName}`, 20, y);
  y += 10;
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 20, y);

  // Add signature if available
  if (sigCanvas && !sigCanvas.isEmpty()) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Attestation & Signature', 20, 25);
    doc.setFontSize(10);
    doc.text('I hereby attest that all information provided is true and accurate.', 20, 40);
    doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 55);
    const sigData = sigCanvas.toDataURL();
    doc.addImage(sigData, 'PNG', 20, 65, 80, 30);
  }
}

// Helper function to generate cover sheet
function generateCoverSheet(
  doc: jsPDF,
  providerInfo: ReturnType<typeof getProfileFields>,
  documents: string[]
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(31, 71, 136);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Credentialing Packet', pageWidth / 2, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Cover Sheet', pageWidth / 2, 42, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Provider Information', 20, 70);
  
  doc.setFontSize(10);
  let y = 85;
  doc.text(`Name: ${providerInfo.fullName}`, 25, y); y += 8;
  doc.text(`NPI: ${providerInfo.npiNumber}`, 25, y); y += 8;
  doc.text(`DEA: ${providerInfo.deaNumber}`, 25, y); y += 8;
  doc.text(`Specialty: ${providerInfo.specialty}`, 25, y); y += 8;
  doc.text(`Practice: ${providerInfo.practiceName}`, 25, y); y += 8;
  doc.text(`Email: ${providerInfo.email}`, 25, y); y += 15;

  doc.setFontSize(14);
  doc.text('Documents Included', 20, y); y += 10;
  
  doc.setFontSize(10);
  documents.forEach((docName, idx) => {
    doc.text(`${idx + 1}. ${docName}`, 25, y);
    y += 7;
    if (y > 270) {
      doc.addPage();
      y = 25;
    }
  });

  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 20, 280);
}

// Helper function to generate LHL234 preview content (no signature canvas required)
function generateLHL234ContentForPreview(
  doc: jsPDF,
  profile: ReturnType<typeof useLHL234Profile>['profile'],
  signatureData: string | undefined,
  includeSig: boolean
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 0;

  // Cover page
  doc.setFillColor(31, 71, 136);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('TDI · Texas Department of Insurance', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Texas Standardized Credentialing', pageWidth / 2, 35, { align: 'center' });
  doc.text('Application (LHL234)', pageWidth / 2, 48, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  doc.setTextColor(0, 0, 0);
  y = 80;
  const fullName = [profile.individualInfo.firstName, profile.individualInfo.middleName, profile.individualInfo.lastName]
    .filter(Boolean)
    .join(' ');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(fullName || 'Provider Name', pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 10;
  doc.text(`NPI: ${profile.licenses.providerNumbers.npi || '—'}`, pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, y, { align: 'center' });

  // Section 1: Individual Information
  doc.addPage();
  y = 20;
  doc.setFillColor(31, 71, 136);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Section 1 — Individual Information', margin + 4, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 14;

  const info = profile.individualInfo;
  doc.setFontSize(9);
  const fieldValue = (label: string, value: string) => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label.toUpperCase(), margin + 2, y);
    y += 3.5;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(value || '—', margin + 2, y);
    y += 7;
  };

  fieldValue('Full Name', fullName);
  fieldValue('Home Address', `${info.homeAddress}, ${info.homeCity}, ${info.homeState} ${info.homePostalCode}`);
  fieldValue('Email', info.email);
  fieldValue('Phone', info.homePhone);
  fieldValue('Date of Birth', info.dateOfBirth);

  // Section 2: Licenses
  y += 5;
  doc.setFillColor(31, 71, 136);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Section 3 — Licenses & Certificates', margin + 4, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 14;

  fieldValue('NPI', profile.licenses.providerNumbers.npi);
  fieldValue('DEA Number', profile.licenses.deaRegistration.deaNumber || 'Not provided (optional)');
  if (profile.licenses.stateLicenses[0]?.licenseNumber) {
    fieldValue('State License', `${profile.licenses.stateLicenses[0].licenseNumber} (${profile.licenses.stateLicenses[0].state})`);
  }

  // Specialty
  y += 5;
  doc.setFillColor(31, 71, 136);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Section 4 — Specialty Information', margin + 4, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 14;

  fieldValue('Primary Specialty', profile.specialtyInfo.primarySpecialty.specialty);
  fieldValue('Board Certified', profile.specialtyInfo.primarySpecialty.boardCertified);

  // Signature page
  doc.addPage();
  y = 30;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Attestation & Signature', pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  y += 15;
  doc.setFontSize(9);
  const attestation = 'I hereby certify that all information provided in this application is true, correct, and complete to the best of my knowledge.';
  const lines = doc.splitTextToSize(attestation, pageWidth - margin * 2);
  doc.text(lines, margin, y);
  y += lines.length * 5 + 10;

  doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, margin, y);
  y += 15;

  if (includeSig && signatureData) {
    doc.text('Signature:', margin, y);
    y += 5;
    doc.addImage(signatureData, 'PNG', margin, y, 80, 30);
  } else {
    doc.text('Signature: _________________________________', margin, y);
  }
}
