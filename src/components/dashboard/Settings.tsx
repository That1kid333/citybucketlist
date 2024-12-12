import { AccountSettings } from './settings/AccountSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { Driver } from '../../types/driver';
import { Rider } from '../../types/rider'; // Assuming Rider type is defined in this file
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

interface SettingsProps {
  user: Driver | Rider;
  userType: 'driver' | 'rider';
}

export function Settings({ user, userType }: SettingsProps) {
  const handleUpdate = async (updates: Partial<Driver | Rider>) => {
    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in Firebase
      await updateDoc(doc(db, `${userType}s`, user.id), {
        ...updates,
        updated_at: new Date().toISOString()
      });

      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="grid gap-8">
        <AccountSettings user={user} userType={userType} onUpdate={handleUpdate} />
        <SecuritySettings />
      </div>
    </div>
  );
}