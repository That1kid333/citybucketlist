import { 
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Driver } from '../../types/driver';
import { locations } from '../../types/location';

export const ridesService = {
  async getAvailableDrivers(): Promise<Driver[]> {
    try {
      console.log('Fetching available drivers');
      
      // Simplified query without orderBy for now
      const q = query(
        collection(db, 'drivers'),
        where('available', '==', true),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const drivers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));

      // Sort in memory instead
      drivers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      console.log(`Found ${drivers.length} available drivers`);
      return drivers;
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  },

  async getAvailableDriversByLocation(locationId: string): Promise<Driver[]> {
    try {
      console.log('Fetching drivers for location:', locationId);
      
      // Validate location exists
      const location = locations.find(loc => loc.id === locationId);
      if (!location) {
        console.error('Invalid location ID:', locationId);
        return [];
      }

      // Query for active and available drivers
      const q = query(
        collection(db, 'drivers'),
        where('locationId', '==', locationId),
        where('available', '==', true),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const drivers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          locationName: location.name
        } as Driver;
      });

      // Sort by rating (higher first)
      drivers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      console.log(`Found ${drivers.length} drivers for location:`, locationId);
      return drivers;
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  },

  async createRide(rideData: {
    name: string;
    phone: string;
    pickup?: string;
    dropoff?: string;
    locationId: string;
    selectedDriverId?: string;
  }) {
    // First, find available drivers
    const availableDrivers = await this.getAvailableDriversByLocation(rideData.locationId);
    
    const rideDoc = {
      customerName: rideData.name,
      phone: rideData.phone,
      pickup: rideData.pickup || '',
      dropoff: rideData.dropoff || '',
      locationId: rideData.locationId,
      status: rideData.selectedDriverId ? 'assigned' : 'pending',
      created_at: new Date().toISOString(),
      scheduled_time: new Date().toISOString(),
      driverId: rideData.selectedDriverId || '',
      availableDrivers: availableDrivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        photo: driver.photoURL || '',
        rating: driver.rating || 5.0
      })),
      assignedDriver: rideData.selectedDriverId ? {
        id: rideData.selectedDriverId,
        assignedAt: new Date().toISOString()
      } : null
    };

    const ride = await addDoc(collection(db, 'rides'), rideDoc);

    // If a driver was selected, assign them immediately
    if (rideData.selectedDriverId) {
      const selectedDriver = availableDrivers.find(d => d.id === rideData.selectedDriverId);
      if (selectedDriver) {
        await this.assignDriver(ride.id, selectedDriver.id);
      }
    }

    return { id: ride.id };
  },

  async getRidesByDriver(driverId: string) {
    const q = query(
      collection(db, 'rides'),
      where('driverId', '==', driverId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getAvailableRides() {
    const q = query(
      collection(db, 'rides'),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getRidesByLocation(locationId: string) {
    const q = query(
      collection(db, 'rides'),
      where('locationId', '==', locationId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async assignDriver(rideId: string, driverId: string) {
    const driverDoc = await getDoc(doc(db, 'drivers', driverId));
    if (!driverDoc.exists()) {
      throw new Error('Driver not found');
    }

    const driverData = driverDoc.data();
    await updateDoc(doc(db, 'rides', rideId), {
      driverId,
      assignedDriver: {
        id: driverId,
        name: driverData.name,
        photo: driverData.photoURL,
        rating: driverData.rating
      },
      status: 'assigned',
      updated_at: new Date().toISOString()
    });
  },

  async updateRideStatus(rideId: string, status: string) {
    await updateDoc(doc(db, 'rides', rideId), {
      status,
      updated_at: new Date().toISOString()
    });
  },

  subscribeToRides(driverId: string, callback: (rides: any[]) => void) {
    if (!driverId) {
      console.error('Driver ID is required for subscribeToRides');
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'rides'),
      where('driverId', '==', driverId)
    );

    return onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(rides);
    }, (error) => {
      console.error('Error in rides subscription:', error);
      callback([]);
    });
  },

  subscribeToAvailableRides(callback: (rides: any[]) => void) {
    const q = query(
      collection(db, 'rides'),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(rides);
    });
  },

  subscribeToRidesByLocation(locationId: string, callback: (rides: any[]) => void) {
    const q = query(
      collection(db, 'rides'),
      where('locationId', '==', locationId),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(rides);
    });
  },

  subscribeToDriverRides(driverId: string, callback: (rides: any[]) => void) {
    const q = query(
      collection(db, 'rides'),
      where('driverId', '==', driverId)
    );

    return onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(rides);
    });
  }
};