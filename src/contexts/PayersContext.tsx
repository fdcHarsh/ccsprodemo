import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Payer, initialPayers } from '@/lib/mockData';

interface PayersContextType {
  payers: Payer[];
  updatePayer: (id: string, payer: Partial<Payer>) => void;
}

const PayersContext = createContext<PayersContextType | undefined>(undefined);

const STORAGE_KEY = 'credflow_payers';

export function PayersProvider({ children }: { children: ReactNode }) {
  const [payers, setPayers] = useState<Payer[]>(initialPayers);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setPayers(JSON.parse(stored));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payers));
  }, [payers, initialized]);

  const updatePayer = (id: string, updates: Partial<Payer>) =>
    setPayers(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));

  return (
    <PayersContext.Provider value={{ payers, updatePayer }}>
      {children}
    </PayersContext.Provider>
  );
}

export function usePayers() {
  const context = useContext(PayersContext);
  if (!context) throw new Error('usePayers must be used within a PayersProvider');
  return context;
}
