import React, { createContext, useState, useContext, useEffect } from 'react';
// import { apiClient } from '../api/apiClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Global States shared across all pages
  const [cases, setCases] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ready to fetch from backend later
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const value = {
    cases, setCases,
    globalSkills, setGlobalSkills,
    activeCaseId, setActiveCaseId,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
