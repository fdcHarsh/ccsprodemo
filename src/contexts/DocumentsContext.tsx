import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Document, initialDocuments } from '@/lib/mockData';

interface DocumentsContextType {
  documents: Document[];
  addDocument: (doc: Document) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, doc: Partial<Document>) => void;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

const STORAGE_KEY = 'credflow_documents';

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setDocuments(JSON.parse(stored));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents, initialized]);

  const addDocument = (doc: Document) => setDocuments(prev => [...prev, doc]);
  const deleteDocument = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));
  const updateDocument = (id: string, updates: Partial<Document>) =>
    setDocuments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));

  return (
    <DocumentsContext.Provider value={{ documents, addDocument, deleteDocument, updateDocument }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) throw new Error('useDocuments must be used within a DocumentsProvider');
  return context;
}
