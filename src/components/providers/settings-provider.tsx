
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const SETTINGS_STORAGE_KEY = 'playgate-settings';

interface Settings {
  showLoadingScreen: boolean;
}

interface SettingsContextType extends Settings {
  setShowLoadingScreen: (show: boolean) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    showLoadingScreen: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleSetShowLoadingScreen = (show: boolean) => {
    const newSettings = { ...settings, showLoadingScreen: show };
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
       console.error("Failed to save settings to localStorage", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ ...settings, setShowLoadingScreen: handleSetShowLoadingScreen, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within a SettingsProvider');
  }
  return context;
}
