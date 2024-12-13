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
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, photoURL: url }));
      onUpdate({ photoURL: url });
      toast.success('Profile picture updated successfully', { id: toastId });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Account Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg bg-[#C69249] text-white hover:bg-[#B58239] transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-800">
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
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#C69249] text-white hover:bg-[#B58239] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-4 h-4" />
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
          <div>
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
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-[#C69249] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-[#C69249] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-[#C69249] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Location ID
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                name="locationId"
                value={formData.locationId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, locationId: e.target.value }))
                }
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-[#C69249] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
          >
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
}