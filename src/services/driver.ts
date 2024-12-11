import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Driver } from '../types/driver';

export async function getDriverByUid(uid: string): Promise<Driver | null> {
  console.log('Fetching driver data for UID:', uid);
  const driverDoc = await getDoc(doc(db, 'drivers', uid));
  
  if (!driverDoc.exists()) {
    console.log('No driver document found for UID:', uid);
    return null;
  }

  console.log('Driver document found for UID:', uid);
  return { id: driverDoc.id, ...driverDoc.data() } as Driver;
}

export async function updateDriver(driverId: string, data: Partial<Driver>): Promise<void> {
  console.log('Updating driver data for ID:', driverId, 'with data:', data);
  await doc(db, 'drivers', driverId).update({
    ...data,
    updatedAt: new Date().toISOString()
  });
  console.log('Driver data updated successfully');
}
