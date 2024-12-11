import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { locations } from '../types/location';
import { FormInput } from '../components/FormInput';
import { vehicleMakes, vehicleColors, getModelsByMake } from '../data/vehicles';

interface RegistrationForm {
  phone: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
  };
  locationId: string;
}

export default function DriverRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, driver, loading, refreshDriverData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const [formData, setFormData] = useState<RegistrationForm>({
    phone: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      color: '',
      plate: ''
    },
    locationId: ''
  });

  // Update available models when make changes
  useEffect(() => {
    if (formData.vehicle.make) {
      const models = getModelsByMake(formData.vehicle.make);
      setAvailableModels(models);
      // Reset model if current selection is not valid for new make
      if (!models.includes(formData.vehicle.model)) {
        setFormData(prev => ({
          ...prev,
          vehicle: { ...prev.vehicle, model: '' }
        }));
      }
    } else {
      setAvailableModels([]);
    }
  }, [formData.vehicle.make]);

  // Handle navigation when no user or when driver data already exists
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/driver/signup');
      } else if (driver) {
        navigate('/driver/portal');
      }
    }
  }, [user, driver, loading, navigate]);

  // Return null if loading, no user, or driver already exists
  if (loading || !user || driver) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.locationId) throw new Error('Please select a location');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.vehicle.make.trim()) throw new Error('Vehicle make is required');
      if (!formData.vehicle.model.trim()) throw new Error('Vehicle model is required');
      if (!formData.vehicle.year.trim()) throw new Error('Vehicle year is required');
      if (!formData.vehicle.color.trim()) throw new Error('Vehicle color is required');
      if (!formData.vehicle.plate.trim()) throw new Error('License plate is required');

      // Year validation
      const year = parseInt(formData.vehicle.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        throw new Error(`Please enter a valid year between 1900 and ${currentYear + 1}`);
      }

      // Phone validation
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Create driver document
      const driverData = {
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        phone: formData.phone,
        vehicle: formData.vehicle,
        locationId: formData.locationId,
        photoURL: user.photoURL || '',
        available: false,
        isActive: true,
        rating: 5.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to Firestore
      const driverRef = doc(db, 'drivers', user.uid);
      await setDoc(driverRef, driverData, { merge: true });

      // Send webhook (don't wait for response)
      fetch('https://hook.us1.make.com/jf2f7ipkfm91ap9np2ggvpp9iyxp1417', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...driverData,
          type: 'driver_registration',
          timestamp: new Date().toISOString()
        }),
      }).catch(error => {
        console.error('Webhook error:', error);
      });

      toast.success('Registration completed successfully!');

      // Force navigation to portal
      sessionStorage.setItem('isNewRegistration', 'true');
      window.location.href = '/driver/portal';
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to complete registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof RegistrationForm], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 25 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-[#C69249] text-4xl font-bold mb-4">Complete Your Profile</h1>
          <p className="text-neutral-400">Please provide your vehicle information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="locationId" className="block text-sm font-medium mb-2">
              Select Your Location
            </label>
            <select
              id="locationId"
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              className="w-full p-3 bg-white text-black rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Select a location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            type="tel"
            name="phone"
            placeholder="PHONE NUMBER"
            value={formData.phone}
            onChange={handleChange}
            required
            className="bg-white text-black"
            disabled={isSubmitting}
          />

          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-black mb-4">Vehicle Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="vehicle.make" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Make
                </label>
                <select
                  id="vehicle.make"
                  name="vehicle.make"
                  value={formData.vehicle.make}
                  onChange={handleChange}
                  className="w-full p-3 bg-neutral-100 text-black rounded-lg"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a make</option>
                  {vehicleMakes.map(make => (
                    <option key={make.name} value={make.name}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vehicle.model" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Model
                </label>
                <select
                  id="vehicle.model"
                  name="vehicle.model"
                  value={formData.vehicle.model}
                  onChange={handleChange}
                  className="w-full p-3 bg-neutral-100 text-black rounded-lg"
                  required
                  disabled={isSubmitting || !formData.vehicle.make}
                >
                  <option value="">Select a model</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vehicle.year" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Year
                </label>
                <select
                  id="vehicle.year"
                  name="vehicle.year"
                  value={formData.vehicle.year}
                  onChange={handleChange}
                  className="w-full p-3 bg-neutral-100 text-black rounded-lg"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vehicle.color" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Color
                </label>
                <select
                  id="vehicle.color"
                  name="vehicle.color"
                  value={formData.vehicle.color}
                  onChange={handleChange}
                  className="w-full p-3 bg-neutral-100 text-black rounded-lg"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a color</option>
                  {vehicleColors.map(color => (
                    <option key={color.name} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                type="text"
                name="vehicle.plate"
                placeholder="LICENSE PLATE"
                value={formData.vehicle.plate}
                onChange={handleChange}
                required
                className="bg-neutral-100 text-black"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C69249] text-white py-3 rounded-lg hover:bg-[#B68239] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
          </button>
        </form>
      </main>
    </div>
  );
}
