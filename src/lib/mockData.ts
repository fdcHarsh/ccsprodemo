import { addDays, subDays, format } from 'date-fns';

// ─── Core Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  providerType: string;
  specialty: string;
  practiceLocation: string;
  npiNumber: string;
  deaNumber: string;
  role?: 'provider' | 'group_admin';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  expirationDate: string | null;
  status: 'current' | 'expiring' | 'urgent' | 'expired';
  fileType: string;
  fileSize: string;
}

export interface Credential {
  id: string;
  name: string;
  type: 'license' | 'certification' | 'insurance' | 'profile' | 'education';
  issueDate: string;
  expirationDate: string;
  issuingOrganization: string;
  status: 'current' | 'expiring' | 'urgent' | 'expired';
  daysLeft: number;
  documentId?: string;
}

export interface Payer {
  id: string;
  name: string;
  status: 'credentialed' | 'in-progress' | 'not-started';
  recredentialingDate?: string;
  progress: number;
  logo?: string;
}

export interface CMECourse {
  id: string;
  name: string;
  provider: string;
  completionDate: string;
  credits: number;
  category: 'cat1' | 'cat2' | 'ethics';
  certificateUploaded: boolean;
}

// ─── Group / Roster Types ────────────────────────────────────────────────────

export type CAQHStatus = 'Active' | 'Inactive' | 'Pending';
export type LicenseStatus = 'current' | 'expiring' | 'urgent' | 'expired';
export type MalpracticeStatus = 'current' | 'expiring' | 'urgent' | 'expired';
export type PayerCredentialingStatus = 'Credentialed' | 'In Progress' | 'Not Started';

export interface RosterProvider {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  npi: string;
  caqhId: string;
  email: string;
  phone: string;
  practiceLocation: string;
  profileCompletion: number;
  caqhStatus: CAQHStatus;
  licenseStatus: LicenseStatus;
  licenseDaysLeft?: number;
  malpracticeStatus: MalpracticeStatus;
  malpracticeDaysLeft?: number;
  packetReady: boolean;
  packetNotReadyReason?: string;
  needsAttention: boolean;
  lastUpdated: string;
  payerStatuses: Record<string, PayerCredentialingStatus>;
  documents: RosterProviderDocument[];
}

export interface RosterProviderDocument {
  name: string;
  status: 'current' | 'expiring' | 'urgent' | 'expired';
  expirationDate: string | null;
}

export interface NeedsAttentionItem {
  providerId: string;
  providerName: string;
  issue: string;
  daysUntilImpact?: number;
  priority: 'High' | 'Medium' | 'Low';
  actionType: 'Request Document' | 'View Provider' | 'Contact Provider';
}

export interface DocumentCollectionRequest {
  id: string;
  providerId: string;
  providerName: string;
  message: string;
  sentDate: string;
  status: 'Pending' | 'Fulfilled';
}

export interface GroupMembership {
  id: string;
  groupName: string;
  address: string;
  credentialingManager: string;
  role: 'Provider';
  consentStatus: 'Active' | 'Pending Consent' | 'Revoked';
  dateJoined: string | null;
  consentRequestDate?: string;
}

export interface PacketHistoryItem {
  id: string;
  name: string;
  generatedDate: string;
  sentTo: string;
  payer: string;
  status: 'Submitted' | 'Draft';
  documents: string[];
  providerName?: string;
}

export interface Notification {
  id: string;
  type: 'group' | 'caqh' | 'document' | 'packet';
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

export interface ActivityFeedItem {
  id: string;
  description: string;
  timeAgo: string;
}

export interface GroupActivityLogItem {
  id: string;
  description: string;
  date: string;
}

export interface GroupCredentialingStatus {
  payer: string;
  status: 'Active' | 'Pending' | 'In Review';
  lastUpdated: string;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export const calculateStatus = (expirationDate: string): { status: 'current' | 'expiring' | 'urgent' | 'expired'; daysLeft: number } => {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { status: 'expired', daysLeft };
  if (daysLeft <= 30) return { status: 'urgent', daysLeft };
  if (daysLeft <= 90) return { status: 'expiring', daysLeft };
  return { status: 'current', daysLeft };
};

const today = new Date();

// ─── Provider Mock Data — Sarah Chen, CRNA ───────────────────────────────────

export const providerUser: User = {
  id: 'provider-sarah-chen',
  name: 'Sarah Chen, CRNA',
  email: 'sarah.chen@austinrmc.com',
  providerType: 'CRNA',
  specialty: 'Nurse Anesthesia',
  practiceLocation: '4821 Brodie Lane, Suite 200, Austin, TX 78745',
  npiNumber: '1234567890',
  deaNumber: 'MC1234563',
  phone: '(512) 555-0101',
  address: '4821 Brodie Lane, Suite 200',
  city: 'Austin',
  state: 'TX',
  zip: '78745',
  country: 'United States',
  role: 'provider',
};

export const groupAdminUser: User = {
  id: 'admin-maria-gonzalez',
  name: 'Maria Gonzalez',
  email: 'maria.gonzalez@austinrmc.com',
  providerType: 'Admin',
  specialty: 'Credentialing Manager',
  practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
  npiNumber: '9876543210',
  deaNumber: '',
  role: 'group_admin',
};

// Provider group memberships
export const providerGroupMemberships: GroupMembership[] = [
  {
    id: 'group-1',
    groupName: 'Austin Regional Medical Group',
    address: '3801 South Lamar Blvd, Austin, TX 78704',
    credentialingManager: 'Maria Gonzalez, Credentialing Manager',
    role: 'Provider',
    consentStatus: 'Active',
    dateJoined: '2025-09-15',
    consentRequestDate: '2025-09-01',
  },
  {
    id: 'group-2',
    groupName: 'Bexar County Health Network',
    address: '7711 Louis Pasteur Dr, San Antonio, TX 78229',
    credentialingManager: 'Patricia Reyes, Credentialing Coordinator',
    role: 'Provider',
    consentStatus: 'Pending Consent',
    dateJoined: null,
    consentRequestDate: '2026-03-01',
  },
  {
    id: 'group-3',
    groupName: 'Central Texas Primary Care Alliance',
    address: '1500 W 38th St, Austin, TX 78731',
    credentialingManager: 'Robert Kim, Credentialing Director',
    role: 'Provider',
    consentStatus: 'Revoked',
    dateJoined: null,
    consentRequestDate: '2025-11-01',
  },
];

// Group Activity Log (for View Group dialog)
export const groupActivityLog: GroupActivityLogItem[] = [
  { id: 'gal-1', description: 'Humana credentialing packet generated', date: format(subDays(today, 3), 'MMM d, yyyy') },
  { id: 'gal-2', description: 'DEA Certificate requested from provider', date: format(subDays(today, 7), 'MMM d, yyyy') },
  { id: 'gal-3', description: 'Provider added to Aetna payer workflow', date: format(subDays(today, 12), 'MMM d, yyyy') },
  { id: 'gal-4', description: 'Document upload reminder sent', date: format(subDays(today, 18), 'MMM d, yyyy') },
  { id: 'gal-5', description: 'Bexar County credentialing packet submitted', date: format(subDays(today, 25), 'MMM d, yyyy') },
];

// Group Credentialing Status (for View Group dialog)
export const groupCredentialingStatuses: GroupCredentialingStatus[] = [
  { payer: 'Bexar County', status: 'Active', lastUpdated: format(subDays(today, 5), 'MMM d, yyyy') },
  { payer: 'Humana', status: 'Pending', lastUpdated: format(subDays(today, 3), 'MMM d, yyyy') },
  { payer: 'Aetna', status: 'In Review', lastUpdated: format(subDays(today, 12), 'MMM d, yyyy') },
];

// Document Vault (CRNA documents)
export const initialDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'State RN License',
    category: 'state-rn-license',
    uploadDate: '2024-09-01',
    expirationDate: format(addDays(today, 60), 'yyyy-MM-dd'),
    status: calculateStatus(format(addDays(today, 60), 'yyyy-MM-dd')).status,
    fileType: 'PDF',
    fileSize: '312 KB',
  },
  {
    id: 'doc-2',
    name: 'DEA Certificate',
    category: 'dea-certificate',
    uploadDate: '2024-11-20',
    expirationDate: format(addDays(today, 88), 'yyyy-MM-dd'),
    status: calculateStatus(format(addDays(today, 88), 'yyyy-MM-dd')).status,
    fileType: 'PDF',
    fileSize: '180 KB',
  },
  {
    id: 'doc-3',
    name: 'Professional Liability Insurance',
    category: 'liability-insurance',
    uploadDate: '2025-01-15',
    expirationDate: format(addDays(today, 72), 'yyyy-MM-dd'),
    status: calculateStatus(format(addDays(today, 72), 'yyyy-MM-dd')).status,
    fileType: 'PDF',
    fileSize: '520 KB',
  },
  {
    id: 'doc-4',
    name: 'CRNA Certification (NBCRNA)',
    category: 'aprn-crna-certification',
    uploadDate: '2023-07-01',
    expirationDate: format(addDays(today, 45), 'yyyy-MM-dd'),
    status: calculateStatus(format(addDays(today, 45), 'yyyy-MM-dd')).status,
    fileType: 'PDF',
    fileSize: '445 KB',
  },
  {
    id: 'doc-5',
    name: 'NPI Confirmation Letter',
    category: 'npi-letter',
    uploadDate: '2022-03-10',
    expirationDate: null,
    status: 'current',
    fileType: 'PDF',
    fileSize: '98 KB',
  },
  {
    id: 'doc-6',
    name: 'CV / Curriculum Vitae',
    category: 'curriculum-vitae',
    uploadDate: '2025-10-01',
    expirationDate: null,
    status: 'current',
    fileType: 'PDF',
    fileSize: '890 KB',
  },
  {
    id: 'doc-7',
    name: 'IRS W-9',
    category: 'irs-w9',
    uploadDate: '2025-11-01',
    expirationDate: null,
    status: 'current',
    fileType: 'PDF',
    fileSize: '156 KB',
  },
  {
    id: 'doc-8',
    name: 'Government-Issued Photo ID',
    category: 'photo-id',
    uploadDate: '2024-01-15',
    expirationDate: null,
    status: 'current',
    fileType: 'JPG',
    fileSize: '2.1 MB',
  },
];

// Credential Tracker (4 CRNA-specific credentials with relative dates)
const crnaCertExpiry = format(addDays(today, 45), 'yyyy-MM-dd');
const rnLicenseExpiry = format(addDays(today, 60), 'yyyy-MM-dd');
const liabilityExpiry = format(addDays(today, 72), 'yyyy-MM-dd');
const deaExpiry = format(addDays(today, 88), 'yyyy-MM-dd');

export const initialCredentials: Credential[] = [
  {
    id: 'cred-1',
    name: 'CRNA Certification (NBCRNA)',
    type: 'certification',
    issueDate: '2022-07-01',
    expirationDate: crnaCertExpiry,
    issuingOrganization: 'National Board of Certification and Recertification for Nurse Anesthetists',
    status: calculateStatus(crnaCertExpiry).status,
    daysLeft: 45,
    documentId: 'doc-4',
  },
  {
    id: 'cred-2',
    name: 'State RN License',
    type: 'license',
    issueDate: '2022-09-01',
    expirationDate: rnLicenseExpiry,
    issuingOrganization: 'Texas Board of Nursing',
    status: calculateStatus(rnLicenseExpiry).status,
    daysLeft: 60,
    documentId: 'doc-1',
  },
  {
    id: 'cred-3',
    name: 'Professional Liability Insurance',
    type: 'insurance',
    issueDate: '2025-01-10',
    expirationDate: liabilityExpiry,
    issuingOrganization: 'Hartford Insurance',
    status: calculateStatus(liabilityExpiry).status,
    daysLeft: 72,
    documentId: 'doc-3',
  },
  {
    id: 'cred-4',
    name: 'DEA Certificate',
    type: 'certification',
    issueDate: '2023-11-15',
    expirationDate: deaExpiry,
    issuingOrganization: 'U.S. Drug Enforcement Administration',
    status: calculateStatus(deaExpiry).status,
    daysLeft: 88,
    documentId: 'doc-2',
  },
];

// Payers (only 3 payers)
export const initialPayers: Payer[] = [
  { id: 'payer-1', name: 'Bexar County', status: 'in-progress', progress: 45 },
  { id: 'payer-2', name: 'Humana', status: 'not-started', progress: 0 },
  { id: 'payer-3', name: 'Aetna', status: 'not-started', progress: 0 },
];

// CME Courses
export const initialCMECourses: CMECourse[] = [
  { id: 'cme-1', name: 'Advanced Cardiac Life Support', provider: 'AHA', completionDate: format(subDays(today, 30), 'yyyy-MM-dd'), credits: 8.0, category: 'cat1', certificateUploaded: true },
  { id: 'cme-2', name: 'Anesthesia Patient Safety', provider: 'AANA', completionDate: format(subDays(today, 60), 'yyyy-MM-dd'), credits: 4.0, category: 'cat1', certificateUploaded: true },
  { id: 'cme-3', name: 'Pharmacology Update for CRNAs', provider: 'NBCRNA', completionDate: format(subDays(today, 90), 'yyyy-MM-dd'), credits: 6.0, category: 'cat1', certificateUploaded: true },
  { id: 'cme-4', name: 'Ethics in Nurse Anesthesia Practice', provider: 'AANA', completionDate: format(subDays(today, 120), 'yyyy-MM-dd'), credits: 2.0, category: 'ethics', certificateUploaded: true },
  { id: 'cme-5', name: 'Regional Anesthesia Techniques', provider: 'ASRA', completionDate: format(subDays(today, 150), 'yyyy-MM-dd'), credits: 5.0, category: 'cat1', certificateUploaded: true },
];

// CAQH Attestation History
export const caqhAttestationHistory = [
  { date: '2025-05-01', status: 'completed' },
  { date: '2025-11-01', status: 'completed' },
  { date: '2026-05-01', status: 'upcoming' },
];

// Packet History (provider) - removed BCBSTX
export const packetHistory: PacketHistoryItem[] = [
  {
    id: 'packet-2',
    name: 'Humana Credentialing Packet',
    generatedDate: format(subDays(today, 14), 'yyyy-MM-dd'),
    sentTo: 'Austin Regional Medical Group',
    payer: 'Humana',
    status: 'Submitted',
    documents: ['CV / Curriculum Vitae', 'State RN License', 'DEA Certificate', 'Professional Liability Insurance'],
  },
  {
    id: 'packet-3',
    name: 'LHL234 Complete Application (Signed)',
    generatedDate: format(subDays(today, 45), 'yyyy-MM-dd'),
    sentTo: 'Austin Regional Medical Group',
    payer: 'Bexar County',
    status: 'Submitted',
    documents: ['LHL234 Texas Standard Application — All Sections'],
  },
  {
    id: 'packet-4',
    name: 'Aetna Credentialing Packet',
    generatedDate: format(subDays(today, 7), 'yyyy-MM-dd'),
    sentTo: 'Austin Regional Medical Group',
    payer: 'Aetna',
    status: 'Draft',
    documents: ['State RN License', 'CRNA Certification', 'Professional Liability Insurance'],
  },
];

// Group Admin Packet History
export const groupPacketHistory: PacketHistoryItem[] = [
  {
    id: 'gpacket-1',
    name: 'Credentialing Packet',
    generatedDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    sentTo: 'Bexar County',
    payer: 'Bexar County',
    status: 'Submitted',
    providerName: 'Dr. Linda Torres',
    documents: [],
  },
  {
    id: 'gpacket-2',
    name: 'Credentialing Packet',
    generatedDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    sentTo: 'Humana',
    payer: 'Humana',
    status: 'Submitted',
    providerName: 'Dr. Carlos Mendez',
    documents: [],
  },
  {
    id: 'gpacket-3',
    name: 'Credentialing Packet',
    generatedDate: format(subDays(today, 8), 'yyyy-MM-dd'),
    sentTo: 'Aetna',
    payer: 'Aetna',
    status: 'Draft',
    providerName: 'Dr. Marcus Williams',
    documents: [],
  },
  {
    id: 'gpacket-4',
    name: 'Credentialing Packet',
    generatedDate: format(subDays(today, 12), 'yyyy-MM-dd'),
    sentTo: 'Bexar County',
    payer: 'Bexar County',
    status: 'Submitted',
    providerName: 'Sarah Chen, CRNA',
    documents: [],
  },
  {
    id: 'gpacket-5',
    name: 'Credentialing Packet',
    generatedDate: format(subDays(today, 15), 'yyyy-MM-dd'),
    sentTo: 'Humana',
    payer: 'Humana',
    status: 'Submitted',
    providerName: 'Dr. Linda Torres',
    documents: [],
  },
];

// Provider Notifications (5 total, 2 unread)
export const providerNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'group',
    title: 'Group Access Request',
    message: 'Bexar County Health Network has requested access to your credentialing profile.',
    timeAgo: '2 days ago',
    read: false,
    actionLabel: 'Review Request',
    actionRoute: '/my-groups',
  },
  {
    id: 'notif-2',
    type: 'caqh',
    title: 'CAQH Attestation Due',
    message: 'Your CAQH attestation is due in 53 days. Keep your profile active to avoid delays.',
    timeAgo: '3 days ago',
    read: false,
    actionLabel: 'Update CAQH',
    actionRoute: '/caqh',
  },
  {
    id: 'notif-3',
    type: 'document',
    title: 'CRNA Certification Expiring',
    message: 'Your CRNA Certification (NBCRNA) expires in 45 days. Upload a renewed certificate to keep your profile current.',
    timeAgo: '5 days ago',
    read: true,
    actionLabel: 'Upload Document',
    actionRoute: '/documents',
  },
  {
    id: 'notif-4',
    type: 'group',
    title: 'Document Request from Group',
    message: 'Austin Regional Medical Group has requested an updated professional liability insurance certificate.',
    timeAgo: '8 days ago',
    read: true,
    actionLabel: 'Upload Document',
    actionRoute: '/documents',
  },
  {
    id: 'notif-5',
    type: 'packet',
    title: 'Packet Generated',
    message: 'Your Humana Credentialing Packet was successfully generated and sent to Austin Regional Medical Group.',
    timeAgo: '14 days ago',
    read: true,
  },
];

// ─── Group Mock Data — Austin Regional Medical Group ─────────────────────────

export const GROUP_INFO = {
  name: 'Austin Regional Medical Group',
  npi: '9876543210',
  address: '3801 South Lamar Blvd, Austin, TX 78704',
  phone: '(512) 555-0192',
  primaryContact: 'Maria Gonzalez',
  plan: 'Group Pro',
  billingRenewal: 'April 1, 2026',
  providersIncluded: 10,
  currentUsage: 9,
  complianceScore: 71,
};

// 3 active payers
export const GROUP_PAYERS = ['Bexar County', 'Humana', 'Aetna'];

// Roster — 9 providers
export const rosterProviders: RosterProvider[] = [
  {
    id: 'roster-1',
    name: 'Sarah Chen, CRNA',
    credentials: 'CRNA',
    specialty: 'Nurse Anesthesia',
    npi: '1234567890',
    caqhId: '12345678',
    email: 'sarah.chen@austinrmc.com',
    phone: '(512) 555-0101',
    practiceLocation: '4821 Brodie Lane, Suite 200, Austin, TX 78745',
    profileCompletion: 78,
    caqhStatus: 'Active',
    licenseStatus: 'expiring',
    licenseDaysLeft: 60,
    malpracticeStatus: 'expiring',
    malpracticeDaysLeft: 72,
    packetReady: false,
    packetNotReadyReason: 'Profile only 78% complete (minimum 90% required)',
    needsAttention: true,
    lastUpdated: '2026-03-01',
    payerStatuses: {
      'Bexar County': 'In Progress',
      Humana: 'Not Started',
      Aetna: 'Not Started',
    },
    documents: [
      { name: 'State RN License', status: 'expiring', expirationDate: format(addDays(today, 60), 'yyyy-MM-dd') },
      { name: 'DEA Certificate', status: 'expiring', expirationDate: format(addDays(today, 88), 'yyyy-MM-dd') },
      { name: 'Professional Liability Insurance', status: 'expiring', expirationDate: format(addDays(today, 72), 'yyyy-MM-dd') },
      { name: 'CRNA Certification (NBCRNA)', status: 'expiring', expirationDate: format(addDays(today, 45), 'yyyy-MM-dd') },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
      { name: 'IRS W-9', status: 'current', expirationDate: null },
      { name: 'Photo ID', status: 'current', expirationDate: null },
    ],
  },
  {
    id: 'roster-2',
    name: 'Dr. James Patel',
    credentials: 'MD',
    specialty: 'Internal Medicine',
    npi: '2345678901',
    caqhId: '23456789',
    email: 'james.patel@austinrmc.com',
    phone: '(512) 555-0102',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 95,
    caqhStatus: 'Active',
    licenseStatus: 'current',
    licenseDaysLeft: 240,
    malpracticeStatus: 'urgent',
    malpracticeDaysLeft: 11,
    packetReady: false,
    packetNotReadyReason: 'Malpractice insurance expires in 11 days',
    needsAttention: true,
    lastUpdated: '2026-02-28',
    payerStatuses: {
      'Bexar County': 'Not Started',
      Humana: 'Not Started',
      Aetna: 'Not Started',
    },
    documents: [
      { name: 'Texas Medical License', status: 'current', expirationDate: '2026-10-15' },
      { name: 'DEA Certificate', status: 'current', expirationDate: '2027-03-20' },
      { name: 'Malpractice Insurance Certificate', status: 'urgent', expirationDate: format(addDays(today, 11), 'yyyy-MM-dd') },
      { name: 'Board Certification', status: 'current', expirationDate: '2027-09-30' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
    ],
  },
  {
    id: 'roster-3',
    name: 'Dr. Linda Torres',
    credentials: 'DO',
    specialty: 'Pediatrics',
    npi: '3456789012',
    caqhId: '34567890',
    email: 'linda.torres@austinrmc.com',
    phone: '(512) 555-0103',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 100,
    caqhStatus: 'Active',
    licenseStatus: 'current',
    licenseDaysLeft: 310,
    malpracticeStatus: 'current',
    malpracticeDaysLeft: 290,
    packetReady: true,
    needsAttention: false,
    lastUpdated: '2026-01-10',
    payerStatuses: {
      'Bexar County': 'Credentialed',
      Humana: 'Credentialed',
      Aetna: 'Credentialed',
    },
    documents: [
      { name: 'Texas Medical License', status: 'current', expirationDate: '2027-01-15' },
      { name: 'DEA Certificate', status: 'current', expirationDate: '2027-08-01' },
      { name: 'Malpractice Insurance Certificate', status: 'current', expirationDate: '2026-12-31' },
      { name: 'Board Certification', status: 'current', expirationDate: '2028-03-15' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
      { name: 'CAQH Profile PDF', status: 'current', expirationDate: '2026-09-15' },
      { name: 'Photo ID', status: 'current', expirationDate: null },
    ],
  },
  {
    id: 'roster-4',
    name: 'Dr. Kevin Morris',
    credentials: 'MD',
    specialty: 'Cardiology',
    npi: '4567890123',
    caqhId: '45678901',
    email: 'kevin.morris@austinrmc.com',
    phone: '(512) 555-0104',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 62,
    caqhStatus: 'Inactive',
    licenseStatus: 'current',
    licenseDaysLeft: 200,
    malpracticeStatus: 'current',
    malpracticeDaysLeft: 250,
    packetReady: false,
    packetNotReadyReason: 'CAQH profile inactive; profile only 62% complete',
    needsAttention: true,
    lastUpdated: '2026-01-05',
    payerStatuses: {
      'Bexar County': 'Not Started',
      Humana: 'Not Started',
      Aetna: 'Not Started',
    },
    documents: [
      { name: 'Texas Medical License', status: 'current', expirationDate: '2026-09-30' },
      { name: 'Malpractice Insurance Certificate', status: 'current', expirationDate: '2026-11-30' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
    ],
  },
  {
    id: 'roster-5',
    name: 'Dr. Aisha Okonkwo',
    credentials: 'MD',
    specialty: 'OB/GYN',
    npi: '5678901234',
    caqhId: '56789012',
    email: 'aisha.okonkwo@austinrmc.com',
    phone: '(512) 555-0105',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 91,
    caqhStatus: 'Active',
    licenseStatus: 'urgent',
    licenseDaysLeft: 34,
    malpracticeStatus: 'current',
    malpracticeDaysLeft: 270,
    packetReady: false,
    packetNotReadyReason: 'Texas Medical License expires in 34 days',
    needsAttention: true,
    lastUpdated: '2026-02-15',
    payerStatuses: {
      'Bexar County': 'In Progress',
      Humana: 'Not Started',
      Aetna: 'Not Started',
    },
    documents: [
      { name: 'Texas Medical License', status: 'urgent', expirationDate: format(addDays(today, 34), 'yyyy-MM-dd') },
      { name: 'DEA Certificate', status: 'current', expirationDate: '2027-04-10' },
      { name: 'Malpractice Insurance Certificate', status: 'current', expirationDate: '2026-12-15' },
      { name: 'Board Certification', status: 'current', expirationDate: '2029-01-20' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
      { name: 'CAQH Profile PDF', status: 'current', expirationDate: '2026-08-01' },
    ],
  },
  {
    id: 'roster-6',
    name: 'Dr. Marcus Williams',
    credentials: 'DO',
    specialty: 'Psychiatry',
    npi: '6789012345',
    caqhId: '67890123',
    email: 'marcus.williams@austinrmc.com',
    phone: '(512) 555-0106',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 100,
    caqhStatus: 'Active',
    licenseStatus: 'current',
    licenseDaysLeft: 380,
    malpracticeStatus: 'current',
    malpracticeDaysLeft: 320,
    packetReady: true,
    needsAttention: false,
    lastUpdated: '2026-01-20',
    payerStatuses: {
      'Bexar County': 'Credentialed',
      Humana: 'Credentialed',
      Aetna: 'In Progress',
    },
    documents: [
      { name: 'Texas Medical License', status: 'current', expirationDate: '2027-03-31' },
      { name: 'DEA Certificate', status: 'current', expirationDate: '2027-07-15' },
      { name: 'Malpractice Insurance Certificate', status: 'current', expirationDate: '2027-01-31' },
      { name: 'Board Certification', status: 'current', expirationDate: '2028-10-01' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
      { name: 'CAQH Profile PDF', status: 'current', expirationDate: '2026-07-01' },
      { name: 'Photo ID', status: 'current', expirationDate: null },
    ],
  },
  {
    id: 'roster-7',
    name: 'Dr. Rachel Kim',
    credentials: 'MD',
    specialty: 'Dermatology',
    npi: '7890123456',
    caqhId: '78901234',
    email: 'rachel.kim@austinrmc.com',
    phone: '(512) 555-0107',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 85,
    caqhStatus: 'Active',
    licenseStatus: 'current',
    licenseDaysLeft: 290,
    malpracticeStatus: 'current',
    malpracticeDaysLeft: 260,
    packetReady: true,
    needsAttention: false,
    lastUpdated: '2026-02-01',
    payerStatuses: {
      'Bexar County': 'Not Started',
      Humana: 'Not Started',
      Aetna: 'Not Started',
    },
    documents: [
      { name: 'Texas Medical License', status: 'current', expirationDate: '2026-12-15' },
      { name: 'DEA Certificate', status: 'current', expirationDate: '2027-02-28' },
      { name: 'Malpractice Insurance Certificate', status: 'current', expirationDate: '2026-11-30' },
      { name: 'Board Certification', status: 'current', expirationDate: '2028-06-15' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
      { name: 'CAQH Profile PDF', status: 'current', expirationDate: '2026-06-15' },
    ],
  },
  {
    id: 'roster-8',
    name: 'Dr. Carlos Mendez',
    credentials: 'MD',
    specialty: 'Orthopedic Surgery',
    npi: '8901234567',
    caqhId: '89012345',
    email: 'carlos.mendez@austinrmc.com',
    phone: '(512) 555-0108',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 100,
    caqhStatus: 'Active',
    licenseStatus: 'current',
    licenseDaysLeft: 400,
    malpracticeStatus: 'current',
    malpracticeDaysLeft: 350,
    packetReady: true,
    needsAttention: false,
    lastUpdated: '2026-01-08',
    payerStatuses: {
      'Bexar County': 'Credentialed',
      Humana: 'Credentialed',
      Aetna: 'Credentialed',
    },
    documents: [
      { name: 'Texas Medical License', status: 'current', expirationDate: '2027-06-30' },
      { name: 'DEA Certificate', status: 'current', expirationDate: '2027-09-30' },
      { name: 'Malpractice Insurance Certificate', status: 'current', expirationDate: '2027-03-31' },
      { name: 'Board Certification', status: 'current', expirationDate: '2029-05-01' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
      { name: 'CAQH Profile PDF', status: 'current', expirationDate: '2026-10-01' },
      { name: 'Photo ID', status: 'current', expirationDate: null },
    ],
  },
  {
    id: 'roster-9',
    name: 'NP Jennifer Hayes',
    credentials: 'NP-C',
    specialty: 'Family Medicine',
    npi: '9012345678',
    caqhId: '',
    email: 'jennifer.hayes@austinrmc.com',
    phone: '(512) 555-0109',
    practiceLocation: '3801 South Lamar Blvd, Austin, TX 78704',
    profileCompletion: 70,
    caqhStatus: 'Pending',
    licenseStatus: 'current',
    licenseDaysLeft: 220,
    malpracticeStatus: 'current',
    malpracticeDaysLeft: 200,
    packetReady: false,
    packetNotReadyReason: 'CAQH not yet set up; profile only 70% complete',
    needsAttention: true,
    lastUpdated: '2026-02-20',
    payerStatuses: {
      'Bexar County': 'Not Started',
      Humana: 'Not Started',
      Aetna: 'In Progress',
    },
    documents: [
      { name: 'Texas Medical License (NP)', status: 'current', expirationDate: '2026-11-30' },
      { name: 'Malpractice Insurance Certificate', status: 'current', expirationDate: '2026-09-30' },
      { name: 'NPI Confirmation Letter', status: 'current', expirationDate: null },
      { name: 'CV / Curriculum Vitae', status: 'current', expirationDate: null },
    ],
  },
];

// Needs Attention (top 5)
export const needsAttentionItems: NeedsAttentionItem[] = [
  {
    providerId: 'roster-2',
    providerName: 'Dr. James Patel',
    issue: 'Malpractice insurance expires in 11 days. Packet cannot be generated.',
    daysUntilImpact: 11,
    priority: 'High',
    actionType: 'Request Document',
  },
  {
    providerId: 'roster-4',
    providerName: 'Dr. Kevin Morris',
    issue: 'CAQH profile inactive. Profile only 62% complete. Action required before any packet can be generated.',
    priority: 'High',
    actionType: 'Contact Provider',
  },
  {
    providerId: 'roster-5',
    providerName: 'Dr. Aisha Okonkwo',
    issue: 'Texas Medical License expires in 34 days. Pre-flight check will fail after expiration.',
    daysUntilImpact: 34,
    priority: 'High',
    actionType: 'Request Document',
  },
  {
    providerId: 'roster-1',
    providerName: 'Sarah Chen, CRNA',
    issue: 'Profile 78% complete. Needs to reach 90% before packet generation is possible.',
    priority: 'Medium',
    actionType: 'Contact Provider',
  },
  {
    providerId: 'roster-9',
    providerName: 'NP Jennifer Hayes',
    issue: 'CAQH not yet set up. Profile 70% complete. Cannot be submitted to any payer.',
    priority: 'High',
    actionType: 'Contact Provider',
  },
];

// Document Collection Requests
export const documentCollectionRequests: DocumentCollectionRequest[] = [
  {
    id: 'req-1',
    providerId: 'roster-2',
    providerName: 'Dr. James Patel',
    message: 'Please upload your renewed malpractice insurance certificate.',
    sentDate: '2026-03-05',
    status: 'Pending',
  },
  {
    id: 'req-2',
    providerId: 'roster-4',
    providerName: 'Dr. Kevin Morris',
    message: 'Please complete your CAQH profile and upload your CAQH attestation PDF.',
    sentDate: '2026-03-01',
    status: 'Pending',
  },
  {
    id: 'req-3',
    providerId: 'roster-9',
    providerName: 'NP Jennifer Hayes',
    message: 'Please complete your profile to at least 90% and set up your CAQH account.',
    sentDate: '2026-02-28',
    status: 'Pending',
  },
];

// Recent Activity Feed (group admin)
export const recentActivityFeed: ActivityFeedItem[] = [
  { id: 'act-1', description: 'Packet generated for Dr. Torres — Bexar County', timeAgo: '1 hour ago' },
  { id: 'act-2', description: 'Document request sent to Dr. Patel', timeAgo: '1 day ago' },
  { id: 'act-3', description: 'Sarah Chen joined the roster', timeAgo: '3 days ago' },
  { id: 'act-4', description: 'Credentialing approved — Dr. Mendez with Humana', timeAgo: '5 days ago' },
  { id: 'act-5', description: 'Document request sent to NP Hayes', timeAgo: '6 days ago' },
];

// Payer pipeline data (only 3 payers)
export const payerPipelineData: Record<string, { credentialed: string[]; inProgress: string[]; notStarted: string[] }> = {
  'Bexar County': {
    credentialed: ['Dr. Linda Torres', 'Dr. Marcus Williams', 'Dr. Carlos Mendez'],
    inProgress: ['Sarah Chen, CRNA', 'Dr. Aisha Okonkwo'],
    notStarted: ['Dr. James Patel', 'Dr. Kevin Morris', 'Dr. Rachel Kim', 'NP Jennifer Hayes'],
  },
  Humana: {
    credentialed: ['Dr. Marcus Williams', 'Dr. Carlos Mendez', 'Dr. Linda Torres'],
    inProgress: [],
    notStarted: ['Sarah Chen, CRNA', 'Dr. James Patel', 'Dr. Kevin Morris', 'Dr. Aisha Okonkwo', 'Dr. Rachel Kim', 'NP Jennifer Hayes'],
  },
  Aetna: {
    credentialed: ['Dr. Linda Torres', 'Dr. Carlos Mendez'],
    inProgress: ['Dr. Marcus Williams', 'NP Jennifer Hayes'],
    notStarted: ['Sarah Chen, CRNA', 'Dr. James Patel', 'Dr. Kevin Morris', 'Dr. Aisha Okonkwo', 'Dr. Rachel Kim'],
  },
};

// Compliance issues table
export const complianceIssues = [
  { provider: 'Dr. James Patel', issue: 'Malpractice insurance expiring', priority: 'High' as const, daysUntilImpact: 11, action: 'Request Document' },
  { provider: 'Dr. Kevin Morris', issue: 'CAQH profile inactive', priority: 'High' as const, daysUntilImpact: 0, action: 'Contact Provider' },
  { provider: 'Dr. Aisha Okonkwo', issue: 'Texas Medical License expiring', priority: 'High' as const, daysUntilImpact: 34, action: 'Request Document' },
  { provider: 'Sarah Chen, CRNA', issue: 'Profile only 78% complete', priority: 'Medium' as const, daysUntilImpact: 0, action: 'Contact Provider' },
  { provider: 'NP Jennifer Hayes', issue: 'CAQH not set up; profile 70%', priority: 'High' as const, daysUntilImpact: 0, action: 'Contact Provider' },
  { provider: 'Sarah Chen, CRNA', issue: 'CRNA Certification expiring in 45 days', priority: 'Medium' as const, daysUntilImpact: 45, action: 'Request Document' },
  { provider: 'Dr. Rachel Kim', issue: 'Profile at 85% (recommended 90%+)', priority: 'Low' as const, daysUntilImpact: 0, action: 'Contact Provider' },
  { provider: 'Sarah Chen, CRNA', issue: 'DEA Certificate expiring in 88 days', priority: 'Medium' as const, daysUntilImpact: 88, action: 'Request Document' },
];

// Expiry timeline events for compliance chart
export const expiryTimelineEvents = [
  { provider: 'Dr. Patel', credential: 'Malpractice', daysFromNow: 11, providerFull: 'Dr. James Patel' },
  { provider: 'Dr. Okonkwo', credential: 'License', daysFromNow: 34, providerFull: 'Dr. Aisha Okonkwo' },
  { provider: 'S. Chen', credential: 'NBCRNA', daysFromNow: 45, providerFull: 'Sarah Chen, CRNA' },
  { provider: 'S. Chen', credential: 'RN License', daysFromNow: 60, providerFull: 'Sarah Chen, CRNA' },
  { provider: 'S. Chen', credential: 'Liability', daysFromNow: 72, providerFull: 'Sarah Chen, CRNA' },
  { provider: 'S. Chen', credential: 'DEA', daysFromNow: 88, providerFull: 'Sarah Chen, CRNA' },
];

// ─── Static lookups ──────────────────────────────────────────────────────────

export const texasCities = [
  'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso',
  'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland',
  'Irving', 'Amarillo', 'Grand Prairie', 'McKinney', 'Frisco', 'Brownsville',
  'Pasadena', 'Killeen',
];

export const providerTypes = [
  { value: 'MD', label: 'MD - Doctor of Medicine' },
  { value: 'DO', label: 'DO - Doctor of Osteopathic Medicine' },
  { value: 'RN', label: 'RN - Registered Nurse' },
  { value: 'CRNA', label: 'CRNA - Certified Registered Nurse Anesthetist' },
  { value: 'NP', label: 'NP - Nurse Practitioner' },
  { value: 'PA', label: 'PA - Physician Assistant' },
];

export const documentCategories = [
  { value: 'state-rn-license', label: 'State RN License' },
  { value: 'aprn-crna-certification', label: 'APRN License / CRNA Certification (NBCRNA)' },
  { value: 'npi-letter', label: 'National Provider Identifier (NPI) Letter' },
  { value: 'dea-certificate', label: 'DEA Certificate (if applicable)' },
  { value: 'federal-controlled-substances', label: 'Federal Controlled Substances Certificate' },
  { value: 'state-dps-controlled', label: 'State DPS Controlled Substances Certificate (if applicable)' },
  { value: 'liability-insurance', label: 'Professional Liability Insurance Face Sheet' },
  { value: 'irs-w9', label: 'IRS W-9' },
  { value: 'caqh-authorization', label: 'CAQH Authorization / Attestation Confirmation' },
  { value: 'curriculum-vitae', label: 'Curriculum Vitae' },
  { value: 'photo-id', label: 'Government-Issued Photo ID' },
  { value: 'ssn-documentation', label: 'Social Security Card or Documentation' },
  { value: 'ecfmg-certificate', label: 'ECFMG Certificate (if applicable)' },
  { value: 'malpractice-claims', label: 'Malpractice Claims History / Attachment G (if applicable)' },
  { value: 'workers-comp', label: 'Workers Compensation Certificate of Coverage (if applicable)' },
  { value: 'dd-214', label: 'DD-214 Military Service Record (if applicable)' },
  { value: 'clia-certificate', label: 'CLIA Certificate (if applicable)' },
  { value: 'radiology-cert', label: 'Radiology Certification (if applicable)' },
  { value: 'hospital-privilege-current', label: 'Hospital Privilege Letter — Current' },
  { value: 'hospital-privilege-previous', label: 'Hospital Privilege Letter — Previous' },
  { value: 'board-certification', label: 'Board Certification Certificate' },
  { value: 'collaborative-practice', label: 'Collaborative Practice Agreement (if applicable)' },
  { value: 'other', label: 'Other' },
];

export const credentialTypes = [
  { value: 'license', label: 'License' },
  { value: 'certification', label: 'Certification' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'profile', label: 'Profile' },
  { value: 'education', label: 'Education' },
];
