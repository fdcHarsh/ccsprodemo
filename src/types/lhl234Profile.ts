// LHL234 Texas Standardized Credentialing Application Types
// Based on Texas Insurance Code § 1452.052

export interface LHL234Profile {
  // Section 1: Individual Information
  individualInfo: IndividualInfo;
  // Section 2: Education
  education: EducationSection;
  // Section 3: Licenses & Certificates
  licenses: LicensesSection;
  // Section 4: Professional/Specialty Information
  specialtyInfo: SpecialtySection;
  // Section 5: Work History
  workHistory: WorkHistorySection;
  // Section 6: Hospital Affiliations
  hospitalAffiliations: HospitalAffiliationsSection;
  // Section 7: References
  references: ReferencesSection;
  // Section 8: Professional Liability Insurance
  liabilityInsurance: LiabilityInsuranceSection;
  // Section 9: Call Coverage
  callCoverage: CallCoverageSection;
  // Section 10: Practice Locations
  practiceLocations: PracticeLocation[];
  // Section 11: Disclosure Questions
  disclosures: DisclosuresSection;
  // Section III: Authorization and Signature (LHL234 pages 11-12)
  attestation: AttestationSection;
  // Page 12: Required Attachments Checklist
  requiredAttachments: RequiredAttachmentsChecklist;
  // Metadata
  metadata: ProfileMetadata;
}

export interface ProfileMetadata {
  lastSaved: string;
  completionPercentage: number;
  sectionProgress: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

// Section 1: Individual Information
export interface IndividualInfo {
  typeOfProfessional: 'MD' | 'DO' | 'DDS' | 'DMD' | 'DC' | 'DPM' | 'RN' | 'CRNA' | 'NP' | 'PA' | 'Dentist' | 'Other' | '';
  otherProfessionalType?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: 'Jr.' | 'Sr.' | 'II' | 'III' | 'IV' | '';
  maidenName?: string;
  maidenNameYears?: string;
  otherName?: string;
  otherNameYears?: string;
  // Home Address
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homePostalCode: string;
  homePhone: string;
  ssn: string;
  gender: 'Female' | 'Male' | '';
  // Correspondence Address
  useDifferentCorrespondence: boolean;
  correspondenceAddress?: string;
  correspondenceCity?: string;
  correspondenceState?: string;
  correspondencePostalCode?: string;
  correspondencePhone?: string;
  correspondenceFax?: string;
  email: string;
  dateOfBirth: string;
  placeOfBirth: string;
  citizenship: string;
  visaNumberStatus?: string;
  eligibleToWorkInUS: 'Yes' | 'No' | '';
  // Military
  militaryService: 'Yes' | 'No' | '';
  militaryDatesFrom?: string;
  militaryDatesTo?: string;
  militaryLocation?: string;
  militaryBranch?: 'Army' | 'Navy' | 'Air Force' | 'Marines' | 'Coast Guard' | 'Public Health Service' | 'Other' | '';
  otherMilitaryBranch?: string;
  militaryActiveDuty?: 'Yes' | 'No' | '';
}

// Section 2: Education
export interface EducationSection {
  professionalDegree: ProfessionalDegree;
  otherProfessionalDegrees: OtherProfessionalDegree[];
  postGraduateEducation: PostGraduateEducation[];
  otherGraduateEducation: OtherGraduateEducation[];
}

export interface ProfessionalDegree {
  degreeType: 'MD' | 'DO' | 'DDS' | 'DMD' | 'DC' | 'DPM' | 'Other' | '';
  otherDegreeType?: string;
  institution: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  degree: string;
  attendanceFrom: string;
  attendanceTo: string;
}

export interface OtherProfessionalDegree {
  institution: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  degree: string;
  attendanceFrom: string;
  attendanceTo: string;
}

export interface PostGraduateEducation {
  types: ('Internship' | 'Residency' | 'Fellowship' | 'Teaching Appointment')[];
  specialty: string;
  institution: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  programCompleted: boolean;
  attendanceFrom: string;
  attendanceTo: string;
  programDirector: string;
  currentProgramDirector?: string;
}

export interface OtherGraduateEducation {
  institution: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  degree: string;
  attendanceFrom: string;
  attendanceTo: string;
}

// Section 3: Licenses & Certificates
export interface LicensesSection {
  stateLicenses: StateLicense[];
  deaRegistration: DEARegistration;
  dpsRegistration: DPSRegistration;
  otherCDSRegistrations: OtherCDSRegistration[];
  providerNumbers: ProviderNumbers;
  medicareMedicaid: MedicareMedicaid;
  ecfmg: ECFMGCertification;
}

export interface StateLicense {
  licenseType: 'Medical License' | 'Dental License' | 'Chiropractic License' | 'Podiatry License' | 'Nursing License' | 'APRN' | 'Other' | '';
  otherLicenseType?: string;
  licenseNumber: string;
  state: string;
  issueDate: string;
  expirationDate: string;
  currentlyPractice: 'Yes' | 'No' | '';
}

export interface DEARegistration {
  deaNumber: string;
  issueDate: string;
  expirationDate: string;
}

export interface DPSRegistration {
  dpsNumber?: string;
  issueDate?: string;
  expirationDate?: string;
}

export interface OtherCDSRegistration {
  type: string;
  number: string;
  state: string;
  issueDate: string;
  expirationDate: string;
  currentlyPractice: 'Yes' | 'No' | '';
}

export interface ProviderNumbers {
  upin?: string;
  npi: string;
}

export interface MedicareMedicaid {
  medicareParticipating: 'Yes' | 'No' | '';
  medicareProviderNumber?: string;
  medicaidParticipating: 'Yes' | 'No' | '';
  medicaidProviderNumber?: string;
}

export interface ECFMGCertification {
  applicable: 'N/A' | 'Yes' | 'No' | '';
  ecfmgNumber?: string;
  issueDate?: string;
}

// Section 4: Professional/Specialty Information
export interface SpecialtySection {
  primarySpecialty: SpecialtyInfo;
  secondarySpecialty?: SpecialtyInfo;
  additionalSpecialties: SpecialtyInfo[];
  otherPracticeInterests?: string;
}

export interface SpecialtyInfo {
  specialty: string;
  boardCertified: 'Yes' | 'No' | '';
  certifyingBoard?: string;
  initialCertificationDate?: string;
  recertificationDates?: string;
  expirationDate?: string;
  // If not board certified
  boardStatus?: 'results_pending' | 'eligible_part2' | 'intending_to_sit' | 'not_planning' | '';
  intendingToSitDate?: string;
  // Directory listings
  listInHMODirectory: 'Yes' | 'No' | '';
  listInPPODirectory: 'Yes' | 'No' | '';
  listInPOSDirectory: 'Yes' | 'No' | '';
}

// Section 5: Work History
export interface WorkHistorySection {
  currentPractice: WorkHistoryEntry;
  previousPractices: WorkHistoryEntry[];
  gaps: EmploymentGap[];
}

export interface WorkHistoryEntry {
  employerName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  reasonForDiscontinuance?: string;
}

export interface EmploymentGap {
  startDate: string;
  endDate: string;
  explanation: string;
}

// Section 6: Hospital Affiliations
export interface HospitalAffiliationsSection {
  hasHospitalPrivileges: 'Yes' | 'No' | '';
  admittingArrangements?: string;
  primaryHospital?: HospitalAffiliation;
  otherHospitals: HospitalAffiliation[];
  previousHospitals: PreviousHospitalAffiliation[];
}

export interface HospitalAffiliation {
  hospitalName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  fax?: string;
  email?: string;
  startDate: string;
  fullUnrestrictedPrivileges: 'Yes' | 'No' | '';
  typesOfPrivileges?: string;
  temporaryPrivileges: 'Yes' | 'No' | '';
  admissionPercentage?: number;
}

export interface PreviousHospitalAffiliation extends HospitalAffiliation {
  endDate: string;
  reasonForDiscontinuance: string;
}

// Section 7: References
export interface ReferencesSection {
  references: Reference[];
}

export interface Reference {
  nameTitle: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  email?: string;
}

// Section 8: Professional Liability Insurance
export interface LiabilityInsuranceSection {
  selfInsured: boolean;
  currentInsurance: MalpracticeInsurance;
  previousInsurance?: MalpracticeInsurance;
}

export interface MalpracticeInsurance {
  carrierName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  policyNumber: string;
  effectiveDate: string;
  expirationDate: string;
  coveragePerOccurrence: string;
  coverageAggregate: string;
  coverageType: 'Individual' | 'Shared' | '';
  lengthWithCarrier: string;
}

// Section 9: Call Coverage
export interface CallCoverageSection {
  useAttachedList: boolean;
  callCoverageColleagues: CallCoverageColleague[];
  callCoverageAttachment?: string;
  usePartnerList: boolean;
  partners: string[];
  partnerListAttachment?: string;
}

export interface CallCoverageColleague {
  name: string;
  specialty: string;
}

// Section 10: Practice Locations
export interface PracticeLocation {
  locationNumber: number;
  isPrimary: boolean;
  serviceTypes: ServiceType[];
  practiceNameForDirectory: string;
  corporateName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  fax?: string;
  email?: string;
  backOfficePhone?: string;
  medicaidNumber?: string;
  taxId: string;
  groupNumber?: string;
  groupName?: string;
  currentlyPracticing: 'Yes' | 'No' | '';
  expectedStartDate?: string;
  listInDirectory: 'Yes' | 'No' | '';
  officeManagerName?: string;
  officeManagerPhone?: string;
  officeManagerFax?: string;
  credentialingContactName?: string;
  credentialingContactPhone?: string;
  credentialingContactEmail?: string;
  credentialingContactAddress?: string;
  credentialingContactCity?: string;
  credentialingContactState?: string;
  credentialingContactPostalCode?: string;
  credentialingContactFax?: string;
  billingCompanyName?: string;
  billingRepName?: string;
  billingRepPhone?: string;
  billingRepAddress?: string;
  billingRepCity?: string;
  billingRepState?: string;
  billingRepPostalCode?: string;
  billingRepFax?: string;
  billingRepEmail?: string;
  departmentName?: string;
  checkPayableTo?: string;
  canBillElectronically: 'Yes' | 'No' | '';
  officeHours: OfficeHours;
  phoneCoverage: string;
  hasNonPhysicianProviders: 'Yes' | 'No' | '';
  patientAcceptance: PatientAcceptance;
  practiceRestrictions: PracticeRestrictions;
  nonPhysicianProviders: NonPhysicianProvider[];
  languages: LanguageInfo;
  accessibility: AccessibilityInfo;
  certifications: LocationCertifications;
  onSiteServices: OnSiteServices;
  additionalProcedures?: string;
  anesthesia: AnesthesiaInfo;
}

export type ServiceType = 
  | 'Solo Primary Care' 
  | 'Solo Specialty Care' 
  | 'Group Primary Care' 
  | 'Group Single Specialty' 
  | 'Group Multi-Specialty';

export interface OfficeHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  closed: boolean;
  morning?: string;
  afternoon?: string;
  evening?: string;
}

export type PhoneCoverageOption = 'Answering Service' | 'Voicemail with instructions to call answering service' | 'Voicemail with other instructions' | 'None';

export interface PatientAcceptance {
  allNewPatients: boolean;
  existingWithPayorChange: boolean;
  newWithReferral: boolean;
  newMedicare: boolean;
  newMedicaid: boolean;
  variesByPlan: boolean;
  explanation?: string;
}

export interface PracticeRestrictions {
  maleOnly: boolean;
  femaleOnly: boolean;
  ageRestrictions: boolean;
  ageRestrictionsDetails?: string;
  other: boolean;
  otherDetails?: string;
}

export interface NonPhysicianProvider {
  name: string;
  designation: string;
  stateLicenseNo: string;
}

export interface LanguageInfo {
  providerLanguages?: string;
  staffLanguages?: string;
  interpretersAvailable: 'Yes' | 'No' | '';
  interpreterLanguages?: string;
}

export interface AccessibilityInfo {
  meetsADAStandards: 'Yes' | 'No' | '';
  handicappedAccessible: {
    building: boolean;
    parking: boolean;
    restroom: boolean;
    other: boolean;
    otherDetail?: string;
  };
  disabledServices: {
    tty: boolean;
    asl: boolean;
    mentalPhysicalImpairment: boolean;
    other: boolean;
    otherDetail?: string;
  };
  publicTransportation: {
    bus: boolean;
    regionalTrain: boolean;
    other: boolean;
    otherDetail?: string;
  };
  childcareServices: 'Yes' | 'No' | '';
  minorityBusinessEnterprise: 'Yes' | 'No' | '';
}

export interface LocationCertifications {
  bls?: CertificationEntry;
  advancedLifeSupportOB?: CertificationEntry;
  atls?: CertificationEntry;
  cpr?: CertificationEntry;
  acls?: CertificationEntry;
  pals?: CertificationEntry;
  nals?: CertificationEntry;
  other?: CertificationEntry & { name: string };
}

export interface CertificationEntry {
  staffExpirationDate?: string;
  providerExpirationDate?: string;
}

export interface OnSiteServices {
  laboratoryServices: 'Yes' | 'No' | '';
  laboratoryCertifications?: string;
  xray: 'Yes' | 'No' | '';
  xrayCertifications?: string;
  // Explicit boolean fields per LHL234 service item
  radiologyServices?: boolean;
  ekg?: boolean;
  minorLacerations?: boolean;
  pulmonaryFunctionTests?: boolean;
  allergyInjections?: boolean;
  allergySkinTests?: boolean;
  officeGynecology?: boolean;
  drawingBlood?: boolean;
  immunizations?: boolean;
  flexibleSigmoidoscopy?: boolean;
  audiometry?: boolean;
  asthmaTreatments?: boolean;
  osteopathicManipulations?: boolean;
  ivHydration?: boolean;
  cardiacStressTests?: boolean;
  physicalTherapies?: boolean;
  otherServices?: boolean;
  otherServicesDetail?: string;
}

export interface AnesthesiaInfo {
  administered: 'Yes' | 'No' | '';
  categories?: string;
  administeredBy?: string;
}

// Section III: Authorization and Signature
export interface AttestationSection {
  applyingEntities: string;
  initialsPage11: string;
  initialsDate: string;
  signature: string;
  printedName: string;
  last4SsnOrNpi: string;
  signatureDate: string;
}

// Section 11: Disclosure Questions
export interface DisclosuresSection {
  questions: DisclosureQuestion[];
  malpracticeClaims: MalpracticeClaim[];
}

// Page 12: Required Attachments Checklist
export interface RequiredAttachmentItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
  group: 'lhl234' | 'internal';
  documentId?: string; // linked Document Vault ID
  filename?: string;
  uploadedAt?: string;
}

export interface RequiredAttachmentsChecklist {
  items: RequiredAttachmentItem[];
}

export interface DisclosureAttachment {
  id: string;
  filename: string;
  uploadedAt: string;
}

export interface DisclosureQuestion {
  questionNumber: number;
  questionText: string;
  category: 'licensure' | 'hospital' | 'education' | 'dea' | 'government' | 'investigations' | 'malpractice' | 'criminal' | 'ability';
  answer: 'Yes' | 'No' | '';
  explanation?: string;
  attachments?: DisclosureAttachment[];
}

export interface MalpracticeClaim {
  incidentDate: string;
  claimFiledDate: string;
  claimStatus: 'Pending' | 'Dismissed' | 'Settled (with prejudice)' | 'Settled (without prejudice)' | 'Judgment for Defendant(s)' | 'Judgment for Plaintiff(s)' | 'Mediation or Arbitration' | '';
  insuranceCarrier: string;
  carrierAddress: string;
  carrierCity: string;
  carrierState: string;
  carrierPostalCode: string;
  carrierPhone: string;
  policyNumber: string;
  awardAmount?: string;
  amountPaid?: string;
  methodOfResolution: string;
  descriptionOfAllegations: string;
  primaryOrCoDefendant: 'Primary' | 'Co-defendant' | '';
  numberOfCoDefendants?: number;
  yourInvolvement: 'Attending Physician' | 'Consulting Physician' | 'Supervising Physician' | 'Surgical Assistant' | 'Other' | '';
  descriptionOfInjury: string;
  inNPDB: 'Yes' | 'No' | 'Unknown' | '';
}

// Default empty profile
export const createEmptyLHL234Profile = (): LHL234Profile => ({
  individualInfo: {
    typeOfProfessional: '',
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    homeAddress: '',
    homeCity: '',
    homeState: 'TX',
    homePostalCode: '',
    homePhone: '',
    ssn: '',
    gender: '',
    useDifferentCorrespondence: false,
    email: '',
    dateOfBirth: '',
    placeOfBirth: '',
    citizenship: 'United States',
    eligibleToWorkInUS: 'Yes',
    militaryService: '',
  },
  education: {
    professionalDegree: {
      degreeType: '',
      institution: '',
      address: '',
      city: '',
      state: '',
      degree: '',
      attendanceFrom: '',
      attendanceTo: '',
    },
    otherProfessionalDegrees: [],
    postGraduateEducation: [],
    otherGraduateEducation: [],
  },
  licenses: {
    stateLicenses: [{
      licenseType: 'Medical License',
      licenseNumber: '',
      state: 'TX',
      issueDate: '',
      expirationDate: '',
      currentlyPractice: 'Yes',
    }],
    deaRegistration: { deaNumber: '', issueDate: '', expirationDate: '' },
    dpsRegistration: {},
    otherCDSRegistrations: [],
    providerNumbers: { npi: '' },
    medicareMedicaid: { medicareParticipating: '', medicaidParticipating: '' },
    ecfmg: { applicable: '' },
  },
  specialtyInfo: {
    primarySpecialty: {
      specialty: '',
      boardCertified: '',
      listInHMODirectory: 'Yes',
      listInPPODirectory: 'Yes',
      listInPOSDirectory: 'Yes',
    },
    additionalSpecialties: [],
  },
  workHistory: {
    currentPractice: {
      employerName: '',
      address: '',
      city: '',
      state: 'TX',
      postalCode: '',
      startDate: '',
      isCurrent: true,
    },
    previousPractices: [],
    gaps: [],
  },
  hospitalAffiliations: {
    hasHospitalPrivileges: '',
    otherHospitals: [],
    previousHospitals: [],
  },
  references: {
    references: [
      { nameTitle: '', phone: '', address: '', city: '', state: '', postalCode: '' },
      { nameTitle: '', phone: '', address: '', city: '', state: '', postalCode: '' },
      { nameTitle: '', phone: '', address: '', city: '', state: '', postalCode: '' },
    ],
  },
  liabilityInsurance: {
    selfInsured: false,
    currentInsurance: {
      carrierName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
      policyNumber: '',
      effectiveDate: '',
      expirationDate: '',
      coveragePerOccurrence: '',
      coverageAggregate: '',
      coverageType: '',
      lengthWithCarrier: '',
    },
  },
  callCoverage: {
    useAttachedList: false,
    callCoverageColleagues: [],
    usePartnerList: false,
    partners: [],
  },
  practiceLocations: [],
  disclosures: {
    questions: createDisclosureQuestions(),
    malpracticeClaims: [],
  },
  attestation: {
    applyingEntities: '',
    initialsPage11: '',
    initialsDate: '',
    signature: '',
    printedName: '',
    last4SsnOrNpi: '',
    signatureDate: '',
  },
  requiredAttachments: {
    items: createRequiredAttachmentItems(),
  },
  metadata: {
    lastSaved: '',
    completionPercentage: 0,
    sectionProgress: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

function createDisclosureQuestions(): DisclosureQuestion[] {
  return [
    { questionNumber: 1, category: 'licensure', answer: '', questionText: 'Has your license to practice, in your profession, ever been denied, suspended, revoked, restricted, voluntarily surrendered while under investigation, or have you ever been subject to a consent order, probation or any conditions or limitations by any state licensing board?' },
    { questionNumber: 2, category: 'licensure', answer: '', questionText: 'Have you ever received a reprimand or been fined by any state licensing board?' },
    { questionNumber: 3, category: 'hospital', answer: '', questionText: 'Have your clinical privileges or Medical Staff membership at any hospital or healthcare institution ever been denied, suspended, revoked, restricted, denied renewal or subject to probationary or to other disciplinary conditions?' },
    { questionNumber: 4, category: 'hospital', answer: '', questionText: 'Have you voluntarily surrendered, limited your privileges or not reapplied for privileges while under investigation?' },
    { questionNumber: 5, category: 'hospital', answer: '', questionText: 'Have you ever been terminated for cause or not renewed for cause from participation, or been subject to any disciplinary action, by any managed care organizations?' },
    { questionNumber: 6, category: 'education', answer: '', questionText: 'Were you ever placed on probation, disciplined, formally reprimanded, suspended or asked to resign during an internship, residency, fellowship, preceptorship or other clinical education program?' },
    { questionNumber: 7, category: 'education', answer: '', questionText: 'Have you ever, while under investigation, voluntarily withdrawn or prematurely terminated your status as a student or employee in any clinical education program?' },
    { questionNumber: 8, category: 'education', answer: '', questionText: 'Have any of your board certifications or eligibility ever been revoked?' },
    { questionNumber: 9, category: 'education', answer: '', questionText: 'Have you ever chosen not to re-certify or voluntarily surrendered your board certification(s) while under investigation?' },
    { questionNumber: 10, category: 'dea', answer: '', questionText: 'Have your Federal DEA and/or DPS Controlled Substances Certificate(s) or authorization(s) ever been denied, suspended, revoked, restricted, denied renewal, or voluntarily relinquished?' },
    { questionNumber: 11, category: 'government', answer: '', questionText: 'Have you ever been disciplined, excluded from, debarred, suspended, reprimanded, sanctioned, censured, disqualified or otherwise restricted in regard to participation in the Medicare or Medicaid program?' },
    { questionNumber: 12, category: 'investigations', answer: '', questionText: 'Are you currently or have you ever been the subject of an investigation by any hospital, licensing authority, DEA or DPS authorizing entities, education or training program, Medicare or Medicaid program, or any other private, federal or state health program?' },
    { questionNumber: 13, category: 'investigations', answer: '', questionText: 'To your knowledge, has information pertaining to you ever been reported to the National Practitioner Data Bank or Healthcare Integrity and Protection Data Bank?' },
    { questionNumber: 14, category: 'investigations', answer: '', questionText: 'Have you ever received sanctions from or been the subject of investigation by any regulatory agencies (e.g., CLIA, OSHA, etc.)?' },
    { questionNumber: 15, category: 'investigations', answer: '', questionText: 'Have you ever been investigated, sanctioned, reprimanded or cautioned by a military hospital, facility, or agency?' },
    { questionNumber: 16, category: 'malpractice', answer: '', questionText: 'Have you had any malpractice actions within the past 5 years (pending, settled, arbitrated, mediated or litigated)?' },
    { questionNumber: 17, category: 'criminal', answer: '', questionText: 'Have you ever been convicted of, pled guilty to, or pled nolo contendere to any felony that is reasonably related to your qualifications, competence, functions, or duties as a medical professional?' },
    { questionNumber: 18, category: 'criminal', answer: '', questionText: 'Have you ever been convicted of, pled guilty to, or pled nolo contendere to any felony including an act of violence, child abuse or a sexual offense?' },
    { questionNumber: 19, category: 'criminal', answer: '', questionText: 'Have you been court-martialed for actions related to your duties as a medical professional?' },
    { questionNumber: 20, category: 'ability', answer: '', questionText: 'Are you currently engaged in the illegal use of drugs?' },
    { questionNumber: 21, category: 'ability', answer: '', questionText: 'Do you use any chemical substances that would in any way impair or limit your ability to practice medicine and perform the functions of your job with reasonable skill and safety?' },
    { questionNumber: 22, category: 'ability', answer: '', questionText: 'Do you have any reason to believe that you would pose a risk to the safety or well-being of your patients?' },
    { questionNumber: 23, category: 'ability', answer: '', questionText: 'Are you unable to perform the essential functions of a practitioner in your area of practice, with or without reasonable accommodation?' },
  ];
}

function createRequiredAttachmentItems(): RequiredAttachmentItem[] {
  return [
    // LHL234 Supplemental Attachments (official, from LHL234 page 12)
    { id: 'dea_certificate', label: 'Copy of DEA or DPS Controlled Substances Registration Certificate', required: true, checked: false, group: 'lhl234' },
    { id: 'other_cds_certificate', label: 'Copy of other CDS Registration Certificate(s)', required: false, checked: false, group: 'lhl234' },
    { id: 'liability_face_sheet', label: 'Current professional liability insurance face sheet (expiration dates, limits, applicant name)', required: true, checked: false, group: 'lhl234' },
    { id: 'irs_w9', label: 'IRS W-9 for each Tax Identification Number used', required: true, checked: false, group: 'lhl234' },
    { id: 'workers_comp', label: 'Workers compensation certificate of coverage (if applicable)', required: false, checked: false, group: 'lhl234' },
    { id: 'clia_certificate', label: 'CLIA certification(s) (if applicable)', required: false, checked: false, group: 'lhl234' },
    { id: 'radiology_cert', label: 'Radiology certification(s) (if applicable)', required: false, checked: false, group: 'lhl234' },
    { id: 'dd214', label: 'DD-214 / Record of Military Service (if applicable)', required: false, checked: false, group: 'lhl234' },
    // CCS Pro Supporting Documents
    { id: 'professional_license', label: 'Copy of Current Professional License', required: true, checked: false, group: 'internal' },
    { id: 'diploma', label: 'Copy of Professional School Diploma', required: false, checked: false, group: 'internal' },
    { id: 'curriculum_vitae', label: 'Curriculum Vitae / Resume', required: true, checked: false, group: 'internal' },
    { id: 'npi_confirmation', label: 'NPI Confirmation Letter', required: true, checked: false, group: 'internal' },
    { id: 'immunization_records', label: 'Immunization Records / TB Test Results', required: false, checked: false, group: 'internal' },
    { id: 'board_certification', label: 'Copy of Board Certification', required: false, checked: false, group: 'internal' },
    { id: 'ecfmg', label: 'ECFMG Certificate (if applicable)', required: false, checked: false, group: 'internal' },
  ];
}


// US States for dropdown
export const US_STATES = [
  { value: 'TX', label: 'Texas' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
];

export const PROFESSIONAL_TYPES = [
  { value: 'MD', label: 'Physician (MD)' },
  { value: 'DO', label: 'Physician (DO)' },
  { value: 'DDS', label: 'Dentist (DDS)' },
  { value: 'DMD', label: 'Dentist (DMD)' },
  { value: 'DC', label: 'Chiropractor (DC)' },
  { value: 'DPM', label: 'Podiatrist (DPM)' },
  { value: 'NP', label: 'Nurse Practitioner (NP)' },
  { value: 'PA', label: 'Physician Assistant (PA)' },
  { value: 'CRNA', label: 'Nurse Anesthetist (CRNA)' },
  { value: 'Other', label: 'Other' },
];

export const MILITARY_BRANCHES = [
  { value: 'Army', label: 'Army' },
  { value: 'Navy', label: 'Navy' },
  { value: 'Air Force', label: 'Air Force' },
  { value: 'Marines', label: 'Marines' },
  { value: 'Coast Guard', label: 'Coast Guard' },
  { value: 'Public Health Service', label: 'Public Health Service' },
  { value: 'Other', label: 'Other' },
];

export const PHONE_COVERAGE_OPTIONS = [
  { value: 'Answering Service', label: 'Answering Service' },
  { value: 'Voicemail with instructions to call answering service', label: 'Voicemail with instructions to call answering service' },
  { value: 'Voicemail with other instructions', label: 'Voicemail with other instructions' },
  { value: 'None', label: 'None' },
];
