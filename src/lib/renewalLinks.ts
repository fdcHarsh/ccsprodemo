/**
 * Renewal links and processing times for common credentials.
 * Maps credential names to their issuing body websites and processing durations.
 */

export interface RenewalInfo {
  url: string;
  label: string;
  processingWeeks: [number, number]; // [min, max] weeks
  processingNote: string;
}

const RENEWAL_MAP: Record<string, RenewalInfo> = {
  'Texas Medical License': {
    url: 'https://www.tmb.state.tx.us/page/online-license-renewal',
    label: 'Texas Medical Board',
    processingWeeks: [4, 6],
    processingNote: 'TMB online renewal takes 4-6 weeks to process',
  },
  'DEA Registration': {
    url: 'https://apps.deadiversion.usdoj.gov/webforms2/spring/renewalLogin',
    label: 'DEA Online Renewal',
    processingWeeks: [6, 8],
    processingNote: 'DEA registration renewal takes 6-8 weeks',
  },
  'DEA Certificate': {
    url: 'https://apps.deadiversion.usdoj.gov/webforms2/spring/renewalLogin',
    label: 'DEA Online Renewal',
    processingWeeks: [6, 8],
    processingNote: 'DEA certificate renewal takes 6-8 weeks',
  },
  'Board Certification': {
    url: 'https://www.abim.org/maintenance-of-certification/',
    label: 'ABIM MOC Portal',
    processingWeeks: [8, 12],
    processingNote: 'Board recertification takes 8-12 weeks',
  },
  'Board Certification - Internal Medicine': {
    url: 'https://www.abim.org/maintenance-of-certification/',
    label: 'ABIM MOC Portal',
    processingWeeks: [8, 12],
    processingNote: 'Board recertification takes 8-12 weeks',
  },
  'BLS Certification': {
    url: 'https://cpr.heart.org/en/courses',
    label: 'AHA Course Finder',
    processingWeeks: [0, 1],
    processingNote: 'Walk-in BLS classes available — same-day certification',
  },
  'ACLS Certification': {
    url: 'https://cpr.heart.org/en/courses',
    label: 'AHA Course Finder',
    processingWeeks: [0, 1],
    processingNote: 'ACLS courses available — 1-2 day certification',
  },
  'CAQH Attestation': {
    url: 'https://proview.caqh.org',
    label: 'CAQH ProView',
    processingWeeks: [0, 0],
    processingNote: 'Online attestation takes ~15 minutes',
  },
  'Malpractice Insurance': {
    url: 'https://www.thedoctors.com/',
    label: 'Insurance Carrier',
    processingWeeks: [1, 2],
    processingNote: 'Carrier renewal typically takes 1-2 weeks',
  },
  'Hospital Privileges': {
    url: '',
    label: 'Contact Hospital MSO',
    processingWeeks: [8, 16],
    processingNote: 'Privilege applications take 2-4 months',
  },
};

/**
 * Look up renewal info by credential name.
 * Falls back to a generic entry if no specific match.
 */
export function getRenewalInfo(credentialName: string): RenewalInfo | null {
  // Direct match
  if (RENEWAL_MAP[credentialName]) return RENEWAL_MAP[credentialName];

  // Partial match
  const key = Object.keys(RENEWAL_MAP).find((k) =>
    credentialName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(credentialName.toLowerCase())
  );
  return key ? RENEWAL_MAP[key] : null;
}

/**
 * Calculate the recommended start date based on expiration and processing time.
 */
export function getRecommendedStartDate(
  expirationDate: string,
  processingWeeks: [number, number]
): Date {
  const expDate = new Date(expirationDate);
  const maxWeeks = processingWeeks[1];
  // Add 1 week buffer
  const bufferDays = (maxWeeks + 1) * 7;
  return new Date(expDate.getTime() - bufferDays * 24 * 60 * 60 * 1000);
}
