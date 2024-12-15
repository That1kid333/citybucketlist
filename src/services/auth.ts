import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Driver } from '../types/driver';

const googleProvider = new GoogleAuthProvider();

export async function registerDriver(email: string, password: string): Promise<Driver> {
  console.log('Starting driver registration with email:', email);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  console.log('User registered successfully:', userCredential.user.email);

  const driverData: Driver = {
    id: userCredential.user.uid,
    email: userCredential.user.email!,
    name: userCredential.user.displayName || '',
    phone: '',
    locationId: '',
    isActive: true,
    available: false,
    vehicle: {
      make: '',
      model: '',
      year: '',
      color: '',
      plate: ''
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('Creating driver document in Firestore');
  await setDoc(doc(db, 'drivers', userCredential.user.uid), driverData);
  console.log('Driver document created successfully');

  return driverData;
}

export async function loginDriver(email: string, password: string): Promise<Driver> {
  console.log('Attempting to log in driver with email:', email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in successfully:', userCredential.user.email);

    const driverDoc = await getDoc(doc(db, 'drivers', userCredential.user.uid));
    if (!driverDoc.exists()) {
      console.log('No driver profile found');
      throw new Error('No driver profile found. Please register first.');
    }

    return driverDoc.data() as Driver;
  } catch (error) {
    console.error('Error logging in driver:', error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<void> {
  try {
    console.log('Starting Google sign-in');
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      // Add additional OAuth 2.0 scopes if needed
      scope: [
        'profile',
        'email'
      ].join(' ')
    });
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Error initiating Google sign-in:', error);
    throw error;
  }
}

export async function handleRedirectResult(): Promise<Driver | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      console.log('No redirect result');
      return null;
    }

    console.log('Got redirect result:', result.user.email);
    const driverDoc = await getDoc(doc(db, 'drivers', result.user.uid));

    if (driverDoc.exists()) {
      console.log('Driver profile found');
      return driverDoc.data() as Driver;
    }

    // Create a new driver profile if one doesn't exist
    console.log('Creating new driver profile for Google user');
    const newDriverData: Driver = {
      id: result.user.uid,
      email: result.user.email!,
      name: result.user.displayName || '',
      phone: '',
      locationId: '',
      isActive: true,
      available: false,
      vehicle: {
        make: '',
        model: '',
        year: '',
        color: '',
        plate: ''
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'drivers', result.user.uid), newDriverData);
    console.log('New driver profile created successfully');
    return newDriverData;
  } catch (error) {
    console.error('Error handling redirect:', error);
    throw error;
  }
}

export async function handleAuthCallback(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}> {
  try {
    console.log('Exchanging authorization code for tokens...');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        redirect_uri: `${window.location.origin}/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange authorization code for tokens');
    }

    const data = await response.json();
    console.log('Token exchange successful');

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: Date.now() + (data.expires_in * 1000),
    };
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    // Clear any local storage or state if needed
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.href = '/'; // Force redirect to home page
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}