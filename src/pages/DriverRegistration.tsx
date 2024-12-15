import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface DriverRegistrationProps {
  mode?: 'create' | 'edit';
}

export default function DriverRegistration({ mode = 'create' }: DriverRegistrationProps) {
  const { user, driver, loading, refreshDriverData } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && driver) {
      setFormData({
        phone: driver.phone || '',
        vehicle: {
          make: driver.vehicle.make || '',
          model: driver.vehicle.model || '',
          year: driver.vehicle.year || '',
          color: driver.vehicle.color || '',
          plate: driver.vehicle.plate || ''
        },
        locationId: driver.locationId || '',
        username: driver.username || '',
        photo: null
      });
    }
  }, [mode, driver]);

  useEffect(() => {
    if (formData.vehicle.make) {
      const models = getModelsByMake(formData.vehicle.make);
      setAvailableModels(models);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      let photoURL = '';
      if (selectedFile) {
        photoURL = await uploadToCloudinary(selectedFile);
      }

      const driverData = {
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

      const driverRef = doc(db, 'drivers', user.uid);
      const driverDoc = await getDoc(driverRef);
      await setDoc(driverRef, driverData, { merge: true });

      await refreshDriverData();
      toast.success(mode === 'create' ? 'Registration successful!' : 'Profile updated successfully!');
      
      if (mode === 'create') {
        navigate('/driver/portal');
      } else {
        navigate('/driver/portal');
      }
    } catch (error) {
      console.error('Error registering driver:', error);
      toast.error('Failed to save driver information');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            {mode === 'create' ? 'Driver Registration' : 'Edit Profile'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {mode === 'create' 
              ? 'Complete your profile to start accepting rides' 
              : 'Update your driver profile information'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
              placeholder="+1 (555) 555-5555"
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
                  {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(year => (
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

            <div>
              <label htmlFor="vehicle.plate" className="block text-sm font-medium mb-2">
                License Plate
              </label>
              <input
                type="text"
                id="vehicle.plate"
                name="vehicle.plate"
                value={formData.vehicle.plate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                placeholder="Enter license plate number"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C69249] hover:bg-[#B37F3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C69249]"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
              ) : (
                mode === 'create' ? 'Complete Registration' : 'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
