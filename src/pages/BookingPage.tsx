import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { FormInput } from '../components/FormInput';
import { LocationSelector } from '../components/LocationSelector';
import { DriverPreviewCard } from '../components/DriverPreviewCard';
import { DriverDetailsModal } from '../components/DriverDetailsModal';
import { locations } from '../types/location';
import { webhookService } from '../lib/services/webhook.service';
import { ridesService } from '../lib/services/rides.service';
import { Driver } from '../types/driver';
import { Star, User } from 'lucide-react';

interface RideRequest {
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  locationId: string;
  selectedDriverId?: string;
}

function BookingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RideRequest>({
    name: '',
    phone: '',
    pickup: '',
    dropoff: '',
    locationId: locations[0].id
  });
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'drivers'>('form');

  useEffect(() => {
    if (step === 'drivers') {
      loadAvailableDrivers(formData.locationId);
    }
  }, [formData.locationId, step]);

  const loadAvailableDrivers = async (locationId: string) => {
    try {
      const drivers = await ridesService.getAvailableDriversByLocation(locationId);
      setAvailableDrivers(drivers);
    } catch (err) {
      console.error('Error loading drivers:', err);
      setError('Failed to load available drivers. Please try again.');
    }
  };

  const handleFindDrivers = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setError('');
    setStep('drivers');
  };

  const handleSubmitRide = async () => {
    if (!selectedDriver) {
      setError('Please select a driver');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Send to webhook
      await webhookService.submitRideRequest(formData);

      // Create ride in Firebase
      const rideData = {
        ...formData,
        selectedDriverId: selectedDriver.id,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      await ridesService.createRide(rideData);

      // Redirect to confirmation page with booking details
      navigate('/booking-confirmation', {
        state: {
          booking: {
            ...formData,
            driver: selectedDriver,
            created_at: rideData.created_at
          }
        }
      });
    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit ride request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (locationId: string) => {
    setFormData(prev => ({ ...prev, locationId }));
    setSelectedDriver(null);
  };

  const handleDriverSelect = (driver: Driver) => {
    if (!driver) return;
    setSelectedDriver(prev => prev?.id === driver.id ? null : driver);
    setViewingDriver(null); // Close the modal after selection
  };

  const handleDriverClick = (driver: Driver) => {
    if (!driver) return;
    setViewingDriver(driver);
  };

  const handleBackToForm = () => {
    setStep('form');
    setSelectedDriver(null);
    setViewingDriver(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-[#C69249] text-4xl font-bold mb-2">
            NEED A RIDE?
          </h1>
          <h2 className="text-white text-2xl mb-4">
            Private Rider Association Sign-up & Scheduler
          </h2>

          <p className="text-white mb-8">
            If you're looking for a ride to the airport or need a long distance run,
            please submit your info below. (Please schedule 24 hours prior)
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-center">
              {error}
            </div>
          )}

          {step === 'form' ? (
            <div className="max-w-lg mx-auto bg-neutral-900 p-8 rounded-lg">
              <form onSubmit={handleFindDrivers} className="space-y-6">
                <div className="mb-6">
                  <LocationSelector
                    locations={locations}
                    selectedLocation={formData.locationId}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                <FormInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />

                <FormInput
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  required
                />

                <FormInput
                  label="Pickup Location (Optional)"
                  name="pickup"
                  value={formData.pickup}
                  onChange={handleChange}
                  placeholder="Enter pickup address"
                />

                <FormInput
                  label="Drop-off Location (Optional)"
                  name="dropoff"
                  value={formData.dropoff}
                  onChange={handleChange}
                  placeholder="Enter drop-off address"
                />

                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C69249] text-white py-3 px-4 rounded-lg hover:bg-[#A77841] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Finding Drivers...' : 'Find Available Drivers'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToForm}
                  className="text-[#F5A623] hover:underline flex items-center gap-2"
                >
                  ← Back to Form
                </button>
                <div className="text-neutral-400">
                  {formData.name} • {formData.phone}
                </div>
              </div>

              <div className="bg-neutral-900 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-neutral-400 text-sm mb-1">Pickup</div>
                    <div>{formData.pickup || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400 text-sm mb-1">Drop-off</div>
                    <div>{formData.dropoff || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[#C69249]">
                  Available Drivers
                </h3>
                {availableDrivers.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {availableDrivers.map((driver) => (
                      <DriverPreviewCard
                        key={driver.id}
                        driver={driver}
                        selected={selectedDriver?.id === driver.id}
                        onClick={() => handleDriverClick(driver)}
                        onSelect={() => handleDriverSelect(driver)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    No drivers available at the moment. Please try again later.
                  </div>
                )}
              </div>

              {selectedDriver && (
                <div className="mt-4 p-4 bg-[#F5A623]/10 rounded-lg mb-6">
                  <p className="text-[#F5A623]">
                    Selected Driver: {selectedDriver.name}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmitRide}
                disabled={isSubmitting || !selectedDriver}
                className={`w-full py-3 rounded-lg font-medium ${
                  isSubmitting || !selectedDriver
                    ? 'bg-neutral-700 cursor-not-allowed'
                    : 'bg-[#F5A623] hover:bg-[#F5A623]/90'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Ride Request'}
              </button>
            </div>
          )}
        </div>
      </main>

      {viewingDriver && (
        <DriverDetailsModal
          driver={viewingDriver}
          onClose={() => setViewingDriver(null)}
          onSelect={handleDriverSelect}
          selected={selectedDriver?.id === viewingDriver.id}
        />
      )}
    </div>
  );
}

export default BookingPage;