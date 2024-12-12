import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { signInWithGoogle, signOut } from '../lib/auth';
import { Driver } from '../types/driver';
import { Rider } from '../types/rider';

interface AuthContextType {
  user: User | null;
  driver: Driver | null;
  rider: Rider | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilesChecked, setProfilesChecked] = useState(false);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed. User:', user?.uid);
      setUser(user);

      if (!user) {
        console.log('No user logged in, clearing driver and rider data');
        setDriver(null);
        setRider(null);
        setLoading(false);
        setProfilesChecked(false);
        return;
      }

      try {
        // Check for driver profile
        const driverDoc = doc(db, 'drivers', user.uid);
        const driverUnsubscribe = onSnapshot(driverDoc, (doc) => {
          if (doc.exists()) {
            console.log('Driver profile found:', doc.id);
            setDriver({ id: doc.id, ...doc.data() } as Driver);
          } else {
            console.log('No driver profile found');
            setDriver(null);
          }
          setProfilesChecked(true);
        });

        // Check for rider profile
        const riderDoc = doc(db, 'riders', user.uid);
        const riderUnsubscribe = onSnapshot(riderDoc, (doc) => {
          if (doc.exists()) {
            console.log('Rider profile found:', doc.id);
            setRider({ id: doc.id, ...doc.data() } as Rider);
          } else {
            console.log('No rider profile found');
            setRider(null);
          }
          setProfilesChecked(true);
        });

        return () => {
          driverUnsubscribe();
          riderUnsubscribe();
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        setProfilesChecked(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update loading state when profiles are checked
  useEffect(() => {
    if (profilesChecked) {
      console.log('Profiles checked, setting loading to false');
      setLoading(false);
    }
  }, [profilesChecked]);

  const value = {
    user,
    driver,
    rider,
    loading,
    signInWithGoogle,
    signOut: async () => {
      await signOut();
      setDriver(null);
      setRider(null);
      setProfilesChecked(false);
    },
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
