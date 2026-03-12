import { useMemo } from 'react';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useLHL234Profile } from './useLHL234Profile';
import { payerChecklists, type PayerChecklistItem } from '@/lib/payerChecklists';
import { calculateStatus, type Document } from '@/lib/mockData';

/**
 * Maps checklist item names to keywords for matching against document names.
 * A document matches a checklist item if the lowercased document name contains
 * any of the item's keywords.
 */
const CHECKLIST_KEYWORDS: Record<string, string[]> = {
  'Medical License': ['medical license'],
  'DEA Certificate': ['dea'],
  'Board Certification': ['board cert'],
  'Malpractice Insurance': ['malpractice', 'liability insurance'],
  'Hospital Privileges Letter': ['hospital privilege'],
  'NPI Verification': ['npi'],
  'Medical School Diploma': ['medical school', 'med school', 'diploma'],
  'Residency Certificate': ['residency'],
  'CV/Resume': ['cv', 'resume', 'curriculum vitae'],
  'W-9 Form': ['w-9', 'w9'],
  'Photo ID': ['photo id', 'driver license', 'passport', 'identification'],
  'CAQH Attestation': ['caqh'],
  'Background Check Authorization': ['background check'],
  'Immunization Records': ['immunization', 'vaccination', 'hepatitis', 'tb test'],
  'CME Transcript': ['cme'],
  'LHL234 Application': ['lhl234', 'credentialing application'],
  'Work History (5 years)': ['work history'],
  'Professional References (3)': ['reference'],
  'BLS Certification': ['bls'],
  // Payer-specific
  'BCBS Provider Application': ['bcbs provider', 'blue cross application'],
  'Practice Location Verification': ['practice location', 'location verification'],
  'UHC Provider Enrollment Form': ['uhc enrollment', 'unitedhealthcare enrollment'],
  'Credentialing Attestation': ['credentialing attestation'],
  'Aetna Application': ['aetna application'],
  'Participation Agreement': ['participation agreement'],
  'Cigna Credentialing Form': ['cigna credentialing'],
  'Disclosure Statement': ['disclosure statement'],
  'Humana Provider Application': ['humana application'],
  'Office Assessment Form': ['office assessment'],
  'TMHP Enrollment Application': ['tmhp', 'medicaid enrollment'],
  'Medicaid Provider Agreement': ['medicaid provider agreement'],
  'Fingerprint Results': ['fingerprint'],
  'CMS-855I Application': ['cms-855', 'cms855'],
  'Medicare Enrollment Attestation': ['medicare enrollment attestation'],
  'Bexar County Provider Application': ['bexar county application'],
  'County Participation Agreement': ['county participation'],
  'Service Area Documentation': ['service area'],
};

function findMatchingDocument(
  checklistItemName: string,
  documents: Document[]
): Document | undefined {
  const keywords = CHECKLIST_KEYWORDS[checklistItemName];
  if (!keywords) return undefined;

  return documents.find((doc) => {
    const docNameLower = doc.name.toLowerCase();
    return keywords.some((keyword) => docNameLower.includes(keyword));
  });
}

function deriveStatus(doc: Document): PayerChecklistItem['status'] {
  if (!doc.expirationDate) return 'current';
  const { status } = calculateStatus(doc.expirationDate);
  if (status === 'expired') return 'missing';
  if (status === 'urgent' || status === 'expiring') return 'expiring';
  return 'current';
}

/**
 * Profile-based satisfaction: certain checklist items can be marked complete
 * if the corresponding profile section is filled out.
 */
function isProfileSatisfied(
  itemName: string,
  sectionProgress: Record<string, number>
): boolean {
  switch (itemName) {
    case 'Work History (5 years)':
      return (sectionProgress['workHistory'] || 0) >= 80;
    case 'Professional References (3)':
      return (sectionProgress['references'] || 0) >= 100;
    case 'NPI Verification':
      return (sectionProgress['licenses'] || 0) >= 50;
    default:
      return false;
  }
}

export function useDynamicChecklists() {
  const { documents } = useDocuments();
  const { sectionProgress } = useLHL234Profile();

  const getDynamicChecklist = useMemo(() => {
    return (checklistKey: string): PayerChecklistItem[] => {
      const baseChecklist = payerChecklists[checklistKey] || [];

      return baseChecklist.map((item) => {
        const matchingDoc = findMatchingDocument(item.name, documents);

        if (matchingDoc) {
          const status = deriveStatus(matchingDoc);
          return {
            ...item,
            uploaded: status !== 'missing',
            status,
          };
        }

        if (isProfileSatisfied(item.name, sectionProgress)) {
          return { ...item, uploaded: true, status: 'current' as const };
        }

        return { ...item, uploaded: false, status: 'missing' as const };
      });
    };
  }, [documents, sectionProgress]);

  const getProgress = useMemo(() => {
    return (checklistKey: string) => {
      const checklist = getDynamicChecklist(checklistKey);
      const available = checklist.filter(
        (d) => d.status === 'current' || d.status === 'expiring'
      ).length;
      return {
        available,
        total: checklist.length,
        percentage: Math.round((available / checklist.length) * 100),
      };
    };
  }, [getDynamicChecklist]);

  const getMissingItems = useMemo(() => {
    return (checklistKey: string) => {
      return getDynamicChecklist(checklistKey).filter(
        (d) => d.status === 'missing'
      );
    };
  }, [getDynamicChecklist]);

  return { getDynamicChecklist, getProgress, getMissingItems };
}
