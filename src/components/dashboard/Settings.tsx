import { AccountSettings } from './settings/AccountSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { Driver } from '../../types/driver';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

interface SettingsProps {
  driver: Driver;
  onUpdate: (updates: Partial<Driver>) => void;
}

export function Settings({ driver, onUpdate }: SettingsProps) {
  const handleDriverUpdate = async (updates: Partial<Driver>) => {
    try {
      const updatedDriver = { ...driver, ...updates };
      
      // Update in Firebase
      await updateDoc(doc(db, 'drivers', driver.id), {
        ...updates,
        updated_at: new Date().toISOString()
      });

      // Update local state through parent component
      onUpdate(updatedDriver);
      
      // Update local storage with the complete driver object
      localStorage.setItem('currentDriver', JSON.stringify(updatedDriver));
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <AccountSettings driver={driver} onUpdate={handleDriverUpdate} />
      <SecuritySettings />
    </div>
  );
}