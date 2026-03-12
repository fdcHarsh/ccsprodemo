import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect, FormRadioGroup } from './FormFields';
import { LicensesSection as LicensesSectionType, StateLicense, OtherCDSRegistration, US_STATES } from '@/types/lhl234Profile';
import { Plus, Trash2, FileText, AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LicensesSectionProps {
  data: LicensesSectionType;
  onChange: (data: Partial<LicensesSectionType>) => void;
}

const LICENSE_TYPES = [
  { value: 'Medical License', label: 'Medical License' },
  { value: 'Dental License', label: 'Dental License' },
  { value: 'Chiropractic License', label: 'Chiropractic License' },
  { value: 'Podiatry License', label: 'Podiatry License' },
  { value: 'Nursing License', label: 'Nursing License' },
  { value: 'APRN', label: 'APRN' },
  { value: 'Other', label: 'Other' },
];

export function LicensesSectionComponent({ data, onChange }: LicensesSectionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    state: true,
    dea: true,
    dps: false,
    cds: false,
    provider: true,
    medicare: true,
    ecfmg: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // State Licenses
  const addLicense = () => {
    const newLicense: StateLicense = {
      licenseType: 'Medical License',
      licenseNumber: '',
      state: '',
      issueDate: '',
      expirationDate: '',
      currentlyPractice: '',
    };
    onChange({ stateLicenses: [...data.stateLicenses, newLicense] });
  };

  const updateLicense = (index: number, field: keyof StateLicense, value: any) => {
    const updated = [...data.stateLicenses];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ stateLicenses: updated });
  };

  const removeLicense = (index: number) => {
    if (data.stateLicenses.length > 1) {
      onChange({ stateLicenses: data.stateLicenses.filter((_, i) => i !== index) });
    }
  };

  // Other CDS
  const addCDS = () => {
    const newCDS: OtherCDSRegistration = {
      type: '',
      number: '',
      state: '',
      issueDate: '',
      expirationDate: '',
      currentlyPractice: '',
    };
    onChange({ otherCDSRegistrations: [...data.otherCDSRegistrations, newCDS] });
  };

  const updateCDS = (index: number, field: keyof OtherCDSRegistration, value: any) => {
    const updated = [...data.otherCDSRegistrations];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ otherCDSRegistrations: updated });
  };

  const removeCDS = (index: number) => {
    onChange({ otherCDSRegistrations: data.otherCDSRegistrations.filter((_, i) => i !== index) });
  };

  const isExpiringWithin90Days = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const days = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 90;
  };

  return (
    <div className="space-y-6">
      {/* State Licenses */}
      <Collapsible open={openSections.state} onOpenChange={() => toggleSection('state')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  State Licenses
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({data.stateLicenses.length} license{data.stateLicenses.length > 1 ? 's' : ''})
                  </span>
                </CardTitle>
                {openSections.state ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {data.stateLicenses.map((lic, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        License #{index + 1}
                        {lic.state && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{lic.state}</span>}
                      </CardTitle>
                      {data.stateLicenses.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeLicense(index)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isExpiringWithin90Days(lic.expirationDate) && (
                      <Alert variant="destructive" className="bg-warning/10 border-warning text-warning-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>This license expires within 90 days!</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormSelect
                        label="License Type"
                        id={`licType_${index}`}
                        value={lic.licenseType}
                        onChange={(v) => updateLicense(index, 'licenseType', v)}
                        options={LICENSE_TYPES}
                        required
                      />
                      {lic.licenseType === 'Other' && (
                        <FormField
                          label="Please specify license type"
                          id={`licOtherType_${index}`}
                          value={lic.otherLicenseType || ''}
                          onChange={(v) => updateLicense(index, 'otherLicenseType', v)}
                          placeholder="Specify license type"
                          required
                        />
                      )}
                      <FormField
                        label="License Number"
                        id={`licNumber_${index}`}
                        value={lic.licenseNumber}
                        onChange={(v) => updateLicense(index, 'licenseNumber', v)}
                        placeholder="TX12345"
                        tooltip="This syncs to Practice Locations"
                        synced
                        required
                      />
                      <FormSelect
                        label="State of Registration"
                        id={`licState_${index}`}
                        value={lic.state}
                        onChange={(v) => updateLicense(index, 'state', v)}
                        options={US_STATES}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        label="Original Date of Issue"
                        id={`licIssue_${index}`}
                        value={lic.issueDate}
                        onChange={(v) => updateLicense(index, 'issueDate', v)}
                        type="date"
                        required
                      />
                      <FormField
                        label="Expiration Date"
                        id={`licExp_${index}`}
                        value={lic.expirationDate}
                        onChange={(v) => updateLicense(index, 'expirationDate', v)}
                        type="date"
                        warning={isExpiringWithin90Days(lic.expirationDate) ? 'Expires soon!' : undefined}
                        required
                      />
                      <FormRadioGroup
                        label="Currently practice in this state?"
                        id={`licPractice_${index}`}
                        value={lic.currentlyPractice}
                        onChange={(v) => updateLicense(index, 'currentlyPractice', v)}
                        options={[
                          { value: 'Yes', label: 'Yes' },
                          { value: 'No', label: 'No' },
                        ]}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addLicense} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Another State License
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* DEA Registration */}
      <Collapsible open={openSections.dea} onOpenChange={() => toggleSection('dea')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  DEA Registration
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                  <RefreshCw className="h-4 w-4 text-primary" />
                </CardTitle>
                {openSections.dea ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">DEA registrations expire every 3 years. Not all providers require DEA registration.</p>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="DEA Number"
                  id="deaNumber"
                  value={data.deaRegistration.deaNumber}
                  onChange={(v) => onChange({ deaRegistration: { ...data.deaRegistration, deaNumber: v } })}
                  placeholder="AA1234563"
                  tooltip="2 letters + 7 digits (e.g., FM1234567)"
                  synced
                />
                <FormField
                  label="Original Date of Issue"
                  id="deaIssue"
                  value={data.deaRegistration.issueDate}
                  onChange={(v) => onChange({ deaRegistration: { ...data.deaRegistration, issueDate: v } })}
                  type="date"
                />
                <FormField
                  label="Expiration Date"
                  id="deaExp"
                  value={data.deaRegistration.expirationDate}
                  onChange={(v) => onChange({ deaRegistration: { ...data.deaRegistration, expirationDate: v } })}
                  type="date"
                  warning={isExpiringWithin90Days(data.deaRegistration.expirationDate) ? 'Expires soon!' : undefined}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* DPS Registration */}
      <Collapsible open={openSections.dps} onOpenChange={() => toggleSection('dps')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  DPS (Texas) Registration
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </CardTitle>
                {openSections.dps ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Texas Department of Public Safety controlled substance registration.</p>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="DPS Number"
                  id="dpsNumber"
                  value={data.dpsRegistration.dpsNumber || ''}
                  onChange={(v) => onChange({ dpsRegistration: { ...data.dpsRegistration, dpsNumber: v } })}
                  placeholder="DPS number"
                />
                <FormField
                  label="Original Date of Issue"
                  id="dpsIssue"
                  value={data.dpsRegistration.issueDate || ''}
                  onChange={(v) => onChange({ dpsRegistration: { ...data.dpsRegistration, issueDate: v } })}
                  type="date"
                />
                <FormField
                  label="Expiration Date"
                  id="dpsExp"
                  value={data.dpsRegistration.expirationDate || ''}
                  onChange={(v) => onChange({ dpsRegistration: { ...data.dpsRegistration, expirationDate: v } })}
                  type="date"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Other CDS Registrations */}
      <Collapsible open={openSections.cds} onOpenChange={() => toggleSection('cds')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Other CDS Registrations
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                  {data.otherCDSRegistrations.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({data.otherCDSRegistrations.length})
                    </span>
                  )}
                </CardTitle>
                {openSections.cds ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">List any other controlled dangerous substance registrations.</p>
              {data.otherCDSRegistrations.map((cds, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">CDS Registration #{index + 1}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => removeCDS(index)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        label="Type of CDS (specify)"
                        id={`cds_type_${index}`}
                        value={cds.type}
                        onChange={(v) => updateCDS(index, 'type', v)}
                        placeholder="Type of CDS"
                        required
                      />
                      <FormField
                        label="Number"
                        id={`cds_number_${index}`}
                        value={cds.number}
                        onChange={(v) => updateCDS(index, 'number', v)}
                        placeholder="Registration number"
                        required
                      />
                      <FormSelect
                        label="State of Registration"
                        id={`cds_state_${index}`}
                        value={cds.state}
                        onChange={(v) => updateCDS(index, 'state', v)}
                        options={US_STATES}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        label="Original Date of Issue"
                        id={`cds_issue_${index}`}
                        value={cds.issueDate}
                        onChange={(v) => updateCDS(index, 'issueDate', v)}
                        type="date"
                        required
                      />
                      <FormField
                        label="Expiration Date"
                        id={`cds_exp_${index}`}
                        value={cds.expirationDate}
                        onChange={(v) => updateCDS(index, 'expirationDate', v)}
                        type="date"
                        warning={isExpiringWithin90Days(cds.expirationDate) ? 'Expires soon!' : undefined}
                        required
                      />
                      <FormRadioGroup
                        label="Currently practice in this state?"
                        id={`cds_practice_${index}`}
                        value={cds.currentlyPractice}
                        onChange={(v) => updateCDS(index, 'currentlyPractice', v)}
                        options={[
                          { value: 'Yes', label: 'Yes' },
                          { value: 'No', label: 'No' },
                        ]}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addCDS} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Other CDS Registration
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Provider Numbers */}
      <Collapsible open={openSections.provider} onOpenChange={() => toggleSection('provider')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Provider Identification Numbers
                </CardTitle>
                {openSections.provider ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="UPIN"
                  id="upin"
                  value={data.providerNumbers.upin || ''}
                  onChange={(v) => onChange({ providerNumbers: { ...data.providerNumbers, upin: v } })}
                  placeholder="Legacy UPIN (if any)"
                  tooltip="Unique Physician Identification Number (legacy system)"
                />
                <FormField
                  label="National Provider Identifier (NPI)"
                  id="npi"
                  value={data.providerNumbers.npi}
                  onChange={(v) => onChange({ providerNumbers: { ...data.providerNumbers, npi: v } })}
                  placeholder="1234567890"
                  tooltip="Your 10-digit NPI number - REQUIRED"
                  synced
                  required
                  maxLength={10}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Medicare/Medicaid */}
      <Collapsible open={openSections.medicare} onOpenChange={() => toggleSection('medicare')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Medicare and Medicaid
                </CardTitle>
                {openSections.medicare ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <FormRadioGroup
                    label="Participating Medicare provider?"
                    id="medicare"
                    value={data.medicareMedicaid.medicareParticipating}
                    onChange={(v) => onChange({ medicareMedicaid: { ...data.medicareMedicaid, medicareParticipating: v as 'Yes' | 'No' | '' } })}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]}
                    required
                  />
                  {data.medicareMedicaid.medicareParticipating === 'Yes' && (
                    <FormField
                      label="Medicare Provider Number"
                      id="medicareNumber"
                      value={data.medicareMedicaid.medicareProviderNumber || ''}
                      onChange={(v) => onChange({ medicareMedicaid: { ...data.medicareMedicaid, medicareProviderNumber: v } })}
                      placeholder="Medicare number"
                      required
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <FormRadioGroup
                    label="Participating Medicaid provider?"
                    id="medicaid"
                    value={data.medicareMedicaid.medicaidParticipating}
                    onChange={(v) => onChange({ medicareMedicaid: { ...data.medicareMedicaid, medicaidParticipating: v as 'Yes' | 'No' | '' } })}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]}
                    required
                  />
                  {data.medicareMedicaid.medicaidParticipating === 'Yes' && (
                    <FormField
                      label="Medicaid Provider Number"
                      id="medicaidNumber"
                      value={data.medicareMedicaid.medicaidProviderNumber || ''}
                      onChange={(v) => onChange({ medicareMedicaid: { ...data.medicareMedicaid, medicaidProviderNumber: v } })}
                      placeholder="Medicaid number"
                      required
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ECFMG */}
      <Collapsible open={openSections.ecfmg} onOpenChange={() => toggleSection('ecfmg')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  ECFMG Certification
                  <span className="text-xs text-muted-foreground">(International Graduates)</span>
                </CardTitle>
                {openSections.ecfmg ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <FormRadioGroup
                label="ECFMG Status"
                id="ecfmg"
                value={data.ecfmg.applicable}
                onChange={(v) => onChange({ ecfmg: { ...data.ecfmg, applicable: v as 'N/A' | 'Yes' | 'No' | '' } })}
                options={[
                  { value: 'N/A', label: 'N/A (US/Canada graduate)' },
                  { value: 'Yes', label: 'Yes, I have ECFMG certification' },
                  { value: 'No', label: 'No' },
                ]}
                tooltip="Required if you graduated from a medical school outside the US/Canada"
                required
              />
              {data.ecfmg.applicable === 'Yes' && (
                <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/30 rounded-lg">
                  <FormField
                    label="ECFMG Number"
                    id="ecfmgNumber"
                    value={data.ecfmg.ecfmgNumber || ''}
                    onChange={(v) => onChange({ ecfmg: { ...data.ecfmg, ecfmgNumber: v } })}
                    placeholder="ECFMG certificate number"
                    required
                  />
                  <FormField
                    label="Issue Date"
                    id="ecfmgDate"
                    value={data.ecfmg.issueDate || ''}
                    onChange={(v) => onChange({ ecfmg: { ...data.ecfmg, issueDate: v } })}
                    type="date"
                    required
                  />
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
