import { createContext, useContext, useEffect, useState } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Driver } from '../types/driver';
import { Rider } from '../types/rider';

interface AuthContextType {
  user: User | null;
  userType: 'driver' | 'rider' | null;
  driver: Driver | null;
  rider: Rider | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRiderData: () => Promise<Rider | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'driver' | 'rider' | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth listener');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        console.log('Auth state changed:', { userId: user.uid });
        try {
          // Check for rider profile first since we're registering a rider
          console.log('Setting up rider listener for user:', user.uid);
          const riderDoc = await getDoc(doc(db, 'riders', user.uid));
          if (riderDoc.exists()) {
            const riderData = riderDoc.data() as Rider;
            console.log('Rider data changed:', riderData);
            setRider(riderData);
            setUserType('rider');
            setDriver(null);
          } else {
            // If not a rider, check for driver profile
            console.log('Setting up driver listener for user:', user.uid);
            const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
            if (driverDoc.exists()) {
              const driverData = driverDoc.data() as Driver;
              console.log('Driver data changed:', driverData);
              setDriver(driverData);
              setUserType('driver');
              setRider(null);
            } else {
              // No profile found
              setDriver(null);
              setRider(null);
              setUserType(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setDriver(null);
          setRider(null);
          setUserType(null);
        }
      } else {
        setDriver(null);
        setRider(null);
        setUserType(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setDriver(null);
      setRider(null);
      setUserType(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshRiderData = async () => {
    if (!user) return null;
    
    try {
      console.log('Refreshing rider data for user:', user.uid);
      const riderDoc = await getDoc(doc(db, 'riders', user.uid));
      
      if (riderDoc.exists()) {
        const riderData = { id: user.uid, ...riderDoc.data() } as Rider;
        console.log('Rider data refreshed:', riderData);
        setRider(riderData);
        setUserType('rider');
        setDriver(null);
        return riderData;
      } else {
        console.log('No rider profile found for user:', user.uid);
        setRider(null);
        setUserType(null);
        return null;
      }
    } catch (error) {
      console.error('Error refreshing rider data:', error);
      setRider(null);
      setUserType(null);
      return null;
    }
  };

  const value = {
    user,
    userType,
    driver,
    rider,
    loading,
    signOut,
    refreshRiderData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
