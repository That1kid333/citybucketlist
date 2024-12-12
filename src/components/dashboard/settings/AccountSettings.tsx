import React, { useRef } from 'react';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { Driver, Rider } from '../../../types';
import { uploadToCloudinary } from '../../../lib/utils/cloudinaryUpload';
import { toast } from 'react-hot-toast';

interface AccountSettingsProps {
  user: Driver | Rider;
  userType: 'driver' | 'rider';
  onUpdate: (updates: Partial<Driver | Rider>) => void;
}

export function AccountSettings({ user, userType, onUpdate }: AccountSettingsProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    locationId: user.locationId || '',
    photoURL: user.photoURL || ''
  });
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const photoURL = await uploadToCloudinary(file);
      
      // Update the user profile with new photo URL
      await onUpdate({ photoURL });
      
      toast.success('Profile photo updated successfully', { id: toastId });
      
      // Update local form data
      setFormData(prev => ({
        ...prev,
        photoURL
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Account Information</h2>
      
      {/* Profile Image */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800">
            {formData.photoURL ? (
              <img
                src={formData.photoURL}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://via.placeholder.com/200?text=User';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-neutral-500" />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 p-2 bg-[#F5A623] rounded-full hover:bg-[#E09612] transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        {isUploading && (
          <span className="text-sm text-neutral-400">Uploading...</span>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Full Name</label>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 bg-neutral-800 px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Email Address</label>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-neutral-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="flex-1 bg-neutral-800 px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Phone Number</label>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-neutral-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="flex-1 bg-neutral-800 px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Location</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={formData.locationId}
                onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                className="flex-1 bg-neutral-800 px-3 py-2 rounded-lg"
                placeholder="Enter your location"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-neutral-500" />
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-neutral-400">Full Name</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-neutral-500" />
            <div>
              <div className="font-medium">{user.email}</div>
              <div className="text-sm text-neutral-400">Email Address</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-neutral-500" />
            <div>
              <div className="font-medium">{user.phone || 'Not specified'}</div>
              <div className="text-sm text-neutral-400">Phone Number</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-neutral-500" />
            <div>
              <div className="font-medium">{user.locationId || 'Not specified'}</div>
              <div className="text-sm text-neutral-400">Location</div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
          >
            Edit Information
          </button>
        </div>
      )}
    </div>
  );
}