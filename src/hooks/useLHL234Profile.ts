import { useState, useEffect, useCallback, useMemo } from 'react';
import { LHL234Profile, createEmptyLHL234Profile } from '@/types/lhl234Profile';
import { useDebounce } from './useDebounce';

const STORAGE_KEY = 'ccspro_lhl234_profile';

export function useLHL234Profile() {
  const [profile, setProfile] = useState<LHL234Profile>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const empty = createEmptyLHL234Profile();
        // Migrate old profiles missing requiredAttachments
        if (!parsed.requiredAttachments) {
          parsed.requiredAttachments = empty.requiredAttachments;
        }
        // Migrate old profiles missing attestation
        if (!parsed.attestation) {
          parsed.attestation = empty.attestation;
        }
        // Migrate old practice locations with array phoneCoverage to string + normalize legacy values
        if (Array.isArray(parsed.practiceLocations)) {
          const legacyPhoneCoverageMap: Record<string, string> = {
            'Voice mail with instructions to call answering service': 'Voicemail with instructions to call answering service',
            'Voice mail with other instructions': 'Voicemail with other instructions',
          };
          parsed.practiceLocations = parsed.practiceLocations.map((loc: any) => {
            const raw = Array.isArray(loc.phoneCoverage) ? loc.phoneCoverage[0] || '' : (loc.phoneCoverage || '');
            const phoneCoverage = legacyPhoneCoverageMap[raw] ?? raw;
            const hasNonPhysicianProviders = loc.hasNonPhysicianProviders || '';
            return { ...loc, phoneCoverage, hasNonPhysicianProviders };
          });
        }
        return parsed;
      } catch {
        return createEmptyLHL234Profile();
      }
    }
    return createEmptyLHL234Profile();
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const debouncedProfile = useDebounce(profile, 500);
  
  // Auto-save to localStorage
  useEffect(() => {
    setIsSaving(true);
    const updated = {
      ...debouncedProfile,
      metadata: {
        ...debouncedProfile.metadata,
        lastSaved: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionPercentage: calculateCompletion(debouncedProfile),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLastSaved(new Date());
    setIsSaving(false);
  }, [debouncedProfile]);
  
  const updateSection = useCallback(<K extends keyof LHL234Profile>(
    section: K,
    data: Partial<LHL234Profile[K]>
  ) => {
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  }, []);
  
  const updateNestedField = useCallback(<
    S extends keyof LHL234Profile,
    F extends keyof LHL234Profile[S]
  >(
    section: S,
    field: F,
    value: LHL234Profile[S][F]
  ) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }, []);
  
  const resetProfile = useCallback(() => {
    const emptyProfile = createEmptyLHL234Profile();
    setProfile(emptyProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyProfile));
  }, []);
  
  const completionPercentage = useMemo(() => 
    calculateCompletion(profile), [profile]);
  
  const sectionProgress = useMemo(() => 
    calculateSectionProgress(profile), [profile]);
  
  return {
    profile,
    setProfile,
    updateSection,
    updateNestedField,
    resetProfile,
    isSaving,
    lastSaved,
    completionPercentage,
    sectionProgress,
  };
}

function calculateCompletion(profile: LHL234Profile): number {
  let filled = 0;
  let total = 0;
  
  // Section 1: Individual Information (15 required fields)
  const s1 = profile.individualInfo;
  const s1Fields = [
    s1.typeOfProfessional, s1.lastName, s1.firstName, s1.homeAddress,
    s1.homeCity, s1.homeState, s1.homePostalCode, s1.homePhone,
    s1.ssn, s1.gender, s1.email, s1.dateOfBirth, s1.placeOfBirth,
    s1.citizenship, s1.eligibleToWorkInUS,
  ];
  total += s1Fields.length;
  filled += s1Fields.filter(Boolean).length;
  
  // Section 2: Education (8 required fields)
  const s2 = profile.education.professionalDegree;
  const s2Fields = [
    s2.degreeType, s2.institution, s2.address, s2.city, 
    s2.state, s2.degree, s2.attendanceFrom, s2.attendanceTo,
  ];
  total += s2Fields.length;
  filled += s2Fields.filter(Boolean).length;
  
  // Section 3: Licenses (6 required fields)
  const s3 = profile.licenses;
  if (s3.stateLicenses.length > 0) {
    const lic = s3.stateLicenses[0];
    const s3Fields = [
      lic.licenseNumber, lic.state, lic.issueDate, lic.expirationDate,
      s3.deaRegistration.deaNumber, s3.providerNumbers.npi,
    ];
    total += s3Fields.length;
    filled += s3Fields.filter(Boolean).length;
  }
  
  // Section 4: Specialty (2 required fields)
  const s4 = profile.specialtyInfo.primarySpecialty;
  const s4Fields = [s4.specialty, s4.boardCertified];
  total += s4Fields.length;
  filled += s4Fields.filter(Boolean).length;
  
  // Section 5: Work History (5 required fields)
  const s5 = profile.workHistory.currentPractice;
  const s5Fields = [s5.employerName, s5.address, s5.city, s5.state, s5.startDate];
  total += s5Fields.length;
  filled += s5Fields.filter(Boolean).length;
  
  // Section 6: Hospital Affiliations (1 required field)
  total += 1;
  if (profile.hospitalAffiliations.hasHospitalPrivileges) filled += 1;
  
  // Section 7: References (9 required fields: 3 refs * 3 fields)
  const refs = profile.references.references;
  total += 9;
  refs.slice(0, 3).forEach(ref => {
    if (ref.nameTitle) filled++;
    if (ref.phone) filled++;
    if (ref.address) filled++;
  });
  
  // Section 8: Liability Insurance (6 required fields)
  const s8 = profile.liabilityInsurance.currentInsurance;
  const s8Fields = [
    s8.carrierName, s8.policyNumber, s8.effectiveDate, s8.expirationDate,
    s8.coveragePerOccurrence, s8.coverageAggregate,
  ];
  total += s8Fields.length;
  filled += s8Fields.filter(Boolean).length;
  
  // Section 11: Disclosures (23 questions)
  const disclosures = profile.disclosures.questions;
  total += 23;
  filled += disclosures.filter(q => q.answer !== '').length;

  // Attestation (4 key fields)
  const att = profile.attestation;
  if (att) {
    const attFields = [att.signature, att.printedName, att.initialsPage11, att.signatureDate];
    total += attFields.length;
    filled += attFields.filter(Boolean).length;
  }
  
  return Math.round((filled / total) * 100);
}

function calculateSectionProgress(profile: LHL234Profile): Record<string, number> {
  const progress: Record<string, number> = {};
  
  // Section 1: Individual Info
  const s1 = profile.individualInfo;
  const s1Required = [s1.typeOfProfessional, s1.lastName, s1.firstName, s1.homeAddress, s1.homeCity, s1.homeState, s1.homePostalCode, s1.homePhone, s1.ssn, s1.gender, s1.email, s1.dateOfBirth, s1.placeOfBirth, s1.citizenship, s1.eligibleToWorkInUS];
  progress['individual'] = Math.round((s1Required.filter(Boolean).length / s1Required.length) * 100);
  
  // Section 2: Education
  const s2 = profile.education.professionalDegree;
  const s2Required = [s2.degreeType, s2.institution, s2.city, s2.state, s2.degree, s2.attendanceFrom, s2.attendanceTo];
  progress['education'] = Math.round((s2Required.filter(Boolean).length / s2Required.length) * 100);
  
  // Section 3: Licenses
  const s3 = profile.licenses;
  let s3Filled = 0, s3Total = 6;
  if (s3.stateLicenses[0]?.licenseNumber) s3Filled++;
  if (s3.stateLicenses[0]?.state) s3Filled++;
  if (s3.stateLicenses[0]?.issueDate) s3Filled++;
  if (s3.stateLicenses[0]?.expirationDate) s3Filled++;
  if (s3.deaRegistration.deaNumber) s3Filled++;
  if (s3.providerNumbers.npi) s3Filled++;
  progress['licenses'] = Math.round((s3Filled / s3Total) * 100);
  
  // Section 4: Specialty
  const s4 = profile.specialtyInfo.primarySpecialty;
  const s4Required = [s4.specialty, s4.boardCertified];
  progress['specialty'] = Math.round((s4Required.filter(Boolean).length / s4Required.length) * 100);
  
  // Section 5: Work History
  const s5 = profile.workHistory.currentPractice;
  const s5Required = [s5.employerName, s5.address, s5.city, s5.state, s5.startDate];
  progress['workHistory'] = Math.round((s5Required.filter(Boolean).length / s5Required.length) * 100);
  
  // Section 6: Hospital Affiliations
  progress['hospitals'] = profile.hospitalAffiliations.hasHospitalPrivileges ? 100 : 0;
  
  // Section 7: References
  const refs = profile.references.references;
  let refFilled = 0;
  refs.slice(0, 3).forEach(ref => {
    if (ref.nameTitle && ref.phone && ref.address) refFilled++;
  });
  progress['references'] = Math.round((refFilled / 3) * 100);
  
  // Section 8: Liability Insurance
  const s8 = profile.liabilityInsurance.currentInsurance;
  const s8Required = [s8.carrierName, s8.policyNumber, s8.effectiveDate, s8.expirationDate, s8.coveragePerOccurrence];
  progress['insurance'] = Math.round((s8Required.filter(Boolean).length / s8Required.length) * 100);
  
  // Section 9: Call Coverage
  progress['callCoverage'] = profile.callCoverage.useAttachedList || profile.callCoverage.callCoverageColleagues.length > 0 ? 100 : 0;
  
  // Section 10: Practice Locations
  progress['practiceLocations'] = profile.practiceLocations.length > 0 ? 100 : 0;
  
  // Section 11: Disclosures
  const answeredQuestions = profile.disclosures.questions.filter(q => q.answer !== '').length;
  progress['disclosures'] = Math.round((answeredQuestions / 23) * 100);

  // Attestation
  const att = profile.attestation;
  if (att) {
    const attRequired = [att.signature, att.printedName, att.initialsPage11, att.signatureDate];
    progress['attestation'] = Math.round((attRequired.filter(Boolean).length / attRequired.length) * 100);
  } else {
    progress['attestation'] = 0;
  }
  
  // Page 12: Required Attachments
  const reqItems = profile.requiredAttachments?.items || [];
  const reqRequired = reqItems.filter(i => i.required);
  const reqUploaded = reqRequired.filter(i => i.filename).length;
  progress['requiredAttachments'] = reqRequired.length > 0 ? Math.round((reqUploaded / reqRequired.length) * 100) : 0;
  
  return progress;
}
