import React from 'react';
import { FormInput } from '../FormInput';
import { Driver } from '../../types/driver';
import { Camera } from 'lucide-react';

interface PersonalInfoFormProps {
  initialData?: Partial<Driver>;
  onSubmit: (data: Partial<Driver>) => Promise<void>;
}

export function PersonalInfoForm({ initialData = {}, onSubmit }: PersonalInfoFormProps) {
  const [formData, setFormData] = React.useState<Partial<Driver>>(initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof Driver, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Handle photo upload
      const photoUrl = await handlePhotoUpload(file);
      handleChange('photo', photoUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={formData.photo || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop'}
            alt="Profile"
            className="w-32 h-32 rounded-lg object-cover"
          />
          <label className="absolute bottom-2 right-2 p-2 bg-[#F5A623] rounded-full cursor-pointer hover:bg-[#E09612] transition-colors">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <FormInput
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        required
      />

      <FormInput
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        required
      />

      <FormInput
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        required
      />

      <FormInput
        label="Driver's License Number"
        type="text"
        value={formData.driversLicense?.number}
        onChange={(e) => handleChange('driversLicense', { ...formData.driversLicense, number: e.target.value })}
        required
      />

      <FormInput
        label="License Expiration Date"
        type="date"
        value={formData.driversLicense?.expirationDate?.split('T')[0]}
        onChange={(e) => handleChange('driversLicense', { ...formData.driversLicense, expirationDate: new Date(e.target.value).toISOString() })}
        required
      />
    </div>
  );
}