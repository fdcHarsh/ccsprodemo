import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect, FormRadioGroup } from './FormFields';
import { MalpracticeClaim, US_STATES } from '@/types/lhl234Profile';
import { Plus, Trash2, AlertTriangle, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CLAIM_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Dismissed', label: 'Dismissed' },
  { value: 'Settled (with prejudice)', label: 'Settled (with prejudice)' },
  { value: 'Settled (without prejudice)', label: 'Settled (without prejudice)' },
  { value: 'Judgment for Defendant(s)', label: 'Judgment for Defendant(s)' },
  { value: 'Judgment for Plaintiff(s)', label: 'Judgment for Plaintiff(s)' },
  { value: 'Mediation or Arbitration', label: 'Mediation or Arbitration' },
];

const RESOLUTION_METHOD_OPTIONS = [
  { value: 'Dismissed', label: 'Dismissed' },
  { value: 'Settled (with prejudice)', label: 'Settled (with prejudice)' },
  { value: 'Settled (without prejudice)', label: 'Settled (without prejudice)' },
  { value: 'Judgment for Defendant(s)', label: 'Judgment for Defendant(s)' },
  { value: 'Judgment for Plaintiff(s)', label: 'Judgment for Plaintiff(s)' },
  { value: 'Mediation or Arbitration', label: 'Mediation or Arbitration' },
];

const INVOLVEMENT_OPTIONS = [
  { value: 'Attending Physician', label: 'Attending Physician' },
  { value: 'Consulting Physician', label: 'Consulting Physician' },
  { value: 'Supervising Physician', label: 'Supervising Physician' },
  { value: 'Surgical Assistant', label: 'Surgical Assistant' },
  { value: 'Other', label: 'Other' },
];

const DEFENDANT_OPTIONS = [
  { value: 'Primary', label: 'Primary Defendant' },
  { value: 'Co-defendant', label: 'Co-Defendant' },
];

const NPDB_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Unknown', label: 'Unknown' },
];

interface MalpracticeClaimsSectionProps {
  claims: MalpracticeClaim[];
  onChange: (claims: MalpracticeClaim[]) => void;
}

export function MalpracticeClaimsSection({ claims, onChange }: MalpracticeClaimsSectionProps) {
  const [openClaims, setOpenClaims] = useState<Record<number, boolean>>({});

  const toggleClaim = (index: number) => {
    setOpenClaims(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const addClaim = () => {
    const newClaim: MalpracticeClaim = {
      incidentDate: '',
      claimFiledDate: '',
      claimStatus: '',
      insuranceCarrier: '',
      carrierAddress: '',
      carrierCity: '',
      carrierState: '',
      carrierPostalCode: '',
      carrierPhone: '',
      policyNumber: '',
      awardAmount: '',
      amountPaid: '',
      methodOfResolution: '',
      descriptionOfAllegations: '',
      primaryOrCoDefendant: '',
      numberOfCoDefendants: 0,
      yourInvolvement: '',
      descriptionOfInjury: '',
      inNPDB: '',
    };
    onChange([...claims, newClaim]);
    setOpenClaims(prev => ({ ...prev, [claims.length]: true }));
  };

  const updateClaim = (index: number, field: keyof MalpracticeClaim, value: any) => {
    const updated = [...claims];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeClaim = (index: number) => {
    onChange(claims.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Alert className="border-warning/50 bg-warning/10">
        <Scale className="h-4 w-4 text-warning" />
        <AlertDescription className="text-sm">
          <strong>Attachment G — Malpractice Claims History:</strong> Complete one entry for each malpractice claim
          within the past 5 years. All fields are required per the LHL234 form.
        </AlertDescription>
      </Alert>

      {claims.map((claim, index) => (
        <Collapsible key={index} open={openClaims[index] !== false} onOpenChange={() => toggleClaim(index)}>
          <Card className="border-warning/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="h-4 w-4 text-warning" />
                    Claim #{index + 1}
                    {claim.incidentDate && (
                      <span className="text-sm font-normal text-muted-foreground">
                        — Incident: {claim.incidentDate}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); removeClaim(index); }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {openClaims[index] !== false ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Dates & Status */}
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    label="Incident Date"
                    id={`claim_incident_${index}`}
                    value={claim.incidentDate}
                    onChange={(v) => updateClaim(index, 'incidentDate', v)}
                    type="date"
                    required
                  />
                  <FormField
                    label="Date Claim Filed"
                    id={`claim_filed_${index}`}
                    value={claim.claimFiledDate}
                    onChange={(v) => updateClaim(index, 'claimFiledDate', v)}
                    type="date"
                    required
                  />
                  <FormSelect
                    label="Claim/Case Status"
                    id={`claim_status_${index}`}
                    value={claim.claimStatus}
                    onChange={(v) => updateClaim(index, 'claimStatus', v)}
                    options={CLAIM_STATUS_OPTIONS}
                    required
                  />
                </div>

                {/* Insurance Carrier */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Professional Liability Carrier</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Carrier Name"
                      id={`claim_carrier_${index}`}
                      value={claim.insuranceCarrier}
                      onChange={(v) => updateClaim(index, 'insuranceCarrier', v)}
                      placeholder="Insurance carrier name"
                      required
                      className="md:col-span-2"
                    />
                    <FormField
                      label="Address"
                      id={`claim_carrier_addr_${index}`}
                      value={claim.carrierAddress}
                      onChange={(v) => updateClaim(index, 'carrierAddress', v)}
                      placeholder="Street address"
                      required
                      className="md:col-span-2"
                    />
                    <FormField
                      label="City"
                      id={`claim_carrier_city_${index}`}
                      value={claim.carrierCity}
                      onChange={(v) => updateClaim(index, 'carrierCity', v)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormSelect
                        label="State"
                        id={`claim_carrier_state_${index}`}
                        value={claim.carrierState}
                        onChange={(v) => updateClaim(index, 'carrierState', v)}
                        options={US_STATES}
                        required
                      />
                      <FormField
                        label="ZIP"
                        id={`claim_carrier_zip_${index}`}
                        value={claim.carrierPostalCode}
                        onChange={(v) => updateClaim(index, 'carrierPostalCode', v)}
                        required
                      />
                    </div>
                    <FormField
                      label="Phone"
                      id={`claim_carrier_phone_${index}`}
                      value={claim.carrierPhone}
                      onChange={(v) => updateClaim(index, 'carrierPhone', v)}
                      type="tel"
                      required
                    />
                    <FormField
                      label="Policy Number"
                      id={`claim_policy_${index}`}
                      value={claim.policyNumber}
                      onChange={(v) => updateClaim(index, 'policyNumber', v)}
                      required
                    />
                  </div>
                </div>

                {/* Financial */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Financial Details</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Amount of Award or Settlement"
                      id={`claim_award_${index}`}
                      value={claim.awardAmount || ''}
                      onChange={(v) => updateClaim(index, 'awardAmount', v)}
                      placeholder="$0.00"
                    />
                    <FormField
                      label="Amount Paid"
                      id={`claim_paid_${index}`}
                      value={claim.amountPaid || ''}
                      onChange={(v) => updateClaim(index, 'amountPaid', v)}
                      placeholder="$0.00"
                    />
                  </div>
                  <div className="mt-4">
                    <FormSelect
                      label="Method of Resolution"
                      id={`claim_resolution_${index}`}
                      value={claim.methodOfResolution}
                      onChange={(v) => updateClaim(index, 'methodOfResolution', v)}
                      options={RESOLUTION_METHOD_OPTIONS}
                      required
                    />
                  </div>
                </div>

                {/* Involvement */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Your Involvement</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormRadioGroup
                      label="Primary or Co-Defendant"
                      id={`claim_defendant_${index}`}
                      value={claim.primaryOrCoDefendant}
                      onChange={(v) => updateClaim(index, 'primaryOrCoDefendant', v)}
                      options={DEFENDANT_OPTIONS}
                      required
                    />
                    <FormField
                      label="Number of Co-Defendants"
                      id={`claim_codef_count_${index}`}
                      value={String(claim.numberOfCoDefendants || '')}
                      onChange={(v) => updateClaim(index, 'numberOfCoDefendants', parseInt(v) || 0)}
                      type="number"
                    />
                    <FormSelect
                      label="Your Involvement"
                      id={`claim_involvement_${index}`}
                      value={claim.yourInvolvement}
                      onChange={(v) => updateClaim(index, 'yourInvolvement', v)}
                      options={INVOLVEMENT_OPTIONS}
                      required
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Description of Allegations <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      value={claim.descriptionOfAllegations}
                      onChange={(e) => updateClaim(index, 'descriptionOfAllegations', e.target.value)}
                      placeholder="Provide a detailed description of the allegations"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Description of Alleged Injury to Patient <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      value={claim.descriptionOfInjury}
                      onChange={(e) => updateClaim(index, 'descriptionOfInjury', e.target.value)}
                      placeholder="Describe the alleged injury to the patient"
                      rows={3}
                    />
                  </div>
                </div>

                {/* NPDB */}
                <div className="border-t pt-4">
                  <FormRadioGroup
                    label="Included in National Practitioner Data Bank (NPDB)?"
                    id={`claim_npdb_${index}`}
                    value={claim.inNPDB}
                    onChange={(v) => updateClaim(index, 'inNPDB', v)}
                    options={NPDB_OPTIONS}
                    required
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      <Button variant="outline" onClick={addClaim} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Malpractice Claim
      </Button>
    </div>
  );
}
