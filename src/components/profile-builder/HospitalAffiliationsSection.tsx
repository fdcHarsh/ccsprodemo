import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect, FormRadioGroup } from './FormFields';
import {
  HospitalAffiliationsSection as HospitalAffiliationsSectionType,
  HospitalAffiliation,
  PreviousHospitalAffiliation,
  US_STATES,
} from '@/types/lhl234Profile';
import { Plus, Trash2, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface HospitalAffiliationsSectionProps {
  data: HospitalAffiliationsSectionType;
  onChange: (data: Partial<HospitalAffiliationsSectionType>) => void;
}

const YES_NO = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const emptyHospital: HospitalAffiliation = {
  hospitalName: '', address: '', city: '', state: '', postalCode: '', phone: '',
  startDate: '', fullUnrestrictedPrivileges: '', temporaryPrivileges: '',
};

const emptyPreviousHospital: PreviousHospitalAffiliation = {
  ...emptyHospital, endDate: '', reasonForDiscontinuance: '',
};

function HospitalForm({
  data,
  onChange,
  prefix,
  showEnd = false,
}: {
  data: HospitalAffiliation | PreviousHospitalAffiliation;
  onChange: (field: string, value: any) => void;
  prefix: string;
  showEnd?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Hospital Name" id={`${prefix}_name`} value={data.hospitalName} onChange={(v) => onChange('hospitalName', v)} placeholder="Hospital name" required className="md:col-span-2" />
        <FormField label="Address" id={`${prefix}_addr`} value={data.address} onChange={(v) => onChange('address', v)} placeholder="Street address" required className="md:col-span-2" />
        <FormField label="City" id={`${prefix}_city`} value={data.city} onChange={(v) => onChange('city', v)} placeholder="City" required />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="State" id={`${prefix}_state`} value={data.state} onChange={(v) => onChange('state', v)} options={US_STATES} required />
          <FormField label="ZIP" id={`${prefix}_zip`} value={data.postalCode} onChange={(v) => onChange('postalCode', v)} placeholder="ZIP" required />
        </div>
        <FormField label="Phone" id={`${prefix}_phone`} value={data.phone} onChange={(v) => onChange('phone', v)} placeholder="(xxx) xxx-xxxx" type="tel" required />
        <FormField label="Fax" id={`${prefix}_fax`} value={data.fax || ''} onChange={(v) => onChange('fax', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
        <FormField label="Email" id={`${prefix}_email`} value={data.email || ''} onChange={(v) => onChange('email', v)} placeholder="hospital@example.com" type="email" />
        <FormField label="Start Date" id={`${prefix}_start`} value={data.startDate} onChange={(v) => onChange('startDate', v)} type="month" required />
        {showEnd && 'endDate' in data && (
          <FormField label="End Date" id={`${prefix}_end`} value={(data as PreviousHospitalAffiliation).endDate} onChange={(v) => onChange('endDate', v)} type="month" required />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormRadioGroup label="Full Unrestricted Privileges?" id={`${prefix}_unrestricted`} value={data.fullUnrestrictedPrivileges} onChange={(v) => onChange('fullUnrestrictedPrivileges', v)} options={YES_NO} required />
        <FormRadioGroup label="Temporary Privileges?" id={`${prefix}_temp`} value={data.temporaryPrivileges} onChange={(v) => onChange('temporaryPrivileges', v)} options={YES_NO} />
      </div>
      {data.fullUnrestrictedPrivileges === 'No' && (
        <FormField label="Types of Privileges" id={`${prefix}_privTypes`} value={data.typesOfPrivileges || ''} onChange={(v) => onChange('typesOfPrivileges', v)} placeholder="Describe privilege types" />
      )}
      <FormField label="Admission Percentage" id={`${prefix}_admPct`} value={String(data.admissionPercentage ?? '')} onChange={(v) => onChange('admissionPercentage', v ? Number(v) : undefined)} type="number" placeholder="% of admissions" />
      {showEnd && 'reasonForDiscontinuance' in data && (
        <div className="space-y-2">
          <Label>Reason for Discontinuance <span className="text-destructive">*</span></Label>
          <Textarea
            value={(data as PreviousHospitalAffiliation).reasonForDiscontinuance}
            onChange={(e) => onChange('reasonForDiscontinuance', e.target.value)}
            placeholder="Reason for leaving"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}

export function HospitalAffiliationsSectionComponent({ data, onChange }: HospitalAffiliationsSectionProps) {
  const [openSections, setOpenSections] = useState({ primary: true, other: true, previous: true });
  const toggle = (s: keyof typeof openSections) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const updatePrimary = (field: string, value: any) => {
    const current = data.primaryHospital || { ...emptyHospital };
    onChange({ primaryHospital: { ...current, [field]: value } });
  };

  const addOther = () => onChange({ otherHospitals: [...data.otherHospitals, { ...emptyHospital }] });
  const updateOther = (i: number, field: string, value: any) => {
    const updated = [...data.otherHospitals];
    updated[i] = { ...updated[i], [field]: value };
    onChange({ otherHospitals: updated });
  };
  const removeOther = (i: number) => onChange({ otherHospitals: data.otherHospitals.filter((_, idx) => idx !== i) });

  const addPrevious = () => onChange({ previousHospitals: [...data.previousHospitals, { ...emptyPreviousHospital }] });
  const updatePrevious = (i: number, field: string, value: any) => {
    const updated = [...data.previousHospitals];
    updated[i] = { ...updated[i], [field]: value };
    onChange({ previousHospitals: updated });
  };
  const removePrevious = (i: number) => onChange({ previousHospitals: data.previousHospitals.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          List all current and previous hospital affiliations. If you do not have hospital privileges, indicate your admitting arrangements.
        </AlertDescription>
      </Alert>

      <FormRadioGroup
        label="Do you have hospital privileges?"
        id="hasPrivileges"
        value={data.hasHospitalPrivileges}
        onChange={(v) => onChange({ hasHospitalPrivileges: v as any })}
        options={YES_NO}
        required
      />

      {data.hasHospitalPrivileges === 'No' && (
        <FormField
          label="Admitting Arrangements"
          id="admittingArrangements"
          value={data.admittingArrangements || ''}
          onChange={(v) => onChange({ admittingArrangements: v })}
          placeholder="Describe your admitting arrangements"
          tooltip="If you do not have hospital privileges, describe your admitting arrangements."
        />
      )}

      {data.hasHospitalPrivileges === 'Yes' && (
        <>
          {/* Primary Hospital */}
          <Collapsible open={openSections.primary} onOpenChange={() => toggle('primary')}>
            <Card className="border-primary/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Primary Hospital
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">PRIMARY</span>
                    </CardTitle>
                    {openSections.primary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <HospitalForm
                    data={data.primaryHospital || emptyHospital}
                    onChange={updatePrimary}
                    prefix="primaryHosp"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Other Hospitals */}
          <Collapsible open={openSections.other} onOpenChange={() => toggle('other')}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Other Hospital Affiliations
                      {data.otherHospitals.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">({data.otherHospitals.length})</span>
                      )}
                    </CardTitle>
                    {openSections.other ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {data.otherHospitals.map((hosp, i) => (
                    <Card key={i} className="border-dashed">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Hospital #{i + 1}</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => removeOther(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <HospitalForm data={hosp} onChange={(f, v) => updateOther(i, f, v)} prefix={`other_${i}`} />
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={addOther} className="w-full"><Plus className="mr-2 h-4 w-4" />Add Hospital</Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Previous Hospitals */}
          <Collapsible open={openSections.previous} onOpenChange={() => toggle('previous')}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Previous Hospital Affiliations
                      {data.previousHospitals.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">({data.previousHospitals.length})</span>
                      )}
                    </CardTitle>
                    {openSections.previous ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {data.previousHospitals.map((hosp, i) => (
                    <Card key={i} className="border-dashed">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Previous Hospital #{i + 1}</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => removePrevious(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <HospitalForm data={hosp} onChange={(f, v) => updatePrevious(i, f, v)} prefix={`prev_${i}`} showEnd />
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={addPrevious} className="w-full"><Plus className="mr-2 h-4 w-4" />Add Previous Hospital</Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </>
      )}
    </div>
  );
}
