import { useState } from 'react';
import { User, GraduationCap, FileText, Briefcase, Building2, Users, Shield, MapPin, Phone, ClipboardList, Save, Check, Download, ChevronLeft, ChevronRight, Loader2, Paperclip, FileSignature } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLHL234Profile } from '@/hooks/useLHL234Profile';
import { IndividualInfoSection } from '@/components/profile-builder/IndividualInfoSection';
import { EducationSectionComponent } from '@/components/profile-builder/EducationSection';
import { LicensesSectionComponent } from '@/components/profile-builder/LicensesSection';
import { WorkHistorySectionComponent } from '@/components/profile-builder/WorkHistorySection';
import { DisclosuresSectionComponent } from '@/components/profile-builder/DisclosuresSection';
import { SpecialtySectionComponent } from '@/components/profile-builder/SpecialtySection';
import { HospitalAffiliationsSectionComponent } from '@/components/profile-builder/HospitalAffiliationsSection';
import { ReferencesSectionComponent } from '@/components/profile-builder/ReferencesSection';
import { LiabilityInsuranceSectionComponent } from '@/components/profile-builder/LiabilityInsuranceSection';
import { CallCoverageSectionComponent } from '@/components/profile-builder/CallCoverageSection';
import { PracticeLocationsSectionComponent } from '@/components/profile-builder/PracticeLocationsSection';
import { RequiredAttachmentsSectionComponent } from '@/components/profile-builder/RequiredAttachmentsSection';
import { AuthorizationSignatureSectionComponent } from '@/components/profile-builder/AuthorizationSignatureSection';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const sections = [
  { id: 'individual', title: 'Individual Information', icon: User, description: 'Personal and contact details' },
  { id: 'education', title: 'Education', icon: GraduationCap, description: 'Professional degrees and training' },
  { id: 'licenses', title: 'Licenses & Certificates', icon: FileText, description: 'State licenses, DEA, NPI' },
  { id: 'specialty', title: 'Specialty Information', icon: Briefcase, description: 'Board certifications' },
  { id: 'workHistory', title: 'Work History', icon: Building2, description: 'Employment for past 10 years' },
  { id: 'hospitals', title: 'Hospital Affiliations', icon: Building2, description: 'Hospital privileges' },
  { id: 'references', title: 'References', icon: Users, description: 'Professional peer references' },
  { id: 'insurance', title: 'Liability Insurance', icon: Shield, description: 'Malpractice coverage' },
  { id: 'callCoverage', title: 'Call Coverage', icon: Phone, description: 'Coverage arrangements' },
  { id: 'practiceLocations', title: 'Practice Locations', icon: MapPin, description: 'Office locations' },
  { id: 'disclosures', title: 'Disclosure Questions', icon: ClipboardList, description: '23 required questions + Attachment G' },
  { id: 'attestation', title: 'Authorization & Signature', icon: FileSignature, description: 'Section III attestation' },
  { id: 'requiredAttachments', title: 'Required Attachments', icon: Paperclip, description: 'Page 12 document checklist' },
];

export default function ProfileBuilderPage() {
  const { profile, setProfile, updateSection, updateNestedField, completionPercentage, sectionProgress, isSaving, lastSaved } = useLHL234Profile();
  const [currentSection, setCurrentSection] = useState(0);

  const handleSave = () => {
    toast.success('Profile saved successfully!');
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };

  const currentSectionId = sections[currentSection].id;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">LHL234 Profile Builder</h1>
          <p className="text-muted-foreground">Texas Standardized Credentialing Application</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
            <p className="text-xs text-muted-foreground">
              {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Auto-save enabled'}
            </p>
          </div>
          <Button onClick={handleSave} className="btn-primary-gradient">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:w-80 flex-shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section, index) => {
                const progress = sectionProgress[section.id] || 0;
                const isComplete = progress === 100;
                const isCurrent = index === currentSection;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                      isCurrent ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium',
                      isComplete ? 'bg-success text-success-foreground' : isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    )}>
                      {isComplete ? <Check className="h-4 w-4" /> : <section.icon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', isCurrent && 'text-primary')}>{section.title}</p>
                      <p className="text-xs text-muted-foreground">{progress}% complete</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => { const Icon = sections[currentSection].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
                Section {currentSection + 1}: {sections[currentSection].title}
              </CardTitle>
              <CardDescription>{sections[currentSection].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentSectionId === 'individual' && (
                <IndividualInfoSection
                  data={profile.individualInfo}
                  onChange={(field, value) => updateNestedField('individualInfo', field, value)}
                />
              )}
              {currentSectionId === 'education' && (
                <EducationSectionComponent
                  data={profile.education}
                  onChange={(data) => updateSection('education', data)}
                />
              )}
              {currentSectionId === 'licenses' && (
                <LicensesSectionComponent
                  data={profile.licenses}
                  onChange={(data) => updateSection('licenses', data)}
                />
              )}
              {currentSectionId === 'workHistory' && (
                <WorkHistorySectionComponent
                  data={profile.workHistory}
                  onChange={(data) => updateSection('workHistory', data)}
                />
              )}
              {currentSectionId === 'specialty' && (
                <SpecialtySectionComponent
                  data={profile.specialtyInfo}
                  onChange={(data) => updateSection('specialtyInfo', data)}
                />
              )}
              {currentSectionId === 'hospitals' && (
                <HospitalAffiliationsSectionComponent
                  data={profile.hospitalAffiliations}
                  onChange={(data) => updateSection('hospitalAffiliations', data)}
                />
              )}
              {currentSectionId === 'references' && (
                <ReferencesSectionComponent
                  data={profile.references}
                  onChange={(data) => updateSection('references', data)}
                />
              )}
              {currentSectionId === 'insurance' && (
                <LiabilityInsuranceSectionComponent
                  data={profile.liabilityInsurance}
                  onChange={(data) => updateSection('liabilityInsurance', data)}
                />
              )}
              {currentSectionId === 'callCoverage' && (
                <CallCoverageSectionComponent
                  data={profile.callCoverage}
                  onChange={(data) => updateSection('callCoverage', data)}
                />
              )}
              {currentSectionId === 'practiceLocations' && (
                <PracticeLocationsSectionComponent
                  data={profile.practiceLocations}
                  onChange={(locations) => {
                    setProfile(prev => ({ ...prev, practiceLocations: locations }));
                  }}
                />
              )}
              {currentSectionId === 'disclosures' && (
                <DisclosuresSectionComponent
                  data={profile.disclosures}
                  onChange={(data) => updateSection('disclosures', data)}
                />
              )}
              {currentSectionId === 'attestation' && (
                <AuthorizationSignatureSectionComponent
                  data={profile.attestation}
                  onChange={(field, value) => updateNestedField('attestation', field, value)}
                />
              )}
              {currentSectionId === 'requiredAttachments' && (
                <RequiredAttachmentsSectionComponent
                  data={profile.requiredAttachments}
                  onChange={(data) => updateSection('requiredAttachments', data)}
                  hasOtherCDS={profile.licenses.otherCDSRegistrations.length > 0}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={prevSection} disabled={currentSection === 0}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {currentSection < sections.length - 1 ? (
                  <Button onClick={nextSection} className="btn-primary-gradient">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSave} className="btn-primary-gradient">
                    <Download className="mr-2 h-4 w-4" />
                    Export Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
