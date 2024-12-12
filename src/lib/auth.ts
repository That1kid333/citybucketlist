import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    
    // Configure custom parameters for the Google sign-in popup
    provider.setCustomParameters({
      prompt: 'select_account',
      // Handle COOP policy by specifying window features
      display: 'popup'
    });

    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
