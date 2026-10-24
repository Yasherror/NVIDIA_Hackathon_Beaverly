import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cases, setCases] = useState([]);
  const [globalSkills, setGlobalSkills] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/skills/')
      .then(setGlobalSkills)
      .catch(() => setGlobalSkills([]))
      .finally(() => setIsLoading(false));
  }, []);

  const refreshSkills = async () => {
    try {
      setGlobalSkills(await apiClient.get('/skills/'));
    } catch (error) {
      console.error('Could not refresh lawyer skills:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      cases, setCases,
      globalSkills, setGlobalSkills, refreshSkills,
      activeCaseId, setActiveCaseId,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
