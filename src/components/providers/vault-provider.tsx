
'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as crypto from '@/lib/crypto';

const VAULT_PASS_KEY = 'playgate-vault-pass-hash';
const VAULT_SESSION_KEY = 'playgate-vault-session-key';

interface VaultContextType {
  isUnlocked: boolean;
  isPasswordSet: boolean;
  unlock: (password?: string) => Promise<boolean>;
  lock: () => void;
  setPassword: (password: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const passwordHash = localStorage.getItem(VAULT_PASS_KEY);
    setIsPasswordSet(!!passwordHash);

    const sessionKeyData = sessionStorage.getItem(VAULT_SESSION_KEY);
    if (sessionKeyData) {
        crypto.importKey(JSON.parse(sessionKeyData)).then(key => {
            setSessionKey(key);
            setIsUnlocked(true);
        });
    }

  }, []);

  const setPassword = async (password: string) => {
    try {
        const hash = await crypto.hashPassword(password);
        localStorage.setItem(VAULT_PASS_KEY, hash);
        setIsPasswordSet(true);
        await unlock(password);
        toast({ title: 'Success', description: 'Vault password has been set.' });
    } catch (error) {
        console.error("Failed to set password", error);
        toast({ title: 'Error', description: 'Could not set password.', variant: 'destructive' });
    }
  };

  const unlock = useCallback(async (password?: string) => {
    const storedHash = localStorage.getItem(VAULT_PASS_KEY);
    if (!storedHash) {
      // This case is for initial setup. We prompt for a password.
      return false;
    }

    if (!password) {
        // If no password provided, we can't unlock.
        // This might happen if user directly navigates to the page.
        // The UI should handle prompting for the password.
        return false;
    }

    const isValid = await crypto.verifyPassword(password, storedHash);

    if (isValid) {
      const key = await crypto.createSessionKey(password);
      const exportedKey = await crypto.exportKey(key);
      sessionStorage.setItem(VAULT_SESSION_KEY, JSON.stringify(exportedKey));
      setSessionKey(key);
      setIsUnlocked(true);
      return true;
    } else {
      toast({ title: 'Error', description: 'Incorrect password.', variant: 'destructive' });
      return false;
    }
  }, [toast]);

  const lock = () => {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
    setSessionKey(null);
    setIsUnlocked(false);
  };

  return (
    <VaultContext.Provider value={{ isUnlocked, isPasswordSet, unlock, lock, setPassword }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
