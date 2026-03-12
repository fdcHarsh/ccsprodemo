import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect, FormRadioGroup } from './FormFields';
import { SpecialtySection as SpecialtySectionType, SpecialtyInfo } from '@/types/lhl234Profile';
import { Plus, Trash2, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SpecialtySectionProps {
  data: SpecialtySectionType;
  onChange: (data: Partial<SpecialtySectionType>) => void;
}

const BOARD_STATUS_OPTIONS = [
  { value: 'results_pending', label: 'Results pending' },
  { value: 'eligible_part2', label: 'Eligible – Part 2 not taken' },
  { value: 'intending_to_sit', label: 'Intending to sit for exam' },
  { value: 'not_planning', label: 'Not planning to take exam' },
];

const YES_NO = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

function SpecialtyForm({
  data,
  onChange,
  label,
}: {
  data: SpecialtyInfo;
  onChange: (field: keyof SpecialtyInfo, value: any) => void;
  label: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Specialty"
          id={`${label}_specialty`}
          value={data.specialty}
          onChange={(v) => onChange('specialty', v)}
          placeholder="e.g., Family Medicine, Internal Medicine"
          required
          className="md:col-span-2"
        />
        <FormRadioGroup
          label="Are you Board Certified?"
          id={`${label}_boardCertified`}
          value={data.boardCertified}
          onChange={(v) => onChange('boardCertified', v)}
          options={YES_NO}
          required
        />
      </div>

      {data.boardCertified === 'Yes' && (
        <div className="grid gap-4 md:grid-cols-2 pl-4 border-l-2 border-primary/20">
          <FormField
            label="Certifying Board"
            id={`${label}_board`}
            value={data.certifyingBoard || ''}
            onChange={(v) => onChange('certifyingBoard', v)}
            placeholder="e.g., ABMS, ABFM"
            required
          />
          <FormField
            label="Initial Certification Date"
            id={`${label}_certDate`}
            value={data.initialCertificationDate || ''}
            onChange={(v) => onChange('initialCertificationDate', v)}
            type="date"
            required
          />
          <FormField
            label="Recertification Date(s)"
            id={`${label}_recertDate`}
            value={data.recertificationDates || ''}
            onChange={(v) => onChange('recertificationDates', v)}
            placeholder="MM/YYYY"
          />
          <FormField
            label="Expiration Date"
            id={`${label}_expDate`}
            value={data.expirationDate || ''}
            onChange={(v) => onChange('expirationDate', v)}
            type="date"
          />
        </div>
      )}

      {data.boardCertified === 'No' && (
        <div className="grid gap-4 md:grid-cols-2 pl-4 border-l-2 border-warning/20">
          <FormField
            label="Name of Certifying Board"
            id={`${label}_board_notcert`}
            value={data.certifyingBoard || ''}
            onChange={(v) => onChange('certifyingBoard', v)}
            placeholder="e.g., ABMS, ABFM"
            tooltip="Board you intend to certify with or have applied to"
          />
          <FormSelect
            label="Board Status"
            id={`${label}_boardStatus`}
            value={data.boardStatus || ''}
            onChange={(v) => onChange('boardStatus', v)}
            options={BOARD_STATUS_OPTIONS}
            required
          />
          {data.boardStatus === 'intending_to_sit' && (
            <FormField
              label="Expected Exam Date"
              id={`${label}_examDate`}
              value={data.intendingToSitDate || ''}
              onChange={(v) => onChange('intendingToSitDate', v)}
              type="date"
            />
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <FormRadioGroup
          label="List in HMO Directory?"
          id={`${label}_hmo`}
          value={data.listInHMODirectory || ''}
          onChange={(v) => onChange('listInHMODirectory', v)}
          options={YES_NO}
        />
        <FormRadioGroup
          label="List in PPO Directory?"
          id={`${label}_ppo`}
          value={data.listInPPODirectory || ''}
          onChange={(v) => onChange('listInPPODirectory', v)}
          options={YES_NO}
        />
        <FormRadioGroup
          label="List in POS Directory?"
          id={`${label}_pos`}
          value={data.listInPOSDirectory || ''}
          onChange={(v) => onChange('listInPOSDirectory', v)}
          options={YES_NO}
        />
      </div>
    </div>
  );
}

export function SpecialtySectionComponent({ data, onChange }: SpecialtySectionProps) {
  const [openSections, setOpenSections] = useState({ primary: true, secondary: true, additional: true });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updatePrimary = (field: keyof SpecialtyInfo, value: any) => {
    onChange({ primarySpecialty: { ...data.primarySpecialty, [field]: value } });
  };

  const updateSecondary = (field: keyof SpecialtyInfo, value: any) => {
    const current = data.secondarySpecialty || {
      specialty: '', boardCertified: '', listInHMODirectory: 'Yes', listInPPODirectory: 'Yes', listInPOSDirectory: 'Yes',
    };
    onChange({ secondarySpecialty: { ...current, [field]: value } });
  };

  const addAdditional = () => {
    const newSpec: SpecialtyInfo = {
      specialty: '', boardCertified: '', listInHMODirectory: 'Yes', listInPPODirectory: 'Yes', listInPOSDirectory: 'Yes',
    };
    onChange({ additionalSpecialties: [...data.additionalSpecialties, newSpec] });
  };

  const updateAdditional = (index: number, field: keyof SpecialtyInfo, value: any) => {
    const updated = [...data.additionalSpecialties];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ additionalSpecialties: updated });
  };

  const removeAdditional = (index: number) => {
    onChange({ additionalSpecialties: data.additionalSpecialties.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Briefcase className="h-4 w-4" />
        <AlertDescription>
          Provide your specialty and board certification information. At minimum, list your primary specialty.
        </AlertDescription>
      </Alert>

      {/* Primary Specialty */}
      <Collapsible open={openSections.primary} onOpenChange={() => toggleSection('primary')}>
        <Card className="border-primary/30">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Primary Specialty
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">REQUIRED</span>
                </CardTitle>
                {openSections.primary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <SpecialtyForm data={data.primarySpecialty} onChange={updatePrimary} label="primary" />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Secondary Specialty */}
      <Collapsible open={openSections.secondary} onOpenChange={() => toggleSection('secondary')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Secondary Specialty
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">OPTIONAL</span>
                </CardTitle>
                {openSections.secondary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <SpecialtyForm
                data={data.secondarySpecialty || { specialty: '', boardCertified: '', listInHMODirectory: 'Yes', listInPPODirectory: 'Yes', listInPOSDirectory: 'Yes' }}
                onChange={updateSecondary}
                label="secondary"
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Additional Specialties */}
      <Collapsible open={openSections.additional} onOpenChange={() => toggleSection('additional')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Additional Specialties
                  {data.additionalSpecialties.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">({data.additionalSpecialties.length})</span>
                  )}
                </CardTitle>
                {openSections.additional ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {data.additionalSpecialties.map((spec, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Additional Specialty #{index + 1}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => removeAdditional(index)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SpecialtyForm data={spec} onChange={(f, v) => updateAdditional(index, f, v)} label={`additional_${index}`} />
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addAdditional} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Additional Specialty
              </Button>

              <FormField
                label="Other Practice Interests"
                id="otherInterests"
                value={data.otherPracticeInterests || ''}
                onChange={(v) => onChange({ otherPracticeInterests: v })}
                placeholder="e.g., Sports Medicine, Geriatrics"
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
