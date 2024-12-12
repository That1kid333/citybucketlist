import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    signOut: async () => {
      await auth.signOut();
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({
        user,
        loading: false,
        signOut: authState.signOut,
      });
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return authState;
}
