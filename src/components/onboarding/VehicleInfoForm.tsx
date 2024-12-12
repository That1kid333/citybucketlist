import React from 'react';
import { FormInput } from '../FormInput';
import { Driver } from '../../types/driver';

interface VehicleInfoFormProps {
  initialData?: {
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
    insurance?: {
      provider: string;
      policyNumber: string;
      expirationDate: string;
      documentUrl: string;
    };
    registration?: {
      expirationDate: string;
      documentUrl: string;
    };
  };
  onSubmit: (vehicleData: Driver['vehicle']) => Promise<void>;
}

export function VehicleInfoForm({ initialData = {}, onSubmit }: VehicleInfoFormProps) {
  const [formData, setFormData] = React.useState(initialData);
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

  const handleVehicleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInsuranceChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Make"
            type="text"
            value={formData.make}
            onChange={(e) => handleVehicleChange('make', e.target.value)}
            required
          />

          <FormInput
            label="Model"
            type="text"
            value={formData.model}
            onChange={(e) => handleVehicleChange('model', e.target.value)}
            required
          />

          <FormInput
            label="Year"
            type="text"
            pattern="\d{4}"
            value={formData.year}
            onChange={(e) => handleVehicleChange('year', e.target.value)}
            required
          />

          <FormInput
            label="Color"
            type="text"
            value={formData.color}
            onChange={(e) => handleVehicleChange('color', e.target.value)}
            required
          />

          <FormInput
            label="License Plate"
            type="text"
            value={formData.plate}
            onChange={(e) => handleVehicleChange('plate', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
        <div className="space-y-4">
          <FormInput
            label="Insurance Provider"
            type="text"
            value={formData.insurance?.provider}
            onChange={(e) => handleInsuranceChange('provider', e.target.value)}
            required
          />

          <FormInput
            label="Policy Number"
            type="text"
            value={formData.insurance?.policyNumber}
            onChange={(e) => handleInsuranceChange('policyNumber', e.target.value)}
            required
          />

          <FormInput
            label="Expiration Date"
            type="date"
            value={formData.insurance?.expirationDate?.split('T')[0]}
            onChange={(e) => handleInsuranceChange('expirationDate', new Date(e.target.value).toISOString())}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}