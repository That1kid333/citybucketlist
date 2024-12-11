import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Driver } from '../types/driver';

interface AuthContextType {
  user: User | null;
  driver: Driver | null;
  driverData: any;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  refreshDriverData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  driver: null,
  driverData: null,
  loading: true,
  error: null,
  setError: () => {},
  refreshDriverData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [isCheckingDriver, setIsCheckingDriver] = useState(false);

  const fetchDriverData = async (uid: string) => {
    try {
      setIsCheckingDriver(true);
      console.log('Fetching driver data for:', uid);
      
      const driverRef = doc(db, 'drivers', uid);
      const driverDoc = await getDoc(driverRef);
      
      if (driverDoc.exists()) {
        const data = driverDoc.data() as Driver;
        console.log('Driver data found:', data);
        setDriverData({
          ...data,
          id: uid // Ensure ID is set correctly
        });
      } else {
        console.log('No driver data found');
        setDriverData(null);
      }
    } catch (err) {
      console.error('Error fetching driver data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setDriverData(null);
    } finally {
      setIsCheckingDriver(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('Auth state changed. User:', user?.email);
        if (!mounted) return;
        
        setLoading(true);
        setError(null);
        
        if (user) {
          setUser(user);
          await fetchDriverData(user.uid);
        } else {
          setUser(null);
          setDriverData(null);
          console.log('No user logged in, clearing driver data');
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setUser(null);
          setDriverData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const refreshDriverData = async () => {
    if (user) {
      await fetchDriverData(user.uid);
    }
  };

  const value = {
    user,
    driver: driverData,
    driverData,
    loading: loading || isCheckingDriver,
    error,
    setError: (error: string | null) => setError(error),
    refreshDriverData
  };

  return (
    <AuthContext.Provider value={value}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};
