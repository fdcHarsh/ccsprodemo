import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect, FormCheckboxGroup } from './FormFields';
import { EducationSection as EducationSectionType, ProfessionalDegree, PostGraduateEducation, OtherGraduateEducation, OtherProfessionalDegree, US_STATES } from '@/types/lhl234Profile';
import { Plus, Trash2, GraduationCap, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EducationSectionProps {
  data: EducationSectionType;
  onChange: (data: Partial<EducationSectionType>) => void;
}

const DEGREE_TYPES = [
  { value: 'MD', label: 'Doctor of Medicine (MD)' },
  { value: 'DO', label: 'Doctor of Osteopathy (DO)' },
  { value: 'DDS', label: 'Doctor of Dental Surgery (DDS)' },
  { value: 'DMD', label: 'Doctor of Dental Medicine (DMD)' },
  { value: 'DC', label: 'Doctor of Chiropractic (DC)' },
  { value: 'DPM', label: 'Doctor of Podiatric Medicine (DPM)' },
  { value: 'Other', label: 'Other' },
];

const TRAINING_TYPES = [
  { value: 'Internship', label: 'Internship' },
  { value: 'Residency', label: 'Residency' },
  { value: 'Fellowship', label: 'Fellowship' },
  { value: 'Teaching Appointment', label: 'Teaching Appointment' },
];

export function EducationSectionComponent({ data, onChange }: EducationSectionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    professional: true,
    otherProfessional: false,
    postgrad: true,
    other: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateProfessionalDegree = (field: keyof ProfessionalDegree, value: any) => {
    onChange({
      professionalDegree: { ...data.professionalDegree, [field]: value },
    });
  };

  // Attachment A: Other Professional Degrees
  const addOtherProfDegree = () => {
    const newEntry: OtherProfessionalDegree = {
      institution: '', address: '', city: '', state: '', degree: '', attendanceFrom: '', attendanceTo: '',
    };
    onChange({ otherProfessionalDegrees: [...(data.otherProfessionalDegrees || []), newEntry] });
  };

  const updateOtherProfDegree = (index: number, field: keyof OtherProfessionalDegree, value: string) => {
    const updated = [...(data.otherProfessionalDegrees || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ otherProfessionalDegrees: updated });
  };

  const removeOtherProfDegree = (index: number) => {
    onChange({ otherProfessionalDegrees: (data.otherProfessionalDegrees || []).filter((_, i) => i !== index) });
  };

  const addPostGrad = () => {
    const newEntry: PostGraduateEducation = {
      types: [],
      specialty: '',
      institution: '',
      address: '',
      city: '',
      state: '',
      programCompleted: false,
      attendanceFrom: '',
      attendanceTo: '',
      programDirector: '',
    };
    onChange({ postGraduateEducation: [...data.postGraduateEducation, newEntry] });
  };

  const updatePostGrad = (index: number, field: keyof PostGraduateEducation, value: any) => {
    const updated = [...data.postGraduateEducation];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ postGraduateEducation: updated });
  };

  const removePostGrad = (index: number) => {
    onChange({
      postGraduateEducation: data.postGraduateEducation.filter((_, i) => i !== index),
    });
  };

  const addGradEducation = () => {
    const newEntry: OtherGraduateEducation = {
      institution: '',
      address: '',
      city: '',
      state: '',
      degree: '',
      attendanceFrom: '',
      attendanceTo: '',
    };
    onChange({ otherGraduateEducation: [...data.otherGraduateEducation, newEntry] });
  };

  const updateGradEducation = (index: number, field: keyof OtherGraduateEducation, value: string) => {
    const updated = [...data.otherGraduateEducation];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ otherGraduateEducation: updated });
  };

  const removeGradEducation = (index: number) => {
    onChange({
      otherGraduateEducation: data.otherGraduateEducation.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Professional Degree */}
      <Collapsible open={openSections.professional} onOpenChange={() => toggleSection('professional')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Professional Degree (Medical, Dental, etc.)
                </CardTitle>
                {openSections.professional ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormSelect
                  label="Degree Type"
                  id="degreeType"
                  value={data.professionalDegree.degreeType}
                  onChange={(v) => updateProfessionalDegree('degreeType', v)}
                  options={DEGREE_TYPES}
                  tooltip="Your primary professional degree"
                  required
                />
                {data.professionalDegree.degreeType === 'Other' && (
                  <FormField
                    label="Please specify degree type"
                    id="otherDegreeType"
                    value={data.professionalDegree.otherDegreeType || ''}
                    onChange={(v) => updateProfessionalDegree('otherDegreeType', v)}
                    placeholder="Specify degree type"
                    required
                  />
                )}
                <FormField
                  label="Issuing Institution"
                  id="degreeInstitution"
                  value={data.professionalDegree.institution}
                  onChange={(v) => updateProfessionalDegree('institution', v)}
                  placeholder="Baylor College of Medicine"
                  required
                  className="lg:col-span-2"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Address"
                  id="degreeAddress"
                  value={data.professionalDegree.address}
                  onChange={(v) => updateProfessionalDegree('address', v)}
                  placeholder="1 Baylor Plaza"
                  required
                  className="md:col-span-2"
                />
                <FormField
                  label="City"
                  id="degreeCity"
                  value={data.professionalDegree.city}
                  onChange={(v) => updateProfessionalDegree('city', v)}
                  placeholder="Houston"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="State/Country"
                    id="degreeState"
                    value={data.professionalDegree.state}
                    onChange={(v) => updateProfessionalDegree('state', v)}
                    options={US_STATES}
                    required
                  />
                  <FormField
                    label="Postal Code"
                    id="degreePostalCode"
                    value={data.professionalDegree.postalCode || ''}
                    onChange={(v) => updateProfessionalDegree('postalCode', v)}
                    placeholder="77030"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="Degree"
                  id="degreeName"
                  value={data.professionalDegree.degree}
                  onChange={(v) => updateProfessionalDegree('degree', v)}
                  placeholder="Doctor of Medicine"
                  required
                />
                <FormField
                  label="Attendance From"
                  id="degreeFrom"
                  value={data.professionalDegree.attendanceFrom}
                  onChange={(v) => updateProfessionalDegree('attendanceFrom', v)}
                  type="month"
                  tooltip="Month and year you started"
                  required
                />
                <FormField
                  label="Attendance To"
                  id="degreeTo"
                  value={data.professionalDegree.attendanceTo}
                  onChange={(v) => updateProfessionalDegree('attendanceTo', v)}
                  type="month"
                  tooltip="Month and year you graduated"
                  required
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Attachment A: Other Professional Degrees */}
      <Collapsible open={openSections.otherProfessional} onOpenChange={() => toggleSection('otherProfessional')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Other Professional Degrees — Attachment A
                  {(data.otherProfessionalDegrees || []).length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({(data.otherProfessionalDegrees || []).length})
                    </span>
                  )}
                </CardTitle>
                {openSections.otherProfessional ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add additional professional degrees (MD, DO, DDS, etc.) beyond your primary degree listed above.
              </p>
              {(data.otherProfessionalDegrees || []).map((deg, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Professional Degree #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOtherProfDegree(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Institution"
                        id={`otherProfInst_${index}`}
                        value={deg.institution}
                        onChange={(v) => updateOtherProfDegree(index, 'institution', v)}
                        placeholder="Issuing institution"
                        required
                        className="md:col-span-2"
                      />
                      <FormField
                        label="Address"
                        id={`otherProfAddr_${index}`}
                        value={deg.address}
                        onChange={(v) => updateOtherProfDegree(index, 'address', v)}
                        placeholder="Street address"
                        className="md:col-span-2"
                      />
                      <FormField
                        label="City"
                        id={`otherProfCity_${index}`}
                        value={deg.city}
                        onChange={(v) => updateOtherProfDegree(index, 'city', v)}
                        placeholder="City"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                          label="State/Country"
                          id={`otherProfState_${index}`}
                          value={deg.state}
                          onChange={(v) => updateOtherProfDegree(index, 'state', v)}
                          options={US_STATES}
                          required
                        />
                        <FormField
                          label="Postal Code"
                          id={`otherProfZip_${index}`}
                          value={deg.postalCode || ''}
                          onChange={(v) => updateOtherProfDegree(index, 'postalCode', v)}
                          placeholder="ZIP"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        label="Degree"
                        id={`otherProfDegree_${index}`}
                        value={deg.degree}
                        onChange={(v) => updateOtherProfDegree(index, 'degree', v)}
                        placeholder="e.g., Doctor of Medicine"
                        required
                      />
                      <FormField
                        label="Attendance From"
                        id={`otherProfFrom_${index}`}
                        value={deg.attendanceFrom}
                        onChange={(v) => updateOtherProfDegree(index, 'attendanceFrom', v)}
                        type="month"
                        required
                      />
                      <FormField
                        label="Attendance To"
                        id={`otherProfTo_${index}`}
                        value={deg.attendanceTo}
                        onChange={(v) => updateOtherProfDegree(index, 'attendanceTo', v)}
                        type="month"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addOtherProfDegree} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Professional Degree
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={openSections.postgrad} onOpenChange={() => toggleSection('postgrad')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Post-Graduate Education
                  {data.postGraduateEducation.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({data.postGraduateEducation.length} program{data.postGraduateEducation.length > 1 ? 's' : ''})
                    </span>
                  )}
                </CardTitle>
                {openSections.postgrad ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {data.postGraduateEducation.map((pg, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Training Program #{index + 1}</CardTitle>
                      {data.postGraduateEducation.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePostGrad(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormCheckboxGroup
                      label="Type of Training"
                      id={`pgType_${index}`}
                      value={pg.types}
                      onChange={(v) => updatePostGrad(index, 'types', v)}
                      options={TRAINING_TYPES}
                      tooltip="Select all that apply"
                      required
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Specialty"
                        id={`pgSpecialty_${index}`}
                        value={pg.specialty}
                        onChange={(v) => updatePostGrad(index, 'specialty', v)}
                        placeholder="e.g., Internal Medicine"
                        tooltip="Specialty of this training program"
                        required
                      />
                      <FormField
                        label="Institution"
                        id={`pgInstitution_${index}`}
                        value={pg.institution}
                        onChange={(v) => updatePostGrad(index, 'institution', v)}
                        placeholder="Hospital/Institution name"
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Address"
                        id={`pgAddress_${index}`}
                        value={pg.address}
                        onChange={(v) => updatePostGrad(index, 'address', v)}
                        placeholder="Street address"
                        required
                        className="md:col-span-2"
                      />
                      <FormField
                        label="City"
                        id={`pgCity_${index}`}
                        value={pg.city}
                        onChange={(v) => updatePostGrad(index, 'city', v)}
                        placeholder="Houston"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                          label="State/Country"
                          id={`pgState_${index}`}
                          value={pg.state}
                          onChange={(v) => updatePostGrad(index, 'state', v)}
                          options={US_STATES}
                          required
                        />
                        <FormField
                          label="Postal Code"
                          id={`pgPostalCode_${index}`}
                          value={pg.postalCode || ''}
                          onChange={(v) => updatePostGrad(index, 'postalCode', v)}
                          placeholder="77030"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                      <FormField
                        label="Attendance From"
                        id={`pgFrom_${index}`}
                        value={pg.attendanceFrom}
                        onChange={(v) => updatePostGrad(index, 'attendanceFrom', v)}
                        type="month"
                        required
                      />
                      <FormField
                        label="Attendance To"
                        id={`pgTo_${index}`}
                        value={pg.attendanceTo}
                        onChange={(v) => updatePostGrad(index, 'attendanceTo', v)}
                        type="month"
                        required
                      />
                      <FormField
                        label="Program Director"
                        id={`pgDirector_${index}`}
                        value={pg.programDirector}
                        onChange={(v) => updatePostGrad(index, 'programDirector', v)}
                        placeholder="Director's name"
                        required
                      />
                      <FormField
                        label="Current Director (if known)"
                        id={`pgCurrentDirector_${index}`}
                        value={pg.currentProgramDirector || ''}
                        onChange={(v) => updatePostGrad(index, 'currentProgramDirector', v)}
                        placeholder="Current director"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pg.programCompleted}
                        onChange={(e) => updatePostGrad(index, 'programCompleted', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm flex items-center gap-2">
                        Program Successfully Completed
                        {pg.programCompleted && <Check className="h-4 w-4 text-success" />}
                      </span>
                    </label>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addPostGrad} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Training Program
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Other Graduate Education */}
      <Collapsible open={openSections.other} onOpenChange={() => toggleSection('other')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Other Graduate-Level Education (Optional)
                  {data.otherGraduateEducation.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({data.otherGraduateEducation.length})
                    </span>
                  )}
                </CardTitle>
                {openSections.other ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add any additional graduate degrees such as Master's, PhD, MPH, etc.
              </p>
              {data.otherGraduateEducation.map((edu, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Graduate Degree #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGradEducation(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Issuing Institution"
                        id={`gradInstitution_${index}`}
                        value={edu.institution}
                        onChange={(v) => updateGradEducation(index, 'institution', v)}
                        placeholder="University name"
                        required
                      />
                      <FormField
                        label="Degree"
                        id={`gradDegree_${index}`}
                        value={edu.degree}
                        onChange={(v) => updateGradEducation(index, 'degree', v)}
                        placeholder="e.g., Master of Public Health"
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        label="City"
                        id={`gradCity_${index}`}
                        value={edu.city}
                        onChange={(v) => updateGradEducation(index, 'city', v)}
                        placeholder="City"
                        required
                      />
                      <FormSelect
                        label="State/Country"
                        id={`gradState_${index}`}
                        value={edu.state}
                        onChange={(v) => updateGradEducation(index, 'state', v)}
                        options={US_STATES}
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          label="From"
                          id={`gradFrom_${index}`}
                          value={edu.attendanceFrom}
                          onChange={(v) => updateGradEducation(index, 'attendanceFrom', v)}
                          type="month"
                          required
                        />
                        <FormField
                          label="To"
                          id={`gradTo_${index}`}
                          value={edu.attendanceTo}
                          onChange={(v) => updateGradEducation(index, 'attendanceTo', v)}
                          type="month"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addGradEducation} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Graduate Education
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
