import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SectionItem {
  key: string;
  label: string;
  progress: number;
}

const SECTION_LABELS: Record<string, string> = {
  individual: 'Individual Info',
  education: 'Education',
  licenses: 'Licenses & Certificates',
  specialty: 'Specialty Information',
  workHistory: 'Work History',
  hospitals: 'Hospital Affiliations',
  references: 'References',
  insurance: 'Liability Insurance',
  callCoverage: 'Call Coverage',
  practiceLocations: 'Practice Locations',
  disclosures: 'Disclosures',
};

interface ProfileCompletionCardProps {
  completionPercentage: number;
  sectionProgress: Record<string, number>;
}

export function ProfileCompletionCard({
  completionPercentage,
  sectionProgress,
}: ProfileCompletionCardProps) {
  const navigate = useNavigate();

  const sections: SectionItem[] = Object.entries(SECTION_LABELS).map(
    ([key, label]) => ({
      key,
      label,
      progress: sectionProgress[key] || 0,
    })
  );

  const incompleteSections = sections.filter((s) => s.progress < 100);
  const needsMoreForPacket = completionPercentage < 90;

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Profile Completion</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
          Edit <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          {/* Donut Chart */}
          <div className="relative shrink-0">
            <svg className="h-28 w-28 -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
              <circle
                cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none"
                strokeDasharray={`${(completionPercentage / 100) * 301.6} 301.6`}
                strokeLinecap="round"
                className={cn(
                  completionPercentage >= 90 ? 'text-success' : completionPercentage >= 50 ? 'text-warning' : 'text-destructive'
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                'text-2xl font-bold',
                completionPercentage >= 90 ? 'text-success' : completionPercentage >= 50 ? 'text-warning' : 'text-destructive'
              )}>
                {completionPercentage}%
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1">
            {completionPercentage >= 100 ? (
              <p className="text-sm text-success font-medium">✅ Profile complete — ready for packet generation</p>
            ) : needsMoreForPacket ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-foreground">
                    Complete your profile to unlock packet generation. You need 90% to proceed.
                  </p>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {incompleteSections.length} section{incompleteSections.length !== 1 ? 's' : ''} need attention
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  {incompleteSections.length} section{incompleteSections.length !== 1 ? 's' : ''} need attention
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your profile meets the 90% threshold for packet generation.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Section breakdown — show incomplete first, use distinct colors */}
        <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin">
          {sections
            .sort((a, b) => a.progress - b.progress)
            .map((section) => (
              <div key={section.key} className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    section.progress >= 100 ? 'bg-success' : section.progress > 0 ? 'bg-warning' : 'bg-destructive'
                  )}
                />
                <span className="text-xs text-muted-foreground w-32 shrink-0 truncate">{section.label}</span>
                <div className="flex-1 relative h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all',
                      section.progress >= 100 ? 'bg-success' : section.progress > 0 ? 'bg-accent' : 'bg-destructive'
                    )}
                    style={{ width: `${section.progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{section.progress}%</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
