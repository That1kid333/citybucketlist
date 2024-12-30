import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import { uploadDriverPhoto } from '../lib/utils/storage';

interface Location {
  id: string;
  name: string;
  region: string;
}

const defaultLocations: Location[] = [
  { id: 'pittsburgh', name: 'Pittsburgh', region: 'Pennsylvania' },
  { id: 'swflorida', name: 'South West Florida', region: 'Florida' }
];

interface VehicleMake {
  name: string;
  models: string[];
}

const defaultVehicleMakes: VehicleMake[] = [
  { name: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'] },
  { name: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'] },
  { name: 'Ford', models: ['F-150', 'Escape', 'Explorer', 'Mustang', 'Edge'] },
  { name: 'Chevrolet', models: ['Silverado', 'Equinox', 'Malibu', 'Traverse', 'Tahoe'] },
  { name: 'Nissan', models: ['Altima', 'Rogue', 'Sentra', 'Maxima', 'Pathfinder'] },
  { name: 'Hyundai', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona'] },
  { name: 'Kia', models: ['Forte', 'Optima', 'Sportage', 'Sorento', 'Telluride'] },
  { name: 'Volkswagen', models: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'] },
  { name: 'BMW', models: ['3 Series', '5 Series', 'X3', 'X5', '7 Series'] },
  { name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'] }
];

const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};

interface FormData {
  email: string;
  password: string;
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

const initialFormData: FormData = {
  email: '',
  password: '',
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

export default function DriverRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations] = useState<Location[]>(defaultLocations);
  const [vehicleMakes] = useState<VehicleMake[]>(defaultVehicleMakes);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.password) {
        throw new Error('Password is required');
      }

      toast.loading('Creating your driver account...');
      
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Skip photo upload for now due to CORS issues
      const photoURL = '';
      
      // Create the driver document in Firestore
      const driverRef = doc(db, 'drivers', user.uid);
      const driverData = {
        id: user.uid,
        email: formData.email,
        phone: formData.phone,
        photoURL: photoURL,
        vehicle: {
          make: formData.vehicle.make,
          model: formData.vehicle.model,
          year: formData.vehicle.year,
          color: formData.vehicle.color,
          plate: formData.vehicle.plate
        },
        locationId: formData.locationId,
        username: formData.username,
        status: 'approved',
        type: 'driver',
        available: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(driverRef, driverData);
      toast.dismiss();

      toast.success('Registration successful!');
      navigate('/driver/portal');
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.dismiss();
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else if (error.message === 'Password is required') {
        toast.error('Password is required');
      } else {
        toast.error('Failed to register. Please try again.');
      }
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
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        e.target.value = '';
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        e.target.value = '';
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
    } else {
      setFormData(prev => ({ ...prev, photo: null }));
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Driver Registration</h2>
          <p className="mt-2 text-sm text-gray-400">Complete your profile to start accepting rides</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
            />
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
            />
          </div>

          {/* Phone field */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
            />
          </div>

          {/* Username field */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Vehicle Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Make */}
              <div>
                <label htmlFor="vehicle.make" className="block text-sm font-medium text-white mb-2">
                  Make
                </label>
                <select
                  id="vehicle.make"
                  name="vehicle.make"
                  required
                  value={formData.vehicle.make}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
                >
                  <option value="">Select make</option>
                  {vehicleMakes.map(make => (
                    <option key={make.name} value={make.name}>{make.name}</option>
                  ))}
                </select>
              </div>

              {/* Vehicle Model */}
              <div>
                <label htmlFor="vehicle.model" className="block text-sm font-medium text-white mb-2">
                  Model
                </label>
                <select
                  id="vehicle.model"
                  name="vehicle.model"
                  required
                  value={formData.vehicle.model}
                  onChange={handleChange}
                  disabled={!formData.vehicle.make}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white disabled:opacity-50"
                >
                  <option value="">Select model</option>
                  {formData.vehicle.make && vehicleMakes
                    .find(make => make.name === formData.vehicle.make)
                    ?.models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))
                  }
                </select>
              </div>

              {/* Vehicle Year */}
              <div>
                <label htmlFor="vehicle.year" className="block text-sm font-medium text-white mb-2">
                  Year
                </label>
                <input
                  type="text"
                  id="vehicle.year"
                  name="vehicle.year"
                  required
                  value={formData.vehicle.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
                  placeholder="e.g., 2020"
                />
              </div>

              {/* Vehicle Color */}
              <div>
                <label htmlFor="vehicle.color" className="block text-sm font-medium text-white mb-2">
                  Color
                </label>
                <input
                  type="text"
                  id="vehicle.color"
                  name="vehicle.color"
                  required
                  value={formData.vehicle.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
                  placeholder="e.g., Black"
                />
              </div>

              {/* Vehicle Plate */}
              <div>
                <label htmlFor="vehicle.plate" className="block text-sm font-medium text-white mb-2">
                  License Plate
                </label>
                <input
                  type="text"
                  id="vehicle.plate"
                  name="vehicle.plate"
                  required
                  value={formData.vehicle.plate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label htmlFor="locationId" className="block text-sm font-medium text-white mb-2">
              Select Your Location
            </label>
            <select
              id="locationId"
              name="locationId"
              required
              value={formData.locationId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C69249] text-white"
            >
              <option value="">Select a location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}, {location.region}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label htmlFor="photo" className="block text-sm font-medium text-white mb-2">
              Profile Photo (Optional)
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-white text-sm
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#C69249] file:text-white
                hover:file:bg-[#E5B980]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 bg-[#C69249] text-white rounded-md hover:bg-[#E5B980] focus:outline-none focus:ring-2 focus:ring-[#C69249] ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <img 
            src="https://aiautomationsstorage.blob.core.windows.net/cbl/CBL%20PRIVATE%20MEMBERHIP%20ASSOCIATION%20SEAL.png"
            alt="CBL Private Membership Association Seal"
            className="w-32 h-32 object-contain opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
