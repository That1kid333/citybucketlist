import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';
import { Rider, RiderFormData } from '../../types/rider';

export async function addRider(driverId: string, riderData: RiderFormData): Promise<Rider> {
  try {
    const rider = {
      ...riderData,
      driverId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rideHistory: []
    };

    const docRef = await addDoc(collection(db, 'riders'), rider);
    return { id: docRef.id, ...rider };
  } catch (error) {
    console.error('Error adding rider:', error);
    throw error;
  }
}

export async function updateRider(riderId: string, riderData: Partial<RiderFormData>): Promise<void> {
  try {
    const riderRef = doc(db, 'riders', riderId);
    await updateDoc(riderRef, {
      ...riderData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating rider:', error);
    throw error;
  }
}

export async function deleteRider(riderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'riders', riderId));
  } catch (error) {
    console.error('Error deleting rider:', error);
    throw error;
  }
}

export async function getDriverRiders(driverId: string): Promise<Rider[]> {
  try {
    const q = query(
      collection(db, 'riders'),
      where('driverId', '==', driverId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rider));
  } catch (error) {
    console.error('Error getting driver riders:', error);
    throw error;
  }
}

export async function addRideToHistory(
  riderId: string,
  rideData: {
    pickup: string;
    dropoff: string;
    fare?: number;
  }
): Promise<void> {
  try {
    const riderRef = doc(db, 'riders', riderId);
    const ride = {
      ...rideData,
      date: new Date().toISOString()
    };
    
    await updateDoc(riderRef, {
      rideHistory: arrayUnion(ride),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding ride to history:', error);
    throw error;
  }
}
