import { format } from 'date-fns';
import {
  ExternalLink,
  Clock,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getRenewalInfo, getRecommendedStartDate } from '@/lib/renewalLinks';
import type { Credential } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface RenewalDialogProps {
  credential: Credential | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkInProgress: (id: string) => void;
  renewalStatus: Record<string, 'in-progress' | 'completed'>;
}

export function RenewalDialog({
  credential,
  open,
  onOpenChange,
  onMarkInProgress,
  renewalStatus,
}: RenewalDialogProps) {
  if (!credential) return null;

  const renewal = getRenewalInfo(credential.name);
  const status = renewalStatus[credential.id];
  const recommendedStart = renewal
    ? getRecommendedStartDate(credential.expirationDate, renewal.processingWeeks)
    : null;
  const now = new Date();
  const isOverdue = recommendedStart && now > recommendedStart;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Renew {credential.name}
          </DialogTitle>
          <DialogDescription>
            Expires {format(new Date(credential.expirationDate), 'MMMM d, yyyy')} ({credential.daysLeft} days left)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Processing time info */}
          {renewal && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
              <Clock className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{renewal.processingNote}</p>
                {recommendedStart && (
                  <p className={cn(
                    'text-xs mt-1',
                    isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                  )}>
                    <CalendarCheck className="inline h-3 w-3 mr-1" />
                    {isOverdue
                      ? `You should have started by ${format(recommendedStart, 'MMM d, yyyy')} — act now!`
                      : `Start by ${format(recommendedStart, 'MMM d, yyyy')} to ensure continuous coverage`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Current status */}
          {status && (
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-lg border text-sm font-medium',
              status === 'in-progress'
                ? 'bg-warning/5 border-warning/20 text-warning'
                : 'bg-success/5 border-success/20 text-success'
            )}>
              <RefreshCw className="h-4 w-4" />
              {status === 'in-progress' ? 'Renewal In Progress' : 'Renewal Completed'}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            {renewal?.url && (
              <Button className="w-full btn-primary-gradient" asChild>
                <a href={renewal.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to {renewal.label}
                </a>
              </Button>
            )}

            {!status && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onMarkInProgress(credential.id);
                  onOpenChange(false);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Mark Renewal as In Progress
              </Button>
            )}

            {status === 'in-progress' && (
              <Button
                variant="outline"
                className="w-full border-success/30 text-success hover:bg-success/10"
                onClick={() => {
                  onMarkInProgress(credential.id); // toggle to completed
                  onOpenChange(false);
                }}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
