import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useCredentials } from '@/contexts/CredentialsContext';
import { useUI } from '@/contexts/UIContext';
import { OnboardingJourney } from '@/components/dashboard/OnboardingJourney';
import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard';
import { ActionableInsights } from '@/components/dashboard/ActionableInsights';
import { CAQHReattestationAlert } from '@/components/dashboard/CAQHReattestationAlert';
import {
  calculateStatus,
  providerGroupMemberships,
  packetHistory,
} from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Bell, Download, ArrowRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const MOCK_COMPLETION = 78;
const MOCK_SECTION_PROGRESS: Record<string, number> = {
  individual: 100,
  education: 85,
  licenses: 90,
  specialty: 75,
  workHistory: 65,
  hospitals: 50,
  references: 40,
  insurance: 80,
  callCoverage: 60,
  practiceLocations: 100,
  disclosures: 30,
};

const SECTION_LABELS: Record<string, string> = {
  individual: 'Individual Info',
  education: 'Education',
  licenses: 'Licenses',
  specialty: 'Specialty',
  workHistory: 'Work History',
  hospitals: 'Hospitals',
  references: 'References',
  insurance: 'Insurance',
  callCoverage: 'Call Coverage',
  practiceLocations: 'Locations',
  disclosures: 'Disclosures',
};

const statusDotClass: Record<string, string> = {
  'Active': 'bg-success',
  'Pending Consent': 'bg-warning',
  'Revoked': 'bg-muted-foreground/50',
};

const pendingActions = [
  {
    id: 'pa-1',
    label: 'Consent request from Bexar County Health Network',
    cta: 'Review',
    route: '/my-groups',
  },
  {
    id: 'pa-2',
    label: 'CAQH attestation due in 53 days',
    cta: 'Update Now',
    route: '/caqh',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const { credentials } = useCredentials();
  const { caqhAttestation } = useUI();

  const hasGeneratedPacket = useMemo(() => {
    return localStorage.getItem('ccspro_has_generated_packet') === 'true';
  }, []);

  const incompleteSections = useMemo(() => {
    return Object.entries(MOCK_SECTION_PROGRESS)
      .filter(([, prog]) => prog < 100)
      .map(([key]) => SECTION_LABELS[key] || key);
  }, []);

  const caqhDaysLeft = useMemo(() => {
    if (!caqhAttestation.expiryDate) return 53;
    const { daysLeft } = calculateStatus(caqhAttestation.expiryDate);
    return daysLeft;
  }, [caqhAttestation]);

  return (
    <div className="space-y-6 animate-slide-up">
      <CAQHReattestationAlert
        attestationDate={caqhAttestation.attestationDate}
        expiryDate={caqhAttestation.expiryDate}
        status={caqhAttestation.status}
      />

      <OnboardingJourney
        providerName="Sarah"
        documentCount={documents.length}
        profileCompletion={MOCK_COMPLETION}
        hasGeneratedPacket={hasGeneratedPacket}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCompletionCard
          completionPercentage={MOCK_COMPLETION}
          sectionProgress={MOCK_SECTION_PROGRESS}
        />

        <div className="flex flex-col gap-4">
          <Card className="card-hover">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Users className="h-4 w-4" />
                My Groups
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-groups')}
                className="text-xs"
              >
                Manage Groups <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {providerGroupMemberships.map((group) => (
                <div key={group.id} className="flex items-center gap-3 py-1">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full flex-shrink-0',
                      statusDotClass[group.consentStatus] ?? 'bg-muted-foreground'
                    )}
                  />
                  <span className="flex-1 text-sm truncate">{group.groupName}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {group.consentStatus}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-hover border-destructive/20">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <Bell className="h-4 w-4 text-destructive" />
              <CardTitle className="text-base font-medium">Pending Actions</CardTitle>
              <Badge variant="destructive" className="ml-auto text-xs">
                {pendingActions.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingActions.map((action, i) => (
                <div key={action.id}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                    <p className="flex-1 text-sm leading-snug">{action.label}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 text-xs"
                      onClick={() => navigate(action.route)}
                    >
                      {action.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ActionableInsights
        credentials={credentials}
        profileCompletion={MOCK_COMPLETION}
        incompleteSections={incompleteSections}
        missingDocsByPayer={[]}
        caqhDaysLeft={caqhDaysLeft}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5" />
            Recent Packets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Packet Name</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Payer</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Date Generated</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {packetHistory.map((packet) => (
                  <tr key={packet.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{packet.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{packet.payer}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {format(new Date(packet.generatedDate), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast.success('Downloading...', {
                            description: `${packet.name} — Demo mode.`,
                          })
                        }
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
