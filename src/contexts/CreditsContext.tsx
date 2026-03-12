import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CreditsContextType {
  credits: number;
  purchaseCredits: (count: number) => void;
  useCredit: () => boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const STORAGE_KEY = 'ccspro_credits';

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, credits.toString());
  }, [credits]);

  const purchaseCredits = (count: number) => {
    setCredits(prev => prev + count);
  };

  const useCredit = (): boolean => {
    if (credits <= 0) return false;
    setCredits(prev => prev - 1);
    return true;
  };

  return (
    <CreditsContext.Provider value={{ credits, purchaseCredits, useCredit }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) throw new Error('useCredits must be used within a CreditsProvider');
  return context;
}
