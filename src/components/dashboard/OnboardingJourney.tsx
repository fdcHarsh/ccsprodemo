import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircle,
  Upload,
  ShieldCheck,
  FileText,
  Check,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  complete: boolean;
  route: string;
  cta: string;
}

interface OnboardingJourneyProps {
  providerName: string;
  documentCount: number;
  profileCompletion: number;
  hasGeneratedPacket: boolean;
}

export function OnboardingJourney({
  providerName,
  documentCount,
  profileCompletion,
  hasGeneratedPacket,
}: OnboardingJourneyProps) {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleLHL234Upload = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setUploading(false);
    setUploadSuccess(true);
    setTimeout(() => navigate('/profile'), 1500);
  };

  // 4-step journey (removed "Share with your group")
  const steps: JourneyStep[] = [
    {
      id: 1,
      title: 'Upload your LHL234 / TSCA to get started',
      description: 'Upload your Texas credentialing application to auto-populate your profile',
      icon: Upload,
      complete: profileCompletion >= 90,
      route: '/profile',
      cta: 'Upload',
    },
    {
      id: 2,
      title: 'Upload your documents',
      description: 'RN License, CRNA Certification, DEA certificate, liability insurance',
      icon: Upload,
      complete: documentCount >= 4,
      route: '/documents',
      cta: 'Upload Documents',
    },
    {
      id: 3,
      title: 'Set up CAQH',
      description: 'Track your CAQH ProView attestation status',
      icon: ShieldCheck,
      complete: false,
      route: '/caqh',
      cta: 'Manage CAQH',
    },
    {
      id: 4,
      title: 'Generate your credentialing packet',
      description: 'Download a payer-ready credential packet from your profile',
      icon: FileText,
      complete: hasGeneratedPacket,
      route: '/packet',
      cta: 'Create Packet',
    },
  ];

  const currentStep = steps.findIndex((s) => !s.complete);
  const completedCount = steps.filter((s) => s.complete).length;
  const allComplete = completedCount === steps.length;

  return (
    <Card className="overflow-hidden">
      <div className="gradient-primary px-6 py-5">
        <h2 className="text-lg font-semibold text-primary-foreground">
          {allComplete
            ? `Great work, ${providerName || 'there'}! You're all set.`
            : `Welcome back, ${providerName || 'there'}. Let's get you credentialed.`}
        </h2>
        <p className="text-sm text-primary-foreground/80 mt-1">
          {allComplete
            ? 'All steps complete — your packets are ready to share.'
            : `${completedCount} of ${steps.length} steps complete`}
        </p>
        <div className="flex gap-1.5 mt-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-colors',
                step.complete ? 'bg-white' : 'bg-white/25'
              )}
            />
          ))}
        </div>
      </div>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {steps.map((step, i) => {
            const isCurrent = i === currentStep;
            const Icon = step.icon;
            const isFirstStep = step.id === 1;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 transition-colors',
                  isCurrent && 'bg-primary/5',
                  step.complete && 'opacity-70'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    step.complete
                      ? 'border-success bg-success/10'
                      : isCurrent
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/30 bg-muted/50'
                  )}
                >
                  {step.complete ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        isCurrent ? 'text-primary' : 'text-muted-foreground/50'
                      )}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.complete
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                  {isFirstStep && uploading && (
                    <div className="flex items-center gap-2 mt-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs font-medium">Extracting data from your LHL234...</span>
                    </div>
                  )}
                  {isFirstStep && uploadSuccess && (
                    <p className="text-xs font-medium text-success mt-2">
                      ✓ Profile data extracted successfully
                    </p>
                  )}
                </div>

                {isCurrent && !step.complete && (
                  <Button
                    size="sm"
                    className="btn-primary-gradient shrink-0"
                    onClick={isFirstStep ? handleLHL234Upload : () => navigate(step.route)}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>
                        {step.cta}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                )}

                {step.complete && (
                  <span className="status-badge status-current text-xs shrink-0">Done</span>
                )}

                {!isCurrent && !step.complete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-muted-foreground"
                    onClick={() => navigate(step.route)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
