import React, { useRef } from 'react';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { Driver, Rider } from '../../../types';
import { uploadToCloudinary } from '../../../lib/utils/cloudinaryUpload';
import { toast } from 'react-hot-toast';

interface AccountSettingsProps {
  user: Driver | Rider;
  userType: 'driver' | 'rider';
  onUpdate: (updates: Partial<Driver | Rider>) => Promise<boolean>;
}

export function AccountSettings({ user, userType, onUpdate }: AccountSettingsProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    locationId: '',
    photoURL: ''
  });
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when user prop changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        locationId: user.locationId || '',
        photoURL: user.photoURL || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      const success = await onUpdate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        locationId: formData.locationId,
        photoURL: formData.photoURL
      });

      if (success) {
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
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
      const url = await uploadToCloudinary(file);
      if (url) {
        setFormData(prev => ({ ...prev, photoURL: url }));
        const success = await onUpdate({ photoURL: url });
        if (success) {
          toast.success('Profile picture updated successfully', { id: toastId });
        } else {
          throw new Error('Failed to update profile picture');
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-white">Account Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#C69249] text-white hover:bg-[#B58239] transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-800">
              {formData.photoURL ? (
                <img
                  src={formData.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-neutral-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isEditing || isUploading}
              className="absolute bottom-0 right-0 p-2 sm:p-1.5 rounded-full bg-[#C69249] text-white hover:bg-[#B58239] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={!isEditing || isUploading}
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-medium text-white">{formData.name}</h3>
            <p className="text-sm text-neutral-400 capitalize">{userType}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-neutral-800 pl-10 pr-3 py-2 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                placeholder="Enter your full name"
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-neutral-800 pl-10 pr-3 py-2 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                placeholder="Enter your email"
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-neutral-800 pl-10 pr-3 py-2 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C69249]"
                placeholder="Enter your phone number"
                disabled={!isEditing}
                required
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  photoURL: user.photoURL || ''
                });
              }}
              className="w-full sm:w-auto px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}