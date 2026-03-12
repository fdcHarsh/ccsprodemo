import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { ShieldAlert, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CAQHReattestationAlertProps {
  attestationDate: string;
  expiryDate: string;
  status: 'attested' | 'not-attested' | 'pending';
}

const CAQH_CYCLE_DAYS = 120;

export function CAQHReattestationAlert({
  attestationDate,
  expiryDate,
  status,
}: CAQHReattestationAlertProps) {
  const navigate = useNavigate();

  const alertData = useMemo(() => {
    // Calculate next due date from attestation date + 120 days, or use explicit expiry
    let nextDue: Date;
    if (expiryDate) {
      nextDue = new Date(expiryDate);
    } else if (attestationDate) {
      nextDue = addDays(new Date(attestationDate), CAQH_CYCLE_DAYS);
    } else {
      return null; // No dates set
    }

    const now = new Date();
    const daysLeft = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const showAlert = daysLeft <= 30 || status === 'not-attested';

    return { nextDue, daysLeft, showAlert };
  }, [attestationDate, expiryDate, status]);

  if (!alertData || !alertData.showAlert) return null;

  const { nextDue, daysLeft } = alertData;
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 14;

  return (
    <Card
      className={cn(
        'border-2 transition-colors',
        isExpired
          ? 'border-destructive/40 bg-destructive/5'
          : isUrgent
          ? 'border-warning/40 bg-warning/5'
          : 'border-warning/20 bg-warning/5'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
              isExpired ? 'bg-destructive/10' : 'bg-warning/10'
            )}
          >
            <ShieldAlert
              className={cn('h-5 w-5', isExpired ? 'text-destructive' : 'text-warning')}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">
              {isExpired
                ? 'CAQH Attestation Expired'
                : `CAQH Re-Attestation Due in ${daysLeft} Days`}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isExpired
                ? `Expired on ${format(nextDue, 'MMM d, yyyy')}. A lapsed attestation delays all payer enrollments.`
                : `Due by ${format(nextDue, 'MMM d, yyyy')}. CAQH requires re-attestation every 120 days. Log in to ProView to confirm your information is current.`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" className="btn-primary-gradient text-xs h-7" asChild>
                <a href="https://proview.caqh.org" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Attest Now
                </a>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() => navigate('/caqh')}
              >
                Update Status
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
