// Shared payer document checklists used by both Texas Payers page and Packet Generator

export interface PayerChecklistItem {
  id: number;
  name: string;
  uploaded: boolean;
  status: 'current' | 'expiring' | 'missing';
}

export interface PayerInfo {
  id: string;
  name: string;
  checklist: PayerChecklistItem[];
}

// Base checklist used as a template — each payer can customize
const baseChecklist: PayerChecklistItem[] = [
  { id: 1, name: 'Medical License', uploaded: true, status: 'current' },
  { id: 2, name: 'DEA Certificate', uploaded: true, status: 'current' },
  { id: 3, name: 'Board Certification', uploaded: true, status: 'current' },
  { id: 4, name: 'Malpractice Insurance', uploaded: true, status: 'expiring' },
  { id: 5, name: 'Hospital Privileges Letter', uploaded: false, status: 'missing' },
  { id: 6, name: 'NPI Verification', uploaded: true, status: 'current' },
  { id: 7, name: 'Medical School Diploma', uploaded: true, status: 'current' },
  { id: 8, name: 'Residency Certificate', uploaded: true, status: 'current' },
  { id: 9, name: 'CV/Resume', uploaded: true, status: 'current' },
  { id: 10, name: 'W-9 Form', uploaded: false, status: 'missing' },
  { id: 11, name: 'Photo ID', uploaded: true, status: 'current' },
  { id: 12, name: 'CAQH Attestation', uploaded: true, status: 'expiring' },
  { id: 13, name: 'Background Check Authorization', uploaded: false, status: 'missing' },
  { id: 14, name: 'Immunization Records', uploaded: true, status: 'current' },
  { id: 15, name: 'CME Transcript', uploaded: true, status: 'current' },
];

// Payer-specific checklists with slight variations
export const payerChecklists: Record<string, PayerChecklistItem[]> = {
  'texas-standard': [
    ...baseChecklist,
    { id: 16, name: 'LHL234 Application', uploaded: false, status: 'missing' },
    { id: 17, name: 'Work History (5 years)', uploaded: true, status: 'current' },
    { id: 18, name: 'Professional References (3)', uploaded: true, status: 'current' },
  ],
  'bcbs-tx': [
    ...baseChecklist,
    { id: 16, name: 'BCBS Provider Application', uploaded: false, status: 'missing' },
    { id: 17, name: 'Practice Location Verification', uploaded: true, status: 'current' },
  ],
  'uhc': [
    ...baseChecklist,
    { id: 16, name: 'UHC Provider Enrollment Form', uploaded: false, status: 'missing' },
    { id: 17, name: 'Credentialing Attestation', uploaded: true, status: 'current' },
  ],
  'aetna': [
    ...baseChecklist,
    { id: 16, name: 'Aetna Application', uploaded: false, status: 'missing' },
    { id: 17, name: 'Participation Agreement', uploaded: false, status: 'missing' },
  ],
  'cigna': [
    ...baseChecklist,
    { id: 16, name: 'Cigna Credentialing Form', uploaded: false, status: 'missing' },
    { id: 17, name: 'Disclosure Statement', uploaded: true, status: 'current' },
  ],
  'humana': [
    ...baseChecklist,
    { id: 16, name: 'Humana Provider Application', uploaded: false, status: 'missing' },
    { id: 17, name: 'Office Assessment Form', uploaded: false, status: 'missing' },
  ],
  'tx-medicaid': [
    ...baseChecklist,
    { id: 16, name: 'TMHP Enrollment Application', uploaded: false, status: 'missing' },
    { id: 17, name: 'Medicaid Provider Agreement', uploaded: false, status: 'missing' },
    { id: 18, name: 'Fingerprint Results', uploaded: true, status: 'current' },
  ],
  'medicare-pecos': [
    ...baseChecklist,
    { id: 16, name: 'CMS-855I Application', uploaded: false, status: 'missing' },
    { id: 17, name: 'Medicare Enrollment Attestation', uploaded: true, status: 'current' },
  ],
  'bexar-county': [
    ...baseChecklist,
    { id: 16, name: 'Bexar County Provider Application', uploaded: false, status: 'missing' },
    { id: 17, name: 'County Participation Agreement', uploaded: false, status: 'missing' },
    { id: 18, name: 'Service Area Documentation', uploaded: true, status: 'current' },
  ],
};

// Payer options for dropdowns — used by Packet Generator
export const payerOptions = [
  { value: 'texas-standard', label: 'Texas Standard' },
  { value: 'bcbs-tx', label: 'Blue Cross Blue Shield of Texas' },
  { value: 'uhc', label: 'UnitedHealthcare' },
  { value: 'aetna', label: 'Aetna' },
  { value: 'cigna', label: 'Cigna' },
  { value: 'humana', label: 'Humana' },
  { value: 'tx-medicaid', label: 'Texas Medicaid' },
  { value: 'medicare-pecos', label: 'Medicare (PECOS)' },
  { value: 'bexar-county', label: 'Bexar County' },
];

// Get checklist progress for a payer
export function getChecklistProgress(checklistKey: string) {
  const checklist = payerChecklists[checklistKey] || baseChecklist;
  const available = checklist.filter(d => d.status === 'current' || d.status === 'expiring').length;
  return { available, total: checklist.length, percentage: Math.round((available / checklist.length) * 100) };
}
