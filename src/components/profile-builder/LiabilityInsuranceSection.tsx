import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect, FormRadioGroup } from './FormFields';
import { LiabilityInsuranceSection as LiabilityInsuranceSectionType, MalpracticeInsurance, US_STATES } from '@/types/lhl234Profile';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

interface LiabilityInsuranceSectionProps {
  data: LiabilityInsuranceSectionType;
  onChange: (data: Partial<LiabilityInsuranceSectionType>) => void;
}

const COVERAGE_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Shared', label: 'Shared' },
];

function InsuranceForm({
  data,
  onChange,
  prefix,
}: {
  data: MalpracticeInsurance;
  onChange: (field: keyof MalpracticeInsurance, value: string) => void;
  prefix: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Carrier Name" id={`${prefix}_carrier`} value={data.carrierName} onChange={(v) => onChange('carrierName', v)} placeholder="Insurance carrier name" required className="md:col-span-2" />
        <FormField label="Address" id={`${prefix}_addr`} value={data.address} onChange={(v) => onChange('address', v)} placeholder="Street address" className="md:col-span-2" />
        <FormField label="City" id={`${prefix}_city`} value={data.city} onChange={(v) => onChange('city', v)} placeholder="City" />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="State" id={`${prefix}_state`} value={data.state} onChange={(v) => onChange('state', v)} options={US_STATES} />
          <FormField label="ZIP" id={`${prefix}_zip`} value={data.postalCode} onChange={(v) => onChange('postalCode', v)} placeholder="ZIP" />
        </div>
        <FormField label="Phone" id={`${prefix}_phone`} value={data.phone} onChange={(v) => onChange('phone', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
        <FormField label="Policy Number" id={`${prefix}_policy`} value={data.policyNumber} onChange={(v) => onChange('policyNumber', v)} placeholder="Policy number" required />
        <FormField label="Effective Date" id={`${prefix}_effective`} value={data.effectiveDate} onChange={(v) => onChange('effectiveDate', v)} type="date" required />
        <FormField label="Expiration Date" id={`${prefix}_expiration`} value={data.expirationDate} onChange={(v) => onChange('expirationDate', v)} type="date" required />
        <FormField
          label="Coverage Per Occurrence"
          id={`${prefix}_perOccurrence`}
          value={data.coveragePerOccurrence}
          onChange={(v) => onChange('coveragePerOccurrence', v)}
          placeholder="e.g., $1,000,000"
          required
          tooltip="Amount of coverage per occurrence/claim"
        />
        <FormField
          label="Coverage Aggregate"
          id={`${prefix}_aggregate`}
          value={data.coverageAggregate}
          onChange={(v) => onChange('coverageAggregate', v)}
          placeholder="e.g., $3,000,000"
          required
          tooltip="Total aggregate coverage amount"
        />
        <FormRadioGroup
          label="Coverage Type"
          id={`${prefix}_type`}
          value={data.coverageType}
          onChange={(v) => onChange('coverageType', v)}
          options={COVERAGE_TYPE_OPTIONS}
        />
        <FormField
          label="Length with Carrier"
          id={`${prefix}_length`}
          value={data.lengthWithCarrier}
          onChange={(v) => onChange('lengthWithCarrier', v)}
          placeholder="e.g., 5 years"
        />
      </div>
    </div>
  );
}

export function LiabilityInsuranceSectionComponent({ data, onChange }: LiabilityInsuranceSectionProps) {
  const [openSections, setOpenSections] = useState({ current: true, previous: false });
  const toggle = (s: keyof typeof openSections) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const updateCurrent = (field: keyof MalpracticeInsurance, value: string) => {
    onChange({ currentInsurance: { ...data.currentInsurance, [field]: value } });
  };

  const updatePrevious = (field: keyof MalpracticeInsurance, value: string) => {
    const current = data.previousInsurance || {
      carrierName: '', address: '', city: '', state: '', postalCode: '', phone: '',
      policyNumber: '', effectiveDate: '', expirationDate: '', coveragePerOccurrence: '',
      coverageAggregate: '', coverageType: '' as const, lengthWithCarrier: '',
    };
    onChange({ previousInsurance: { ...current, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Provide your current professional liability (malpractice) insurance information. 
          If self-insured, check the box below.
        </AlertDescription>
      </Alert>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={data.selfInsured}
          onChange={(e) => onChange({ selfInsured: e.target.checked })}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <span className="text-sm font-medium">I am self-insured</span>
      </label>

      {!data.selfInsured && (
        <>
          <Collapsible open={openSections.current} onOpenChange={() => toggle('current')}>
            <Card className="border-primary/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Current Insurance
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">CURRENT</span>
                    </CardTitle>
                    {openSections.current ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <InsuranceForm data={data.currentInsurance} onChange={updateCurrent} prefix="currentIns" />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={openSections.previous} onOpenChange={() => toggle('previous')}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Previous Insurance
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">OPTIONAL</span>
                    </CardTitle>
                    {openSections.previous ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <InsuranceForm
                    data={data.previousInsurance || {
                      carrierName: '', address: '', city: '', state: '', postalCode: '', phone: '',
                      policyNumber: '', effectiveDate: '', expirationDate: '', coveragePerOccurrence: '',
                      coverageAggregate: '', coverageType: '' as const, lengthWithCarrier: '',
                    }}
                    onChange={updatePrevious}
                    prefix="prevIns"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </>
      )}
    </div>
  );
}
