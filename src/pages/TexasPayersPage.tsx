import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  X,
  Download,
  FileText,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePayers } from '@/contexts/PayersContext';
import { useLHL234Profile } from '@/hooks/useLHL234Profile';
import { useDynamicChecklists } from '@/hooks/useDynamicChecklists';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { PayerChecklistItem } from '@/lib/payerChecklists';

// Map payer names to checklist keys
const payerToChecklistKey: Record<string, string> = {
  'Blue Cross Blue Shield of Texas': 'bcbs-tx',
  'UnitedHealthcare': 'uhc',
  'Aetna': 'aetna',
  'Cigna': 'cigna',
  'Humana': 'humana',
  'Texas Medicaid': 'tx-medicaid',
  'Medicare (PECOS)': 'medicare-pecos',
  'Bexar County': 'bexar-county',
};

function getProfileFields(profile: ReturnType<typeof useLHL234Profile>['profile']) {
  const fullName = [profile.individualInfo.firstName, profile.individualInfo.lastName].filter(Boolean).join(' ');
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

export default function TexasPayersPage() {
  const { payers } = usePayers();
  const { profile: lhl234Profile } = useLHL234Profile();
  const { getDynamicChecklist, getProgress: getDynProgress } = useDynamicChecklists();
  const navigate = useNavigate();
  const providerInfo = getProfileFields(lhl234Profile);
  const [selectedPayer, setSelectedPayer] = useState<typeof payers[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleViewDetails = (payer: typeof payers[0]) => {
    setSelectedPayer(payer);
    setDetailsOpen(true);
  };

  const getChecklist = (payerName: string): PayerChecklistItem[] => {
    const key = payerToChecklistKey[payerName] || 'texas-standard';
    return getDynamicChecklist(key);
  };

  const getProgress = (payerName: string) => {
    const key = payerToChecklistKey[payerName] || 'texas-standard';
    return getDynProgress(key);
  };

  const handleDownloadPacket = async () => {
    if (!selectedPayer) return;
    setDownloading(true);

    const checklist = getChecklist(selectedPayer.name);
    const availableDocs = checklist.filter(d => d.status === 'current' || d.status === 'expiring');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cover Page
    doc.setFillColor(31, 71, 136);
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('Credential Packet', pageWidth / 2, 35, { align: 'center' });
    doc.setFontSize(14);
    doc.text(providerInfo.fullName, pageWidth / 2, 48, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Payer: ${selectedPayer.name}`, 20, 80);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 90);
    doc.text(`Documents Included: ${availableDocs.length}`, 20, 100);

    // Table of Contents
    doc.addPage();
    doc.setFontSize(18);
    doc.text('Documents Included', 20, 25);
    doc.setFontSize(11);
    let y = 45;
    availableDocs.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name}`, 25, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 25; }
    });

    // Provider Info
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Provider Information', 20, 25);
    doc.setFontSize(10);
    const info = [
      `Name: ${providerInfo.fullName}`, `NPI: ${providerInfo.npiNumber}`, `DEA: ${providerInfo.deaNumber}`,
      `License: ${providerInfo.stateLicenseNumber}`, `Specialty: ${providerInfo.specialty}`,
      `Practice: ${providerInfo.practiceName}`,
      `Address: ${providerInfo.practiceAddress}, ${providerInfo.practiceCity}, ${providerInfo.practiceState} ${providerInfo.practiceZip}`,
    ];
    y = 40;
    info.forEach(line => { doc.text(line, 25, y); y += 8; });

    doc.save(`${selectedPayer.name.replace(/\s+/g, '-').toLowerCase()}-credential-packet-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    setDownloading(false);
    toast.success('Credential Packet Downloaded!');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Texas Payer Workflows</h1>
        <p className="text-muted-foreground">
          Manage your credentialing with major Texas insurance payers
        </p>
      </div>

      {/* Payer Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {payers.map((payer) => {
          const progress = getProgress(payer.name);
          return (
            <Card key={payer.id} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base">{payer.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Documents Ready</span>
                      <span>{progress.available} / {progress.total}</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                  <Button
                    className="btn-primary-gradient w-full"
                    onClick={() => handleViewDetails(payer)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Packet
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payer Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              {selectedPayer?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedPayer && (
            <div className="space-y-6 py-4">
              {/* Progress */}
              {(() => {
                const progress = getProgress(selectedPayer.name);
                return (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Document Readiness</p>
                      <span className="text-sm font-semibold">{progress.available} of {progress.total} documents available</span>
                    </div>
                    <Progress value={progress.percentage} className="h-3" />
                  </div>
                );
              })()}

              {/* Document Checklist */}
              <div>
                <h3 className="font-semibold mb-3">Document Checklist</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {getChecklist(selectedPayer.name).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        item.uploaded ? 'bg-muted/50' : 'bg-destructive/5 border border-destructive/20'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.status === 'current' ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : item.status === 'expiring' ? (
                          <Clock className="h-5 w-5 text-warning" />
                        ) : (
                          <X className="h-5 w-5 text-destructive" />
                        )}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          item.status === 'current' && 'text-success',
                          item.status === 'expiring' && 'text-warning',
                          item.status === 'missing' && 'text-destructive'
                        )}
                      >
                        {item.status === 'current'
                          ? '✅ Available'
                          : item.status === 'expiring'
                          ? '⚠️ Expiring Soon'
                          : '❌ Missing'}
                      </span>
                  {item.status === 'missing' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-primary ml-2"
                      onClick={(e) => { e.stopPropagation(); navigate('/documents'); }}
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Upload
                    </Button>
                  )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <Button
                size="lg"
                className="btn-primary-gradient w-full"
                onClick={handleDownloadPacket}
                disabled={downloading}
              >
                {downloading ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Credential Packet
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
