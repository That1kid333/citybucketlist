import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from './firebase';
import { toast } from 'react-hot-toast';

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // Try popup first
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (popupError: any) {
      // If popup blocked or fails, fall back to redirect
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request') {
        console.log('Popup blocked or closed, falling back to redirect');
        await signInWithRedirect(auth, provider);
        return null; // Will be handled by checkRedirectResult
      }
      throw popupError;
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    toast.error('Failed to sign in with Google');
    throw error;
  }
}

export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Successfully got redirect result');
      return result;
    }
    return null;
  } catch (error) {
    console.error('Error checking redirect result:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    toast.success('Successfully signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error('Failed to sign out');
    throw error;
  }
}
