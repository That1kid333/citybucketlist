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
    vehicle: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
      console.log('Driver document does not exist, creating new one');
      const driverData: Driver = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userCredential.user.displayName || '',
        phone: '',
        vehicle: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'drivers', userCredential.user.uid), driverData);
      console.log('Driver document created successfully');
      return driverData;
    }

    console.log('Driver document found');
    return { id: driverDoc.id, ...driverDoc.data() } as Driver;
  } catch (error: any) {
    console.error('Login error:', error);
    // Handle specific Firebase auth errors
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Please contact support.');
    } else {
      throw new Error('Failed to log in. Please try again.');
    }
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
    console.log('Checking for redirect result');
    const result = await getRedirectResult(auth);
    
    if (!result) {
      console.log('No redirect result found');
      return null;
    }

    const { user } = result;
    console.log('Got redirect result for user:', user.email);

    // Check if driver document exists
    const driverRef = doc(db, 'drivers', user.uid);
    const driverDoc = await getDoc(driverRef);
    
    if (driverDoc.exists()) {
      console.log('Existing driver found');
      const driverData = driverDoc.data() as Driver;
      return {
        id: user.uid,
        ...driverData,
        email: user.email || driverData.email,
        name: user.displayName || driverData.name,
        photoURL: user.photoURL || driverData.photoURL
      };
    }

    // Create new driver document
    console.log('Creating new driver document');
    const driverData: Driver = {
      id: user.uid,
      email: user.email!,
      name: user.displayName || '',
      photoURL: user.photoURL || '',
      phone: '',
      vehicle: null,
      locationId: '',
      available: false,
      isActive: true,
      rating: 5.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(driverRef, driverData);
    console.log('New driver document created');
    return driverData;

  } catch (error) {
    console.error('Error handling redirect result:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  console.log('Signing out user');
  await firebaseSignOut(auth);
  console.log('User signed out successfully');
}