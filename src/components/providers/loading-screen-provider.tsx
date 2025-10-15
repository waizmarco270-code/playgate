
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const LoadingScreenContext = createContext<{
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}>({
  isLoading: true,
  setIsLoading: () => {},
});

export const useLoadingScreen = () => useContext(LoadingScreenContext);

export function LoadingScreenProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500); // Keep loading screen for 3.5 seconds

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <LoadingScreenContext.Provider value={{ isLoading, setIsLoading }}>
        <AnimatePresence>
            {isLoading && <LoadingScreen />}
        </AnimatePresence>
        {!isLoading && children}
    </LoadingScreenContext.Provider>
  );
}
