import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'react-hot-toast';
import { FormInput } from '../components/FormInput';
import { vehicleMakes, vehicleColors, getModelsByMake } from '../data/vehicles';
import { uploadToCloudinary } from '../lib/utils/cloudinaryUpload';
import { locations } from '../types/location';

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
  username: string;
  photo: File | null;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
  };
  locationId: string;
  available: boolean;
  isActive: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
}

export default function DriverRegistration() {
  const navigate = useNavigate();
  const { user, driver, loading, refreshDriverData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialState: RegistrationForm = {
    phone: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      color: '',
      plate: ''
    },
    locationId: '',
    username: '',
    photo: null
  };

  const [formData, setFormData] = useState<RegistrationForm>(initialState);

  useEffect(() => {
    // Only redirect if we've confirmed auth state and driver exists
    if (!loading && driver) {
      navigate('/driver/portal', { replace: true });
    }
  }, [loading, driver, navigate]);

  useEffect(() => {
    // Update available models when make changes
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

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C69249]" />
      </div>
    );
  }

  // Don't show the form if not logged in
  if (!user) {
    return null;
  }

  // Don't show the form if already a driver
  if (driver) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicle.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      photo: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to register as a driver');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoURL = '';
      if (selectedFile) {
        photoURL = await uploadToCloudinary(selectedFile);
      }

      const driverData: Driver = {
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        phone: formData.phone || '',
        photoURL: photoURL,
        vehicle: {
          make: formData.vehicle.make || '',
          model: formData.vehicle.model || '',
          year: formData.vehicle.year || '',
          color: formData.vehicle.color || '',
          plate: formData.vehicle.plate || ''
        },
        locationId: formData.locationId || '',
        available: false,
        isActive: true,
        rating: 5.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to Firestore
      const driverRef = doc(db, 'drivers', user.uid);
      await setDoc(driverRef, driverData);

      await refreshDriverData();
      toast.success('Registration successful!');
      navigate('/driver/portal', { replace: true });
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error(error.message || 'Failed to complete registration');
    } finally {
      setIsSubmitting(false);
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
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
            >
              <option value="">Select a location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}, {location.region}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 555-5555"
          />

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="photo" className="block text-sm font-medium mb-2">
              Profile Photo
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#C69249]">Vehicle Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vehicle.make" className="block text-sm font-medium mb-2">
                  Make
                </label>
                <select
                  id="vehicle.make"
                  name="vehicle.make"
                  value={formData.vehicle.make}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                >
                  <option value="">Select make</option>
                  {vehicleMakes.map(make => (
                    <option key={make.name} value={make.name}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vehicle.model" className="block text-sm font-medium mb-2">
                  Model
                </label>
                <select
                  id="vehicle.model"
                  name="vehicle.model"
                  value={formData.vehicle.model}
                  onChange={handleChange}
                  disabled={!formData.vehicle.make}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                >
                  <option value="">Select model</option>
                  {availableModels.map((model, index) => (
                    <option key={`${model}-${index}`} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vehicle.year" className="block text-sm font-medium mb-2">
                  Year
                </label>
                <select
                  id="vehicle.year"
                  name="vehicle.year"
                  value={formData.vehicle.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                >
                  <option value="">Select year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vehicle.color" className="block text-sm font-medium mb-2">
                  Color
                </label>
                <select
                  id="vehicle.color"
                  name="vehicle.color"
                  value={formData.vehicle.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                >
                  <option value="">Select color</option>
                  {vehicleColors.map(color => (
                    <option key={color.name} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FormInput
              label="License Plate"
              name="vehicle.plate"
              value={formData.vehicle.plate}
              onChange={handleChange}
              placeholder="Enter license plate number"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#C69249] text-white font-semibold rounded-md hover:bg-[#B58239] focus:outline-none focus:ring-2 focus:ring-[#C69249] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
          </button>
        </form>
      </main>
    </div>
  );
}
