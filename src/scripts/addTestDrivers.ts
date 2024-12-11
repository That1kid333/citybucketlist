import { db } from './firebase-admin';
import { collection, doc, setDoc } from 'firebase/firestore';

const testDrivers = [
  // Pittsburgh Drivers
  {
    id: 'driver1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(412) 555-0101',
    photoURL: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400',
    locationId: 'pittsburgh',
    isActive: true,
    available: true,
    rating: 4.8,
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      plate: 'PGH-1234'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'driver2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(412) 555-0102',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    locationId: 'pittsburgh',
    isActive: true,
    available: true,
    rating: 4.9,
    vehicle: {
      make: 'Honda',
      model: 'Accord',
      year: 2023,
      color: 'Black',
      plate: 'PGH-5678'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // South West Florida Drivers
  {
    id: 'driver3',
    name: 'Michael Rodriguez',
    email: 'michael.r@example.com',
    phone: '(239) 555-0101',
    photoURL: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400',
    locationId: 'swfl',
    isActive: true,
    available: true,
    rating: 4.7,
    vehicle: {
      make: 'Tesla',
      model: 'Model Y',
      year: 2023,
      color: 'White',
      plate: 'FL-1234'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'driver4',
    name: 'Emily Martinez',
    email: 'emily.m@example.com',
    phone: '(239) 555-0102',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    locationId: 'swfl',
    isActive: true,
    available: true,
    rating: 4.9,
    vehicle: {
      make: 'Lexus',
      model: 'RX',
      year: 2022,
      color: 'Pearl White',
      plate: 'FL-5678'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function addTestDrivers() {
  try {
    const driversRef = collection(db, 'drivers');
    
    for (const driver of testDrivers) {
      await setDoc(doc(driversRef, driver.id), driver);
      console.log(`Added driver: ${driver.name}`);
    }
    
    console.log('Successfully added all test drivers!');
  } catch (error) {
    console.error('Error adding test drivers:', error);
  }
}

// Run the function
addTestDrivers();
