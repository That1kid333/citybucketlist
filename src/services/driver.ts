import { doc, updateDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Driver } from '../types/driver';

export async function getDriver(driverId: string): Promise<Driver | null> {
  const driverRef = doc(db, 'drivers', driverId);
  const driverSnap = await getDoc(driverRef);
  return driverSnap.exists() ? driverSnap.data() as Driver : null;
}

export async function getDriverByEmail(email: string): Promise<Driver | null> {
  const driversRef = collection(db, 'drivers');
  const q = query(driversRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty ? querySnapshot.docs[0].data() as Driver : null;
}

export async function updateDriver(driverId: string, data: Partial<Driver>): Promise<void> {
  const driverRef = doc(db, 'drivers', driverId);
  await updateDoc(driverRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export async function toggleDriverAvailability(driverId: string, available: boolean): Promise<void> {
  await updateDriver(driverId, { available });
}
