import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect, FormRadioGroup, FormCheckboxGroup } from './FormFields';
import { PracticeLocation, NonPhysicianProvider, US_STATES, PHONE_COVERAGE_OPTIONS } from '@/types/lhl234Profile';
import { MapPin, Plus, Trash2, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PracticeLocationsSectionProps {
  data: PracticeLocation[];
  onChange: (data: PracticeLocation[]) => void;
}

const YES_NO = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const SERVICE_TYPE_OPTIONS = [
  { value: 'Solo Primary Care', label: 'Solo Primary Care' },
  { value: 'Solo Specialty Care', label: 'Solo Specialty Care' },
  { value: 'Group Primary Care', label: 'Group Primary Care' },
  { value: 'Group Single Specialty', label: 'Group Single Specialty' },
  { value: 'Group Multi-Specialty', label: 'Group Multi-Specialty' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const CERT_KEYS = ['bls', 'atls', 'acls', 'nals', 'advancedLifeSupportOB', 'cpr', 'pals', 'other'] as const;
const CERT_LABELS: Record<string, string> = {
  bls: 'BLS',
  atls: 'ATLS',
  acls: 'ACLS',
  nals: 'NALS',
  advancedLifeSupportOB: 'Advanced Life Support OB',
  cpr: 'CPR',
  pals: 'PALS',
  other: 'Other',
};

const OTHER_SERVICE_KEYS = [
  'radiologyServices', 'ekg', 'minorLacerations', 'pulmonaryFunctionTests',
  'allergyInjections', 'allergySkinTests', 'officeGynecology', 'drawingBlood',
  'immunizations', 'flexibleSigmoidoscopy', 'audiometry', 'asthmaTreatments',
  'osteopathicManipulations', 'ivHydration', 'cardiacStressTests', 'physicalTherapies',
] as const;

const OTHER_SERVICE_LABELS: Record<string, string> = {
  radiologyServices: 'Radiology Services',
  ekg: 'EKG',
  minorLacerations: 'Minor Lacerations',
  pulmonaryFunctionTests: 'Pulmonary Function Tests',
  allergyInjections: 'Allergy Injections',
  allergySkinTests: 'Allergy Skin Tests',
  officeGynecology: 'Office Gynecology',
  drawingBlood: 'Drawing Blood',
  immunizations: 'Immunizations',
  flexibleSigmoidoscopy: 'Flexible Sigmoidoscopy',
  audiometry: 'Audiometry',
  asthmaTreatments: 'Asthma Treatments',
  osteopathicManipulations: 'Osteopathic Manipulations',
  ivHydration: 'IV Hydration',
  cardiacStressTests: 'Cardiac Stress Tests',
  physicalTherapies: 'Physical Therapies',
};

function createEmptyLocation(num: number): PracticeLocation {
  return {
    locationNumber: num,
    isPrimary: num === 1,
    serviceTypes: [],
    practiceNameForDirectory: '',
    corporateName: '',
    address: '',
    city: '',
    state: 'TX',
    postalCode: '',
    phone: '',
    taxId: '',
    currentlyPracticing: 'Yes',
    listInDirectory: 'Yes',
    canBillElectronically: '',
    hasNonPhysicianProviders: '',
    officeHours: {
      monday: { closed: false }, tuesday: { closed: false }, wednesday: { closed: false },
      thursday: { closed: false }, friday: { closed: false }, saturday: { closed: true }, sunday: { closed: true },
    },
    phoneCoverage: '',
    patientAcceptance: {
      allNewPatients: true, existingWithPayorChange: false, newWithReferral: false,
      newMedicare: false, newMedicaid: false, variesByPlan: false,
    },
    practiceRestrictions: { maleOnly: false, femaleOnly: false, ageRestrictions: false, other: false },
    nonPhysicianProviders: [],
    languages: { interpretersAvailable: '' },
    accessibility: {
      meetsADAStandards: '',
      handicappedAccessible: { building: false, parking: false, restroom: false, other: false },
      disabledServices: { tty: false, asl: false, mentalPhysicalImpairment: false, other: false },
      publicTransportation: { bus: false, regionalTrain: false, other: false },
      childcareServices: '',
      minorityBusinessEnterprise: '',
    },
    certifications: {},
    onSiteServices: { laboratoryServices: '', xray: '' },
    anesthesia: { administered: '' },
  };
}

export function PracticeLocationsSectionComponent({ data, onChange }: PracticeLocationsSectionProps) {
  const [openLocations, setOpenLocations] = useState<Record<number, boolean>>({ 0: true });

  const toggleLocation = (index: number) => {
    setOpenLocations(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const addLocation = () => {
    const newLoc = createEmptyLocation(data.length + 1);
    onChange([...data, newLoc]);
    setOpenLocations(prev => ({ ...prev, [data.length]: true }));
  };

  const removeLocation = (index: number) => {
    const updated = data.filter((_, i) => i !== index).map((loc, i) => ({ ...loc, locationNumber: i + 1 }));
    onChange(updated);
  };

  const updateLocation = (index: number, field: string, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateNested = (index: number, section: string, field: string, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [section]: { ...(updated[index] as any)[section], [field]: value } };
    onChange(updated);
  };

  const updateDeepNested = (index: number, section: string, sub: string, field: string, value: any) => {
    const updated = [...data];
    const current = (updated[index] as any)[section];
    updated[index] = { ...updated[index], [section]: { ...current, [sub]: { ...current[sub], [field]: value } } };
    onChange(updated);
  };

  const updateOfficeHours = (locIndex: number, day: string, field: string, value: any) => {
    const updated = [...data];
    const hours = { ...updated[locIndex].officeHours };
    (hours as any)[day] = { ...(hours as any)[day], [field]: value };
    updated[locIndex] = { ...updated[locIndex], officeHours: hours };
    onChange(updated);
  };

  const updateCertification = (locIndex: number, certKey: string, field: string, value: any) => {
    const updated = [...data];
    const certs = { ...updated[locIndex].certifications };
    (certs as any)[certKey] = { ...(certs as any)[certKey], [field]: value };
    updated[locIndex] = { ...updated[locIndex], certifications: certs };
    onChange(updated);
  };

  const addNonPhysicianProvider = (locIndex: number) => {
    const updated = [...data];
    const newProvider: NonPhysicianProvider = { name: '', designation: '', stateLicenseNo: '' };
    updated[locIndex] = { ...updated[locIndex], nonPhysicianProviders: [...updated[locIndex].nonPhysicianProviders, newProvider] };
    onChange(updated);
  };

  const updateNonPhysicianProvider = (locIndex: number, provIndex: number, field: keyof NonPhysicianProvider, value: string) => {
    const updated = [...data];
    const providers = [...updated[locIndex].nonPhysicianProviders];
    providers[provIndex] = { ...providers[provIndex], [field]: value };
    updated[locIndex] = { ...updated[locIndex], nonPhysicianProviders: providers };
    onChange(updated);
  };

  const removeNonPhysicianProvider = (locIndex: number, provIndex: number) => {
    const updated = [...data];
    updated[locIndex] = { ...updated[locIndex], nonPhysicianProviders: updated[locIndex].nonPhysicianProviders.filter((_, i) => i !== provIndex) };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          List all practice locations where you provide patient care. Complete one section per location. 
          The first location will be marked as your primary location.
        </AlertDescription>
      </Alert>

      {data.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No Practice Locations</p>
            <p className="text-sm mb-4">Add your first practice location to get started.</p>
            <Button onClick={addLocation} className="btn-primary-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Practice Location
            </Button>
          </CardContent>
        </Card>
      )}

      {data.map((location, index) => (
        <Collapsible key={index} open={openLocations[index] ?? false} onOpenChange={() => toggleLocation(index)}>
          <Card className={location.isPrimary ? 'border-primary/30' : ''}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location #{location.locationNumber}
                    {location.isPrimary && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">PRIMARY</span>}
                    {location.practiceNameForDirectory && (
                      <span className="text-sm font-normal text-muted-foreground">— {location.practiceNameForDirectory}</span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!location.isPrimary && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeLocation(index); }} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {openLocations[index] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h4>
                  <FormCheckboxGroup
                    label="Type of Service"
                    id={`loc_service_${index}`}
                    value={location.serviceTypes}
                    onChange={(v) => updateLocation(index, 'serviceTypes', v)}
                    options={SERVICE_TYPE_OPTIONS}
                    required
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Practice Name (for Directory)" id={`loc_name_${index}`} value={location.practiceNameForDirectory} onChange={(v) => updateLocation(index, 'practiceNameForDirectory', v)} placeholder="Practice name" required />
                    <FormField label="Corporate Name" id={`loc_corp_${index}`} value={location.corporateName} onChange={(v) => updateLocation(index, 'corporateName', v)} placeholder="Corporate/legal name" />
                    <FormField label="Address" id={`loc_addr_${index}`} value={location.address} onChange={(v) => updateLocation(index, 'address', v)} placeholder="Street address" required className="md:col-span-2" />
                    <FormField label="City" id={`loc_city_${index}`} value={location.city} onChange={(v) => updateLocation(index, 'city', v)} placeholder="City" required />
                    <div className="grid grid-cols-2 gap-4">
                      <FormSelect label="State" id={`loc_state_${index}`} value={location.state} onChange={(v) => updateLocation(index, 'state', v)} options={US_STATES} required />
                      <FormField label="ZIP" id={`loc_zip_${index}`} value={location.postalCode} onChange={(v) => updateLocation(index, 'postalCode', v)} placeholder="ZIP" required />
                    </div>
                    <FormField label="Phone" id={`loc_phone_${index}`} value={location.phone} onChange={(v) => updateLocation(index, 'phone', v)} placeholder="(xxx) xxx-xxxx" type="tel" required />
                    <FormField label="Fax" id={`loc_fax_${index}`} value={location.fax || ''} onChange={(v) => updateLocation(index, 'fax', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                    <FormField label="Tax ID / EIN" id={`loc_tax_${index}`} value={location.taxId} onChange={(v) => updateLocation(index, 'taxId', v)} placeholder="XX-XXXXXXX" required />
                    <FormField label="Email" id={`loc_email_${index}`} value={location.email || ''} onChange={(v) => updateLocation(index, 'email', v)} placeholder="office@example.com" type="email" />
                  </div>
                  {/* Additional Identifiers after Tax ID */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Back Office Phone Number" id={`loc_backphone_${index}`} value={location.backOfficePhone || ''} onChange={(v) => updateLocation(index, 'backOfficePhone', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                    <FormField label="Site-Specific Medicaid Number" id={`loc_medicaid_${index}`} value={location.medicaidNumber || ''} onChange={(v) => updateLocation(index, 'medicaidNumber', v)} placeholder="Medicaid number" />
                    <FormField label="Group Number (for Tax ID)" id={`loc_groupnum_${index}`} value={location.groupNumber || ''} onChange={(v) => updateLocation(index, 'groupNumber', v)} placeholder="Group number" />
                    <FormField label="Group Name (for Tax ID)" id={`loc_groupname_${index}`} value={location.groupName || ''} onChange={(v) => updateLocation(index, 'groupName', v)} placeholder="Group name" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormRadioGroup label="Currently Practicing?" id={`loc_practicing_${index}`} value={location.currentlyPracticing} onChange={(v) => updateLocation(index, 'currentlyPracticing', v)} options={YES_NO} />
                    <FormRadioGroup label="List in Directory?" id={`loc_directory_${index}`} value={location.listInDirectory} onChange={(v) => updateLocation(index, 'listInDirectory', v)} options={YES_NO} />
                  </div>
                  {location.currentlyPracticing === 'No' && (
                    <FormField label="Expected Start Date" id={`loc_expected_${index}`} value={location.expectedStartDate || ''} onChange={(v) => updateLocation(index, 'expectedStartDate', v)} type="date" />
                  )}
                </div>

                {/* Office Hours */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Office Hours</h4>
                  <div className="space-y-2">
                    {DAYS.map((day) => {
                      const hours = location.officeHours[day];
                      return (
                        <div key={day} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0">
                          <span className="w-24 text-sm font-medium capitalize">{day}</span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hours.closed}
                              onChange={(e) => updateOfficeHours(index, day, 'closed', e.target.checked)}
                              className="h-4 w-4 rounded border-input"
                            />
                            <span className="text-sm text-muted-foreground">Closed</span>
                          </label>
                          {!hours.closed && (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={hours.morning || ''}
                                onChange={(e) => updateOfficeHours(index, day, 'morning', e.target.value)}
                                placeholder="AM hours"
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              />
                              <span className="text-muted-foreground">-</span>
                              <input
                                type="text"
                                value={hours.afternoon || ''}
                                onChange={(e) => updateOfficeHours(index, day, 'afternoon', e.target.value)}
                                placeholder="PM hours"
                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Administrative */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Administrative</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Department Name (if hospital-based)" id={`loc_dept_${index}`} value={location.departmentName || ''} onChange={(v) => updateLocation(index, 'departmentName', v)} placeholder="Department name" />
                    <FormField label="Check Payable To" id={`loc_check_${index}`} value={location.checkPayableTo || ''} onChange={(v) => updateLocation(index, 'checkPayableTo', v)} placeholder="Payee name" />
                    <FormSelect label="Phone Coverage" id={`loc_phonecov_${index}`} value={location.phoneCoverage || ''} onChange={(v) => updateLocation(index, 'phoneCoverage', v)} options={PHONE_COVERAGE_OPTIONS} />
                    <FormRadioGroup label="Can Bill Electronically?" id={`loc_ebill_${index}`} value={location.canBillElectronically} onChange={(v) => updateLocation(index, 'canBillElectronically', v)} options={YES_NO} />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Office Manager</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField label="Office Manager Name" id={`loc_mgr_${index}`} value={location.officeManagerName || ''} onChange={(v) => updateLocation(index, 'officeManagerName', v)} placeholder="Name" />
                    <FormField label="Office Manager Phone" id={`loc_mgr_phone_${index}`} value={location.officeManagerPhone || ''} onChange={(v) => updateLocation(index, 'officeManagerPhone', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                    <FormField label="Office Manager Fax" id={`loc_mgr_fax_${index}`} value={location.officeManagerFax || ''} onChange={(v) => updateLocation(index, 'officeManagerFax', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                  </div>
                </div>

                {/* Credentialing Contact */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Credentialing Contact</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Name" id={`loc_cred_${index}`} value={location.credentialingContactName || ''} onChange={(v) => updateLocation(index, 'credentialingContactName', v)} placeholder="Credentialing contact name" />
                    <FormField label="Phone" id={`loc_cred_phone_${index}`} value={location.credentialingContactPhone || ''} onChange={(v) => updateLocation(index, 'credentialingContactPhone', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                    <FormField label="Address" id={`loc_cred_addr_${index}`} value={location.credentialingContactAddress || ''} onChange={(v) => updateLocation(index, 'credentialingContactAddress', v)} placeholder="Street address" className="md:col-span-2" />
                    <FormField label="City" id={`loc_cred_city_${index}`} value={location.credentialingContactCity || ''} onChange={(v) => updateLocation(index, 'credentialingContactCity', v)} placeholder="City" />
                    <div className="grid grid-cols-2 gap-4">
                      <FormSelect label="State" id={`loc_cred_state_${index}`} value={location.credentialingContactState || ''} onChange={(v) => updateLocation(index, 'credentialingContactState', v)} options={US_STATES} />
                      <FormField label="ZIP" id={`loc_cred_zip_${index}`} value={location.credentialingContactPostalCode || ''} onChange={(v) => updateLocation(index, 'credentialingContactPostalCode', v)} placeholder="ZIP" />
                    </div>
                    <FormField label="Fax" id={`loc_cred_fax_${index}`} value={location.credentialingContactFax || ''} onChange={(v) => updateLocation(index, 'credentialingContactFax', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                    <FormField label="Email" id={`loc_cred_email_${index}`} value={location.credentialingContactEmail || ''} onChange={(v) => updateLocation(index, 'credentialingContactEmail', v)} placeholder="email@example.com" type="email" />
                  </div>
                </div>

                {/* Billing Contact */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Billing Contact</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Billing Company Name" id={`loc_bill_co_${index}`} value={location.billingCompanyName || ''} onChange={(v) => updateLocation(index, 'billingCompanyName', v)} placeholder="Billing company" />
                    <FormField label="Representative Name" id={`loc_bill_rep_${index}`} value={location.billingRepName || ''} onChange={(v) => updateLocation(index, 'billingRepName', v)} placeholder="Representative name" />
                    <FormField label="Address" id={`loc_bill_addr_${index}`} value={location.billingRepAddress || ''} onChange={(v) => updateLocation(index, 'billingRepAddress', v)} placeholder="Street address" className="md:col-span-2" />
                    <FormField label="City" id={`loc_bill_city_${index}`} value={location.billingRepCity || ''} onChange={(v) => updateLocation(index, 'billingRepCity', v)} placeholder="City" />
                    <div className="grid grid-cols-2 gap-4">
                      <FormSelect label="State" id={`loc_bill_state_${index}`} value={location.billingRepState || ''} onChange={(v) => updateLocation(index, 'billingRepState', v)} options={US_STATES} />
                      <FormField label="ZIP" id={`loc_bill_zip_${index}`} value={location.billingRepPostalCode || ''} onChange={(v) => updateLocation(index, 'billingRepPostalCode', v)} placeholder="ZIP" />
                    </div>
                    <FormField label="Phone" id={`loc_bill_phone_${index}`} value={location.billingRepPhone || ''} onChange={(v) => updateLocation(index, 'billingRepPhone', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                    <FormField label="Fax" id={`loc_bill_fax_${index}`} value={location.billingRepFax || ''} onChange={(v) => updateLocation(index, 'billingRepFax', v)} placeholder="(xxx) xxx-xxxx" type="tel" />
                    <FormField label="Email" id={`loc_bill_email_${index}`} value={location.billingRepEmail || ''} onChange={(v) => updateLocation(index, 'billingRepEmail', v)} placeholder="email@example.com" type="email" />
                  </div>
                </div>

                {/* Patient Acceptance */}
                <Card>
                  <CardHeader><CardTitle className="text-base">This Practice Location Accepts</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { key: 'allNewPatients', label: 'All new patients' },
                        { key: 'existingWithPayorChange', label: 'Existing patients with payor change' },
                        { key: 'newWithReferral', label: 'New patients with referral' },
                        { key: 'newMedicare', label: 'New Medicare patients' },
                        { key: 'newMedicaid', label: 'New Medicaid patients' },
                        { key: 'variesByPlan', label: 'Varies by plan' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(location.patientAcceptance as any)[key]}
                            onChange={(e) => updateNested(index, 'patientAcceptance', key, e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                    {location.patientAcceptance.variesByPlan && (
                      <div className="space-y-2">
                        <Label className="text-sm">Please explain</Label>
                        <Textarea
                          value={location.patientAcceptance.explanation || ''}
                          onChange={(e) => updateNested(index, 'patientAcceptance', 'explanation', e.target.value)}
                          placeholder="Explain how acceptance varies by plan"
                          rows={3}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Practice Limitations */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Practice Limitations</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { key: 'maleOnly', label: 'Male patients only' },
                        { key: 'femaleOnly', label: 'Female patients only' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(location.practiceRestrictions as any)[key]}
                            onChange={(e) => updateNested(index, 'practiceRestrictions', key, e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={location.practiceRestrictions.ageRestrictions}
                        onChange={(e) => updateNested(index, 'practiceRestrictions', 'ageRestrictions', e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">Age restrictions</span>
                    </label>
                    {location.practiceRestrictions.ageRestrictions && (
                      <FormField label="Age Restrictions Details" id={`loc_age_detail_${index}`} value={location.practiceRestrictions.ageRestrictionsDetails || ''} onChange={(v) => updateNested(index, 'practiceRestrictions', 'ageRestrictionsDetails', v)} placeholder="e.g., Patients 18 and older only" />
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={location.practiceRestrictions.other}
                        onChange={(e) => updateNested(index, 'practiceRestrictions', 'other', e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">Other restrictions</span>
                    </label>
                    {location.practiceRestrictions.other && (
                      <FormField label="Other Restrictions Details" id={`loc_other_restrict_${index}`} value={location.practiceRestrictions.otherDetails || ''} onChange={(v) => updateNested(index, 'practiceRestrictions', 'otherDetails', v)} placeholder="Describe other restrictions" />
                    )}
                  </CardContent>
                </Card>

                {/* Non-Physician Providers */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Non-Physician Providers</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormRadioGroup
                      label="Do nurse practitioners, physician assistants, midwives, social workers, or other non-physician providers care for patients at this location?"
                      id={`loc_nonphys_${index}`}
                      value={location.hasNonPhysicianProviders}
                      onChange={(v) => updateLocation(index, 'hasNonPhysicianProviders', v)}
                      options={YES_NO}
                    />
                    {location.hasNonPhysicianProviders === 'Yes' && (
                      <div className="space-y-3">
                        {location.nonPhysicianProviders.map((prov, pi) => (
                          <Card key={pi} className="border-dashed">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-1 grid gap-4 md:grid-cols-3">
                                  <FormField label="Name" id={`loc_np_name_${index}_${pi}`} value={prov.name} onChange={(v) => updateNonPhysicianProvider(index, pi, 'name', v)} placeholder="Provider name" />
                                  <FormField label="Professional Designation" id={`loc_np_desig_${index}_${pi}`} value={prov.designation} onChange={(v) => updateNonPhysicianProvider(index, pi, 'designation', v)} placeholder="e.g., NP, PA" />
                                  <FormField label="State and License Number" id={`loc_np_lic_${index}_${pi}`} value={prov.stateLicenseNo} onChange={(v) => updateNonPhysicianProvider(index, pi, 'stateLicenseNo', v)} placeholder="TX 12345" />
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeNonPhysicianProvider(index, pi)} className="text-destructive mt-6">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button variant="outline" onClick={() => addNonPhysicianProvider(index)} className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Non-Physician Provider
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Languages */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Languages</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Provider Languages" id={`loc_lang_${index}`} value={location.languages.providerLanguages || ''} onChange={(v) => updateNested(index, 'languages', 'providerLanguages', v)} placeholder="e.g., English, Spanish" />
                    <FormField label="Staff Languages" id={`loc_staff_lang_${index}`} value={location.languages.staffLanguages || ''} onChange={(v) => updateNested(index, 'languages', 'staffLanguages', v)} placeholder="e.g., English, Vietnamese" />
                  </div>
                  <FormRadioGroup label="Are interpreters available?" id={`loc_interp_${index}`} value={location.languages.interpretersAvailable} onChange={(v) => updateNested(index, 'languages', 'interpretersAvailable', v)} options={YES_NO} />
                  {location.languages.interpretersAvailable === 'Yes' && (
                    <FormField label="Interpreter Languages" id={`loc_interp_lang_${index}`} value={location.languages.interpreterLanguages || ''} onChange={(v) => updateNested(index, 'languages', 'interpreterLanguages', v)} placeholder="e.g., Spanish, Mandarin" />
                  )}
                </div>

                {/* Accessibility */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Accessibility</h4>
                  <FormRadioGroup label="Meets ADA Standards?" id={`loc_ada_${index}`} value={location.accessibility.meetsADAStandards} onChange={(v) => updateNested(index, 'accessibility', 'meetsADAStandards', v)} options={YES_NO} />
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Handicapped Accessible Facilities</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { key: 'building', label: 'Building' },
                        { key: 'parking', label: 'Parking' },
                        { key: 'restroom', label: 'Restroom' },
                        { key: 'other', label: 'Other' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(location.accessibility.handicappedAccessible as any)[key]}
                            onChange={(e) => updateDeepNested(index, 'accessibility', 'handicappedAccessible', key, e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                    {location.accessibility.handicappedAccessible.other && (
                      <FormField label="Other Details" id={`loc_hc_other_${index}`} value={location.accessibility.handicappedAccessible.otherDetail || ''} onChange={(v) => updateDeepNested(index, 'accessibility', 'handicappedAccessible', 'otherDetail', v)} placeholder="Describe" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Services for the Disabled</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { key: 'tty', label: 'TTY/TDD' },
                        { key: 'asl', label: 'ASL (American Sign Language)' },
                        { key: 'mentalPhysicalImpairment', label: 'Mental/Physical Impairment Services' },
                        { key: 'other', label: 'Other' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(location.accessibility.disabledServices as any)[key]}
                            onChange={(e) => updateDeepNested(index, 'accessibility', 'disabledServices', key, e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                    {location.accessibility.disabledServices.other && (
                      <FormField label="Other Details" id={`loc_ds_other_${index}`} value={location.accessibility.disabledServices.otherDetail || ''} onChange={(v) => updateDeepNested(index, 'accessibility', 'disabledServices', 'otherDetail', v)} placeholder="Describe" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Public Transportation</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { key: 'bus', label: 'Bus' },
                        { key: 'regionalTrain', label: 'Regional Train' },
                        { key: 'other', label: 'Other' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(location.accessibility.publicTransportation as any)[key]}
                            onChange={(e) => updateDeepNested(index, 'accessibility', 'publicTransportation', key, e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                    {location.accessibility.publicTransportation.other && (
                      <FormField label="Other Details" id={`loc_pt_other_${index}`} value={location.accessibility.publicTransportation.otherDetail || ''} onChange={(v) => updateDeepNested(index, 'accessibility', 'publicTransportation', 'otherDetail', v)} placeholder="Describe" />
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormRadioGroup label="Childcare Services?" id={`loc_childcare_${index}`} value={location.accessibility.childcareServices} onChange={(v) => updateNested(index, 'accessibility', 'childcareServices', v)} options={YES_NO} />
                    <FormRadioGroup label="Minority Business Enterprise?" id={`loc_mbe_${index}`} value={location.accessibility.minorityBusinessEnterprise} onChange={(v) => updateNested(index, 'accessibility', 'minorityBusinessEnterprise', v)} options={YES_NO} />
                  </div>
                </div>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Current Certifications at This Location</CardTitle>
                    <p className="text-xs text-muted-foreground">Enter applicant expiration dates in the Provider column only.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground uppercase border-b pb-2">
                        <span>Certification</span>
                        <span>Staff Expiry</span>
                        <span>Provider Expiry</span>
                      </div>
                      {CERT_KEYS.map((ck) => {
                        const cert = (location.certifications as any)[ck];
                        return (
                          <div key={ck} className="grid grid-cols-3 gap-4 items-center py-1">
                            <div>
                              <span className="text-sm">{CERT_LABELS[ck]}</span>
                              {ck === 'other' && (
                                <FormField label="" id={`loc_cert_other_name_${index}`} value={cert?.name || ''} onChange={(v) => updateCertification(index, ck, 'name', v)} placeholder="Cert name" />
                              )}
                            </div>
                            <input
                              type="date"
                              value={cert?.staffExpirationDate || ''}
                              onChange={(e) => updateCertification(index, ck, 'staffExpirationDate', e.target.value)}
                              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                            />
                            <input
                              type="date"
                              value={cert?.providerExpirationDate || ''}
                              onChange={(e) => updateCertification(index, ck, 'providerExpirationDate', e.target.value)}
                              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* On-Site Services */}
                <Card>
                  <CardHeader><CardTitle className="text-base">On-Site Services</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormRadioGroup label="Laboratory services on site?" id={`loc_lab_${index}`} value={location.onSiteServices.laboratoryServices} onChange={(v) => updateNested(index, 'onSiteServices', 'laboratoryServices', v)} options={YES_NO} />
                    {location.onSiteServices.laboratoryServices === 'Yes' && (
                      <FormField label="List CLIA, AAFP, COLA, CAP, MLE certificates" id={`loc_lab_cert_${index}`} value={location.onSiteServices.laboratoryCertifications || ''} onChange={(v) => updateNested(index, 'onSiteServices', 'laboratoryCertifications', v)} placeholder="Certificate details" />
                    )}
                    <FormRadioGroup label="X-ray services on site?" id={`loc_xray_${index}`} value={location.onSiteServices.xray} onChange={(v) => updateNested(index, 'onSiteServices', 'xray', v)} options={YES_NO} />
                    {location.onSiteServices.xray === 'Yes' && (
                      <FormField label="List certifications" id={`loc_xray_cert_${index}`} value={location.onSiteServices.xrayCertifications || ''} onChange={(v) => updateNested(index, 'onSiteServices', 'xrayCertifications', v)} placeholder="X-ray certifications" />
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Other Services Provided at This Location</Label>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {OTHER_SERVICE_KEYS.map((sk) => (
                          <label key={sk} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!(location.onSiteServices as any)[sk]}
                              onChange={(e) => updateNested(index, 'onSiteServices', sk, e.target.checked)}
                              className="h-4 w-4 rounded border-input"
                            />
                            <span className="text-sm">{OTHER_SERVICE_LABELS[sk]}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!location.onSiteServices.otherServices}
                            onChange={(e) => updateNested(index, 'onSiteServices', 'otherServices', e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm">Other</span>
                        </label>
                      </div>
                      {location.onSiteServices.otherServices && (
                        <FormField label="Other Services Detail" id={`loc_other_svc_${index}`} value={location.onSiteServices.otherServicesDetail || ''} onChange={(v) => updateNested(index, 'onSiteServices', 'otherServicesDetail', v)} placeholder="Describe other services" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Additional Office and Surgical Procedures</Label>
                      <Textarea
                        value={location.additionalProcedures || ''}
                        onChange={(e) => updateLocation(index, 'additionalProcedures', e.target.value)}
                        placeholder="List additional procedures performed at this location"
                        rows={3}
                      />
                    </div>

                    <FormRadioGroup label="Is anesthesia administered at this location?" id={`loc_anes_${index}`} value={location.anesthesia.administered} onChange={(v) => updateNested(index, 'anesthesia', 'administered', v)} options={YES_NO} />
                    {location.anesthesia.administered === 'Yes' && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Classes or categories" id={`loc_anes_cat_${index}`} value={location.anesthesia.categories || ''} onChange={(v) => updateNested(index, 'anesthesia', 'categories', v)} placeholder="Anesthesia categories" />
                        <FormField label="Who administers it?" id={`loc_anes_by_${index}`} value={location.anesthesia.administeredBy || ''} onChange={(v) => updateNested(index, 'anesthesia', 'administeredBy', v)} placeholder="e.g., CRNA, Anesthesiologist" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {data.length > 0 && (
        <Button variant="outline" onClick={addLocation} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Practice Location
        </Button>
      )}
    </div>
  );
}
