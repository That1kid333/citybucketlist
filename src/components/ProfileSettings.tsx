import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { authService } from '../lib/services/auth.service';
import { Driver } from '../types/driver';

interface ProfileSettingsProps {
  driver: Driver;
  onUpdate: (updatedDriver: Driver) => void;
}

export function ProfileSettings({ driver, onUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(driver.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    try {
      const updates: { name?: string; photo?: File } = {};
      
      if (name !== driver.name) {
        updates.name = name;
      }

      if (fileInputRef.current?.files?.[0]) {
        updates.photo = fileInputRef.current.files[0];
      }

      if (Object.keys(updates).length > 0) {
        const updatedDriver = await authService.updateProfile(driver.id, updates);
        onUpdate(updatedDriver);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <img
              src={driver.photo || 'https://via.placeholder.com/100'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files?.[0]) {
                    // Preview could be added here if needed
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Change Photo
              </button>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUpdating}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isUpdating
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUpdating ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
