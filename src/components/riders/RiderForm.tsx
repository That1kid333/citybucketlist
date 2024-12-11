import React, { useState } from 'react';
import { FormInput } from '../FormInput';
import { RiderFormData, riderSchema } from '../../types/rider';
import { toast } from 'react-hot-toast';

interface RiderFormProps {
  onSubmit: (data: RiderFormData) => Promise<void>;
  initialData?: Partial<RiderFormData>;
  isEditing?: boolean;
}

export function RiderForm({ onSubmit, initialData, isEditing = false }: RiderFormProps) {
  const [formData, setFormData] = useState<RiderFormData>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    pickupAddress: initialData?.pickupAddress || '',
    dropoffAddress: initialData?.dropoffAddress || '',
    notes: initialData?.notes || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);

      // Validate form data
      const validatedData = riderSchema.parse(formData);
      await onSubmit(validatedData);
      
      toast.success(`Rider successfully ${isEditing ? 'updated' : 'added'}!`);
      
      if (!isEditing) {
        // Clear form if not editing
        setFormData({
          name: '',
          phone: '',
          email: '',
          pickupAddress: '',
          dropoffAddress: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Form error:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit form';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      
      <FormInput
        label="Phone"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      
      <FormInput
        label="Pickup Address"
        name="pickupAddress"
        value={formData.pickupAddress}
        onChange={handleChange}
      />
      
      <FormInput
        label="Dropoff Address"
        name="dropoffAddress"
        value={formData.dropoffAddress}
        onChange={handleChange}
      />
      
      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-200">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-[#C69249] focus:border-transparent"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#C69249] text-white py-3 px-4 rounded-lg hover:bg-[#A77841] transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update Rider' : 'Add Rider'}
      </button>
    </form>
  );
}
