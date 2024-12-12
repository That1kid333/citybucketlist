import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { webhookService } from './webhook.service';
import { Driver } from '../../types/driver';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class AuthService {
  async register(driverData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    vehicle: {
      make: string;
      model: string;
      year: string;
      color: string;
      plate: string;
    };
  }): Promise<Driver> {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        driverData.email,
        driverData.password
      );

      // Create driver document
      const driverDoc: Driver = {
        id: userCredential.user.uid,
        name: driverData.name,
        email: driverData.email,
        phone: driverData.phone,
        photo: '',
        location: '',
        driversLicense: {
          number: '',
          expirationDate: '',
          documentUrl: ''
        },
        vehicle: driverData.vehicle,
        backgroundCheck: {
          status: 'pending',
          submissionDate: new Date().toISOString(),
        },
        available: false,
        rating: 5.0,
        metrics: {
          totalRides: 0,
          yearsActive: 0,
          completionRate: 100,
          averageResponseTime: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'drivers', userCredential.user.uid), driverDoc);
      
      // Send to webhook
      await webhookService.submitDriverRegistration(driverDoc);

      return driverDoc;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<Driver> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const driverDoc = await getDoc(doc(db, 'drivers', userCredential.user.uid));
      
      if (!driverDoc.exists()) {
        throw new Error('Driver not found');
      }

      return { id: driverDoc.id, ...driverDoc.data() } as Driver;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: {
    name?: string;
    photo?: File;
  }): Promise<Driver> {
    try {
      const userRef = doc(db, 'drivers', userId);
      const updateData: { [key: string]: any } = {
        updated_at: new Date().toISOString()
      };

      // Update name if provided
      if (updates.name) {
        updateData.name = updates.name;
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: updates.name
          });
        }
      }

      // Upload and update photo if provided
      if (updates.photo) {
        const photoRef = ref(storage, `driver-photos/${userId}`);
        await uploadBytes(photoRef, updates.photo);
        const photoUrl = await getDownloadURL(photoRef);
        updateData.photo = photoUrl;
        
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            photoURL: photoUrl
          });
        }
      }

      // Update Firestore document
      await updateDoc(userRef, updateData);

      // Get and return updated driver document
      const driverDoc = await getDoc(userRef);
      return { id: driverDoc.id, ...driverDoc.data() } as Driver;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  private formatUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  }
}

export const authService = new AuthService();