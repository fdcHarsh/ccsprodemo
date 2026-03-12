import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Credential, initialCredentials } from '@/lib/mockData';

interface CredentialsContextType {
  credentials: Credential[];
  addCredential: (cred: Credential) => void;
  deleteCredential: (id: string) => void;
  updateCredential: (id: string, cred: Partial<Credential>) => void;
}

const CredentialsContext = createContext<CredentialsContextType | undefined>(undefined);

const STORAGE_KEY = 'credflow_credentials';

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCredentials(JSON.parse(stored));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  }, [credentials, initialized]);

  const addCredential = (cred: Credential) => setCredentials(prev => [...prev, cred]);
  const deleteCredential = (id: string) => setCredentials(prev => prev.filter(c => c.id !== id));
  const updateCredential = (id: string, updates: Partial<Credential>) =>
    setCredentials(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));

  return (
    <CredentialsContext.Provider value={{ credentials, addCredential, deleteCredential, updateCredential }}>
      {children}
    </CredentialsContext.Provider>
  );
}

export function useCredentials() {
  const context = useContext(CredentialsContext);
  if (!context) throw new Error('useCredentials must be used within a CredentialsProvider');
  return context;
}
