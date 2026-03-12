import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  FileText,
  UserCircle,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Credential } from '@/lib/mockData';

/**
 * Processing times for common credentials — provides real-world context
 * so providers know when to start renewals.
 */
const PROCESSING_TIMES: Record<string, string> = {
  'Texas Medical License': 'TMB processing takes 4-6 weeks',
  'DEA Registration': 'DEA processing takes 6-8 weeks',
  'DEA Certificate': 'DEA processing takes 6-8 weeks',
  'Board Certification': 'Recertification takes 8-12 weeks',
  'BLS Certification': 'Walk-in classes available — 1-2 days',
  'ACLS Certification': 'Course available — 1-2 days',
  'CAQH Attestation': 'Takes 15 minutes on CAQH ProView',
  'Malpractice Insurance': 'Carrier renewal takes 1-2 weeks',
  'Hospital Privileges': 'Applications take 2-4 months',
};

interface Insight {
  id: string;
  priority: number; // lower = more urgent
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  action: string;
  route: string;
}

interface ActionableInsightsProps {
  credentials: Credential[];
  profileCompletion: number;
  incompleteSections: string[];
  missingDocsByPayer: { payer: string; missing: string[] }[];
  caqhDaysLeft: number | null;
}

export function ActionableInsights({
  credentials,
  profileCompletion,
  incompleteSections,
  missingDocsByPayer,
  caqhDaysLeft,
}: ActionableInsightsProps) {
  const navigate = useNavigate();

  const insights: Insight[] = [];

  // 1. Urgent credentials (< 30 days) with processing time context
  credentials
    .filter((c) => c.status === 'urgent')
    .forEach((cred) => {
      const processingNote = PROCESSING_TIMES[cred.name];
      insights.push({
        id: `urgent-${cred.id}`,
        priority: 1,
        icon: AlertTriangle,
        iconColor: 'text-destructive',
        bgColor: 'bg-destructive/5 border-destructive/20',
        title: `${cred.name} expires in ${cred.daysLeft} days`,
        description: processingNote
          ? `Start renewal now — ${processingNote}.`
          : `Renew immediately to avoid enrollment gaps.`,
        action: 'View Credential',
        route: '/credentials',
      });
    });

  // 2. CAQH attestation warning
  if (caqhDaysLeft !== null && caqhDaysLeft <= 30) {
    insights.push({
      id: 'caqh-warning',
      priority: 2,
      icon: ShieldAlert,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/5 border-warning/20',
      title: `CAQH attestation ${caqhDaysLeft <= 0 ? 'expired' : `expires in ${caqhDaysLeft} days`}`,
      description:
        'Log into CAQH ProView and attest now — takes 15 minutes. Lapsed attestation can delay payer enrollment.',
      action: 'Attest Now',
      route: '/caqh',
    });
  }

  // 3. Expiring credentials (30-90 days) with processing time context
  credentials
    .filter((c) => c.status === 'expiring')
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 2) // Limit to avoid overwhelming
    .forEach((cred) => {
      const processingNote = PROCESSING_TIMES[cred.name];
      insights.push({
        id: `expiring-${cred.id}`,
        priority: 3,
        icon: Clock,
        iconColor: 'text-warning',
        bgColor: 'bg-warning/5 border-warning/20',
        title: `${cred.name} expires in ${cred.daysLeft} days`,
        description: processingNote
          ? `Plan ahead — ${processingNote}.`
          : `Schedule your renewal to avoid last-minute issues.`,
        action: 'View Details',
        route: '/credentials',
      });
    });

  // 4. Incomplete profile blocking packets
  if (profileCompletion < 80 && incompleteSections.length > 0) {
    const topSections = incompleteSections.slice(0, 3).join(', ');
    insights.push({
      id: 'profile-incomplete',
      priority: 4,
      icon: UserCircle,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/5 border-primary/20',
      title: `Profile ${profileCompletion}% complete`,
      description: `These sections are blocking your packets: ${topSections}. Payers will reject applications with blank fields.`,
      action: 'Complete Profile',
      route: '/profile',
    });
  }

  // 5. Missing documents blocking specific payers
  missingDocsByPayer
    .filter((p) => p.missing.length > 0 && p.missing.length <= 5)
    .sort((a, b) => a.missing.length - b.missing.length)
    .slice(0, 2)
    .forEach((payer) => {
      insights.push({
        id: `payer-${payer.payer}`,
        priority: 5,
        icon: FileText,
        iconColor: 'text-accent',
        bgColor: 'bg-accent/5 border-accent/20',
        title: `${payer.payer}: ${payer.missing.length} document${payer.missing.length > 1 ? 's' : ''} missing`,
        description: `Upload ${payer.missing.slice(0, 3).join(', ')}${payer.missing.length > 3 ? ` and ${payer.missing.length - 3} more` : ''} to complete this packet.`,
        action: 'Upload Documents',
        route: '/documents',
      });
    });

  // Sort by priority
  insights.sort((a, b) => a.priority - b.priority);

  if (insights.length === 0) {
    return (
      <Card className="card-hover">
        <CardContent className="py-8 text-center">
          <Lightbulb className="h-10 w-10 mx-auto mb-3 text-success" />
          <p className="font-medium text-foreground">You're in great shape!</p>
          <p className="text-sm text-muted-foreground mt-1">
            No urgent items right now. Keep your credentials current.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          What You Need To Do
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                  insight.bgColor
                )}
              >
                <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', insight.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {insight.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-xs"
                  onClick={() => navigate(insight.route)}
                >
                  {insight.action}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
