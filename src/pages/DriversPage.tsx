import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Phone, MapPin } from 'lucide-react';
import { LocationSelector } from '../components/LocationSelector';
import { locations } from '../types/location';
import { DriverDetailsModal } from '../components/DriverDetailsModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Driver } from '../types/driver';
import { toast } from 'react-hot-toast';

function DriversPage() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedLocation, setSelectedLocation] = useState(locations[0].id);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, [selectedLocation]);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const driversQuery = query(
        collection(db, 'drivers'),
        where('available', '==', true),
        where('locationId', '==', selectedLocation)
      );
      
      const snapshot = await getDocs(driversQuery);
      const driversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];

      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleSelectDriver = async (driver: Driver) => {
    setSelectedDriver(null);
    setShowConfirmation(true);
    // Additional logic for ride request can be added here
  };

  const handleCallDriver = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.available && driver.locationId === selectedLocation
  );

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Available Drivers</h1>
          <LocationSelector
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#F5A623] mx-auto"></div>
            <p className="mt-4 text-neutral-400">Loading drivers...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-400">No drivers available in this location</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => handleDriverClick(driver)}
                className="bg-neutral-900 rounded-lg p-6 cursor-pointer hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800">
                    {driver.photoURL ? (
                      <img
                        src={driver.photoURL}
                        alt={driver.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{driver.name}</h3>
                    <div className="flex items-center text-sm text-neutral-400">
                      <MapPin size={16} className="mr-1" />
                      {locations.find(l => l.id === driver.locationId)?.name}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-neutral-400">Rating</p>
                    <p className="font-semibold">
                      {driver.rating ? `${driver.rating.toFixed(1)}/5.0` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Response Time</p>
                    <p className="font-semibold">{driver.responseTime || 'N/A'}</p>
                  </div>
                </div>

                {driver.vehicle && (
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-neutral-800 p-3 rounded-lg mb-4">
                    <div>
                      <div className="text-neutral-400 text-sm">Vehicle</div>
                      <div className="font-semibold">{driver.vehicle.make} {driver.vehicle.model}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 text-sm">Year</div>
                      <div className="font-semibold">{driver.vehicle.year}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 text-sm">Color</div>
                      <div className="font-semibold">{driver.vehicle.color}</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleSelectDriver(driver)}
                    className="flex-1 px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
                  >
                    Select Driver
                  </button>
                  {driver.phone && (
                    <button
                      onClick={() => handleCallDriver(driver.phone!)}
                      className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors w-full sm:w-auto"
                    >
                      <Phone className="w-5 h-5 mx-auto" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onSelect={() => handleSelectDriver(selectedDriver)}
        />
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Driver Selected</h3>
            <p className="text-neutral-400">
              Your request has been sent to the driver. They will contact you shortly.
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="mt-4 w-full px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriversPage;