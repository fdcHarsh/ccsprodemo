import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CMECourse, initialCMECourses } from '@/lib/mockData';

export interface CAQHAttestation {
  status: 'attested' | 'not-attested' | 'pending';
  attestationDate: string;
  expiryDate: string;
  documentId: string | null;
}

interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  caqhChecklist: Record<string, boolean>;
  updateCAQHChecklist: (item: string, checked: boolean) => void;
  caqhAttestation: CAQHAttestation;
  updateCAQHAttestation: (updates: Partial<CAQHAttestation>) => void;
  cmeCourses: CMECourse[];
  addCMECourse: (course: CMECourse) => void;
  deleteCMECourse: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const STORAGE_KEYS = {
  caqhChecklist: 'credflow_caqh_checklist',
  caqhAttestation: 'credflow_caqh_attestation',
  cmeCourses: 'credflow_cme',
};

const defaultCAQHAttestation: CAQHAttestation = {
  status: 'not-attested',
  attestationDate: '',
  expiryDate: '',
  documentId: null,
};

const defaultCAQHChecklist: Record<string, boolean> = {
  'practice-address': false,
  'malpractice-insurance': false,
  'hospital-privileges': false,
  'work-history': false,
  'continuing-education': false,
  'upload-cv': false,
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [caqhChecklist, setCAQHChecklist] = useState<Record<string, boolean>>(defaultCAQHChecklist);
  const [caqhAttestation, setCAQHAttestation] = useState<CAQHAttestation>(defaultCAQHAttestation);
  const [cmeCourses, setCMECourses] = useState<CMECourse[]>(initialCMECourses);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedChecklist = localStorage.getItem(STORAGE_KEYS.caqhChecklist);
    const storedAttestation = localStorage.getItem(STORAGE_KEYS.caqhAttestation);
    const storedCME = localStorage.getItem(STORAGE_KEYS.cmeCourses);

    if (storedChecklist) setCAQHChecklist(JSON.parse(storedChecklist));
    if (storedAttestation) setCAQHAttestation(JSON.parse(storedAttestation));
    if (storedCME) setCMECourses(JSON.parse(storedCME));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEYS.caqhChecklist, JSON.stringify(caqhChecklist));
  }, [caqhChecklist, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEYS.caqhAttestation, JSON.stringify(caqhAttestation));
  }, [caqhAttestation, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEYS.cmeCourses, JSON.stringify(cmeCourses));
  }, [cmeCourses, initialized]);

  const updateCAQHChecklist = (item: string, checked: boolean) =>
    setCAQHChecklist(prev => ({ ...prev, [item]: checked }));

  const updateCAQHAttestation = (updates: Partial<CAQHAttestation>) =>
    setCAQHAttestation(prev => ({ ...prev, ...updates }));

  const addCMECourse = (course: CMECourse) => setCMECourses(prev => [...prev, course]);
  const deleteCMECourse = (id: string) => setCMECourses(prev => prev.filter(c => c.id !== id));

  return (
    <UIContext.Provider value={{
      sidebarOpen,
      setSidebarOpen,
      caqhChecklist,
      updateCAQHChecklist,
      caqhAttestation,
      updateCAQHAttestation,
      cmeCourses,
      addCMECourse,
      deleteCMECourse,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
}
