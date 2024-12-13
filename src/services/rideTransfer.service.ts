import { collection, doc, addDoc, updateDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RideTransfer, RideTransferRequest } from '../types/rideTransfer';

export const rideTransferService = {
  async createTransferRequest(request: RideTransferRequest): Promise<RideTransfer> {
    const transferData = {
      ...request,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'rideTransfers'), transferData);
    return {
      id: docRef.id,
      ...transferData,
    } as RideTransfer;
  },

  async acceptTransferRequest(transferId: string): Promise<void> {
    const transferRef = doc(db, 'rideTransfers', transferId);
    const transferDoc = await getDoc(transferRef);
    
    if (!transferDoc.exists()) {
      throw new Error('Transfer request not found');
    }

    const transfer = transferDoc.data() as RideTransfer;
    const rideRef = doc(db, 'rides', transfer.rideId);

    // Update ride with new driver
    await updateDoc(rideRef, {
      driverId: transfer.newDriverId,
      transferFee: transfer.transferFee,
      updatedAt: new Date().toISOString(),
    });

    // Update transfer status
    await updateDoc(transferRef, {
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    });
  },

  async rejectTransferRequest(transferId: string): Promise<void> {
    const transferRef = doc(db, 'rideTransfers', transferId);
    await updateDoc(transferRef, {
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    });
  },

  async getTransferRequestsForDriver(driverId: string): Promise<RideTransfer[]> {
    const q = query(
      collection(db, 'rideTransfers'),
      where('newDriverId', '==', driverId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RideTransfer[];
  },

  async getTransferHistory(driverId: string): Promise<RideTransfer[]> {
    const sentQ = query(
      collection(db, 'rideTransfers'),
      where('originalDriverId', '==', driverId)
    );

    const receivedQ = query(
      collection(db, 'rideTransfers'),
      where('newDriverId', '==', driverId)
    );

    const [sentDocs, receivedDocs] = await Promise.all([
      getDocs(sentQ),
      getDocs(receivedQ)
    ]);

    const transfers = [
      ...sentDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...receivedDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ] as RideTransfer[];

    return transfers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
};
