import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  useEffect(() => {
    console.log('Setting up auth state listener');
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        console.log('Auth state changed. User:', authUser?.email);
        if (!mounted) return;
        
        setLoading(true);
        setError(null);
        
        if (authUser) {
          // Set the user immediately
          setUser(authUser);
          
          // Then try to fetch or create driver data
          const driverRef = doc(db, 'drivers', authUser.uid);
          const driverDoc = await getDoc(driverRef);
          
          if (driverDoc.exists()) {
            console.log('Driver data found:', driverDoc.data());
            setDriverData({
              ...driverDoc.data(),
              id: authUser.uid
            } as Driver);
          } else {
            console.log('Creating new driver document');
            const newDriverData: Driver = {
              id: authUser.uid,
              name: authUser.displayName || '',
              email: authUser.email || '',
              photoURL: authUser.photoURL || '',
              rating: 5,
              locationId: 'swfl',
              vehicle: {
                make: '',
                model: '',
                year: '',
                color: '',
                licensePlate: ''
              },
              available: true,
              createdAt: new Date().toISOString(),
              lastActive: new Date().toISOString()
            };
            
            await setDoc(driverRef, newDriverData);
            setDriverData(newDriverData);
            console.log('Created new driver document:', newDriverData);
          }
        } else {
          setUser(null);
          setDriverData(null);
          console.log('No user logged in, clearing driver data');
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          // Don't clear user data on error, only driver data
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
      unsubscribe();
      console.log('Cleaned up auth state listener');
    };
  }, []);

  const refreshDriverData = async () => {
    if (user) {
      const driverRef = doc(db, 'drivers', user.uid);
      const driverDoc = await getDoc(driverRef);
      
      if (driverDoc.exists()) {
        console.log('Driver data found:', driverDoc.data());
        setDriverData({
          ...driverDoc.data(),
          id: user.uid
        } as Driver);
      } else {
        console.log('Creating new driver document');
        const newDriverData: Driver = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          rating: 5,
          locationId: 'swfl',
          vehicle: {
            make: '',
            model: '',
            year: '',
            color: '',
            licensePlate: ''
          },
          available: true,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };
        
        await setDoc(driverRef, newDriverData);
        setDriverData(newDriverData);
        console.log('Created new driver document:', newDriverData);
      }
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
