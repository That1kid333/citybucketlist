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
      
      const q = query(
        collection(db, 'drivers'),
        where('available', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const drivers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));

      // Sort by rating
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

      // Query for available drivers in the location
      const q = query(
        collection(db, 'drivers'),
        where('locationId', '==', locationId),
        where('available', '==', true)
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

      // Sort by rating
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
    isGuestBooking?: boolean;
  }) {
    try {
      console.log('Creating ride with data:', rideData);
      
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
        selectedDriverId: rideData.selectedDriverId || '',
        driverId: rideData.selectedDriverId || '', // Set both fields for compatibility
        isGuestBooking: true,
        availableDrivers: availableDrivers.map(driver => ({
          id: driver.id,
          name: driver.name,
          photo: driver.photoURL || '',
          rating: driver.rating || 5.0
        }))
      };

      console.log('Transformed ride doc:', rideDoc);

      try {
        // Try to create the document
        const ridesCollection = collection(db, 'rides');
        console.log('Got rides collection reference');
        
        const ride = await addDoc(ridesCollection, rideDoc);
        console.log('Created ride with ID:', ride.id);

        return { 
          id: ride.id,
          rideDetails: {
            pickupLocation: rideDoc.pickup,
            dropoffLocation: rideDoc.dropoff,
            customerName: rideDoc.customerName,
            phone: rideDoc.phone
          }
        };
      } catch (writeError) {
        console.error('Error writing to Firestore:', writeError);
        console.log('Firestore write error details:', {
          code: writeError.code,
          message: writeError.message,
          details: writeError.details
        });
        throw writeError;
      }
    } catch (error) {
      console.error('Error creating ride:', error);
      throw error;
    }
  },

  async getRidesByDriver(driverId: string) {
    console.log('Getting rides for driver:', driverId);
    const q = query(
      collection(db, 'rides'),
      where('selectedDriverId', '==', driverId)
    );

    const querySnapshot = await getDocs(q);
    const rides = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Found rides:', rides);
    return rides;
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

  async transferRide(rideId: string, fromDriverId: string, toDriverId: string) {
    try {
      const rideRef = doc(db, 'rides', rideId);
      const rideDoc = await getDoc(rideRef);
      
      if (!rideDoc.exists()) {
        throw new Error('Ride not found');
      }

      const ride = rideDoc.data();
      if (ride.driverId !== fromDriverId) {
        throw new Error('Unauthorized to transfer this ride');
      }

      // Get the target driver
      const toDriverRef = doc(db, 'drivers', toDriverId);
      const toDriverDoc = await getDoc(toDriverRef);
      
      if (!toDriverDoc.exists()) {
        throw new Error('Target driver not found');
      }

      const toDriver = toDriverDoc.data();
      if (!toDriver.available || !toDriver.isActive) {
        throw new Error('Target driver is not available');
      }

      // Update the ride with new driver
      await updateDoc(rideRef, {
        driverId: toDriverId,
        previousDriverId: fromDriverId,
        transferredAt: new Date().toISOString(),
        status: 'transferred'
      });

      return true;
    } catch (error) {
      console.error('Error transferring ride:', error);
      throw error;
    }
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
    console.log('Subscribing to rides for driver:', driverId);
    const q = query(
      collection(db, 'rides'),
      where('selectedDriverId', '==', driverId)
    );

    return onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Real-time rides update:', rides);
      callback(rides);
    }, (error) => {
      console.error('Error subscribing to driver rides:', error);
    });
  }
};