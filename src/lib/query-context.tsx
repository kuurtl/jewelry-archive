'use client';

import { createContext, useContext, useState } from 'react';

type QueryState = {
  searchText: string;
  classification: string;
  includeComponents: boolean;
  setSearchText: (value: string) => void;
  setClassification: (value: string) => void;
  setIncludeComponents: (value: boolean) => void;
};

const QueryContext = createContext<QueryState | null>(null);

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [searchText, setSearchText] = useState('');
  const [classification, setClassification] = useState('all');
  const [includeComponents, setIncludeComponents] = useState(false);

  return (
    <QueryContext.Provider
      value={{
        searchText,
        classification,
        includeComponents,
        setSearchText,
        setClassification,
        setIncludeComponents,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
}

export function useQueryState() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQueryState must be used within QueryProvider');
  }
  return context;
}
