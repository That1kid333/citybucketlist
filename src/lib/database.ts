import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config';
import { Driver } from '../types/driver';

// Driver operations
export async function createDriver(driver: Partial<Driver>) {
  const docRef = await addDoc(collection(db, 'drivers'), driver);
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...docSnap.data() };
}

export async function updateDriver(id: string, updates: Partial<Driver>) {
  const docRef = doc(db, 'drivers', id);
  await updateDoc(docRef, updates);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getDriver(id: string) {
  const docRef = doc(db, 'drivers', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Driver not found');
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getDriverByEmail(email: string) {
  const q = query(collection(db, 'drivers'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) throw new Error('Driver not found');
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Rider operations
export async function createRider(rider: any) {
  const docRef = await addDoc(collection(db, 'riders'), rider);
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...docSnap.data() };
}

export async function updateRider(id: string, updates: any) {
  const docRef = doc(db, 'riders', id);
  await updateDoc(docRef, updates);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getRider(id: string) {
  const docRef = doc(db, 'riders', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Rider not found');
  return { id: docSnap.id, ...docSnap.data() };
}

// Ride operations
export async function createRide(ride: any) {
  const docRef = await addDoc(collection(db, 'rides'), ride);
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...docSnap.data() };
}

export async function getRidesByDriver(driverId: string) {
  const q = query(
    collection(db, 'rides'), 
    where('driver_id', '==', driverId),
    orderBy('created_at', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRidesByRider(riderId: string) {
  const q = query(
    collection(db, 'rides'), 
    where('rider_id', '==', riderId),
    orderBy('created_at', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Message operations
export async function createMessage(message: any) {
  const docRef = await addDoc(collection(db, 'messages'), message);
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...docSnap.data() };
}

export async function getMessagesByRide(rideId: string) {
  const q = query(
    collection(db, 'messages'), 
    where('ride_id', '==', rideId),
    orderBy('created_at', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Real-time subscriptions
export function subscribeToDriverUpdates(driverId: string, callback: (payload: any) => void) {
  const docRef = doc(db, 'drivers', driverId);
  return onSnapshot(docRef, (snapshot) => {
    callback({ id: snapshot.id, ...snapshot.data() });
  });
}

export function subscribeToRideUpdates(rideId: string, callback: (payload: any) => void) {
  const docRef = doc(db, 'rides', rideId);
  return onSnapshot(docRef, (snapshot) => {
    callback({ id: snapshot.id, ...snapshot.data() });
  });
}

export function subscribeToNewMessages(rideId: string, callback: (payload: any) => void) {
  const q = query(
    collection(db, 'messages'),
    where('ride_id', '==', rideId),
    orderBy('created_at', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}