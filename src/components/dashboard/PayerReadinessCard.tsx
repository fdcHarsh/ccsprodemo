import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Payer } from '@/lib/mockData';

interface PayerReadiness {
  payer: Payer;
  available: number;
  total: number;
  percentage: number;
  missingItems: string[];
}

interface PayerReadinessCardProps {
  payers: PayerReadiness[];
}

export function PayerReadinessCard({ payers }: PayerReadinessCardProps) {
  const navigate = useNavigate();

  // Sort: closest to ready first, then alphabetical
  const sorted = [...payers].sort((a, b) => b.percentage - a.percentage);

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Payer Readiness</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/payers')}>
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-52 overflow-y-auto scrollbar-thin">
          {sorted.map((pr) => (
            <div
              key={pr.payer.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate('/payers')}
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {pr.percentage === 100 ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium truncate">
                    {pr.payer.name}
                  </p>
                  <span
                    className={cn(
                      'text-xs font-medium ml-2 shrink-0',
                      pr.percentage === 100
                        ? 'text-success'
                        : pr.percentage >= 70
                        ? 'text-warning'
                        : 'text-destructive'
                    )}
                  >
                    {pr.percentage}%
                  </span>
                </div>
                <Progress value={pr.percentage} className="h-1 mt-1" />
                {pr.missingItems.length > 0 && pr.missingItems.length <= 3 && (
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    Missing: {pr.missingItems.join(', ')}
                  </p>
                )}
                {pr.missingItems.length > 3 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {pr.missingItems.length} documents missing
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
