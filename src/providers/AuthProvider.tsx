import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { signInWithGoogle, signOut } from '../services/auth';
import { Driver } from '../types/driver';
import { Rider } from '../types/rider';

interface AuthContextType {
  user: User | null;
  driver: Driver | null;
  rider: Rider | null;
  loading: boolean;
  userType: 'driver' | 'rider' | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshDriverData: () => Promise<void>;
  refreshRiderData: () => Promise<Rider | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  driver: null,
  rider: null,
  loading: true,
  userType: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshDriverData: async () => {},
  refreshRiderData: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverLoading, setDriverLoading] = useState(false);
  const [riderLoading, setRiderLoading] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth listener');
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', { userId: user?.uid });
      setUser(user);
      if (!user) {
        setDriver(null);
        setRider(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for rider data changes
  useEffect(() => {
    let unsubscribeRider: (() => void) | undefined;
    let unsubscribeSavedRiders: (() => void) | undefined;

    if (user) {
      console.log('Setting up rider listener for user:', user.uid);
      setRiderLoading(true);
      const riderRef = doc(db, 'riders', user.uid);
      
      try {
        // Listen for rider document changes
        unsubscribeRider = onSnapshot(riderRef, async (doc) => {
          console.log('Rider data changed:', { exists: doc.exists() });
          if (doc.exists()) {
            const data = doc.data();
            setRider({
              id: doc.id,
              ...data,
              savedRiders: [] // Initialize empty array that will be populated by subcollection
            } as Rider);

            // Set up listener for saved riders subcollection
            const savedRidersRef = collection(db, 'riders', user.uid, 'savedRiders');
            unsubscribeSavedRiders = onSnapshot(savedRidersRef, (snapshot) => {
              const savedRiders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              setRider(prevRider => {
                if (!prevRider) return null;
                return {
                  ...prevRider,
                  savedRiders
                };
              });
            }, (error) => {
              console.error('Error in saved riders listener:', error);
              // Don't set rider to null, just log the error
            });
          } else {
            setRider(null);
          }
          setRiderLoading(false);
        }, (error) => {
          console.error('Error in rider listener:', error);
          setRider(null);
          setRiderLoading(false);
        });
      } catch (error) {
        console.error('Error in rider listener:', error);
        setRider(null);
        setRiderLoading(false);
      }
    } else {
      setRider(null);
      setRiderLoading(false);
    }

    return () => {
      if (unsubscribeRider) {
        console.log('Cleaning up rider listener');
        unsubscribeRider();
      }
      if (unsubscribeSavedRiders) {
        console.log('Cleaning up saved riders listener');
        unsubscribeSavedRiders();
      }
    };
  }, [user]);

  // Listen for driver data changes
  useEffect(() => {
    let unsubscribeDriver: (() => void) | undefined;

    if (user) {
      console.log('Setting up driver listener for user:', user.uid);
      setDriverLoading(true);
      const driverRef = doc(db, 'drivers', user.uid);
      
      try {
        unsubscribeDriver = onSnapshot(driverRef, (doc) => {
          console.log('Driver data changed:', { exists: doc.exists() });
          if (doc.exists()) {
            const data = doc.data();
            setDriver({
              id: doc.id,
              ...data
            } as Driver);
          } else {
            setDriver(null);
          }
          setDriverLoading(false);
        }, (error) => {
          console.error('Error in driver listener:', error);
          setDriver(null);
          setDriverLoading(false);
        });
      } catch (error) {
        console.error('Error in driver listener:', error);
        setDriver(null);
        setDriverLoading(false);
      }
    } else {
      setDriver(null);
      setDriverLoading(false);
    }

    return () => {
      if (unsubscribeDriver) {
        console.log('Cleaning up driver listener');
        unsubscribeDriver();
      }
    };
  }, [user]);

  const refreshDriverData = async () => {
    if (!user) return;
    
    try {
      const driverRef = doc(db, 'drivers', user.uid);
      const driverDoc = await getDoc(driverRef);
      
      if (driverDoc.exists()) {
        const data = driverDoc.data();
        setDriver({
          id: driverDoc.id,
          ...data
        } as Driver);
      } else {
        setDriver(null);
      }
    } catch (error) {
      console.error('Error refreshing driver data:', error);
      setDriver(null);
    }
  };

  const refreshRiderData = async () => {
    if (!user) return null;
    try {
      const riderRef = doc(db, 'riders', user.uid);
      const riderDoc = await getDoc(riderRef);
      
      if (riderDoc.exists()) {
        const data = { id: riderDoc.id, ...riderDoc.data() };
        setRider(data as Rider);
        return data;
      } else {
        setRider(null);
        return null;
      }
    } catch (error) {
      console.error('Error refreshing rider data:', error);
      setRider(null);
      return null;
    }
  };

  // Compute userType based on driver and rider state
  const userType = driver ? 'driver' : rider ? 'rider' : null;

  const isLoading = loading || (user && (driverLoading || riderLoading));

  console.log('AuthProvider state:', {
    hasUser: !!user,
    hasDriver: !!driver,
    hasRider: !!rider,
    loading: isLoading,
    authLoading: loading,
    driverLoading,
    riderLoading
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        driver,
        rider,
        loading: isLoading,
        userType,
        signInWithGoogle,
        signOut,
        refreshDriverData,
        refreshRiderData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
