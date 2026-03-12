import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

const TERM_DEFINITIONS: Record<string, string> = {
  CAQH: 'Council for Affordable Quality Healthcare. A centralized database where providers store their credentialing information. Most payers pull directly from CAQH.',
  NPI: 'National Provider Identifier. A unique 10-digit number assigned to every healthcare provider in the US.',
  DEA: 'Drug Enforcement Administration registration allowing providers to prescribe controlled substances.',
  PECOS: "Provider Enrollment, Chain and Ownership System. Medicare's online provider enrollment system.",
  LHL234: 'The Texas Standard Credentialing Application, required by most Texas payers and facilities.',
  TSCA: 'Texas Standardized Credentialing Application. The standard application form and document package required by most Texas payers and facilities.',
  'Pre-flight Check': 'A validation step that confirms all required documents and profile fields are complete before a credentialing packet can be generated.',
  'Credentialing Packet': 'A compiled set of documents submitted to an insurance payer or facility to verify a provider\'s qualifications and obtain in-network status.',
};

interface CredentialingTooltipProps {
  term: keyof typeof TERM_DEFINITIONS;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function CredentialingTooltip({ term, children, showIcon = true }: CredentialingTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/50">
          {children ?? term}
          {showIcon && <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        <p>{TERM_DEFINITIONS[term]}</p>
      </TooltipContent>
    </Tooltip>
  );
}
