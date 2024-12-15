import { AccountSettings } from './settings/AccountSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { Driver } from '../../types/driver';
import { Rider } from '../../types/rider';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

interface SettingsProps {
  user: Driver | Rider;
  userType: 'driver' | 'rider';
}

export default function Settings({ user, userType }: SettingsProps) {
  const handleUpdate = async (updates: Partial<Driver | Rider>) => {
    try {
      if (!user?.id) {
        throw new Error('User ID is required');
      }

      const userRef = doc(db, userType === 'driver' ? 'drivers' : 'riders', user.id);
      
      await updateDoc(userRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });

      toast.success('Settings updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
      return false;
    }
  };

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <div className="space-y-6">
        <AccountSettings 
          user={user}
          userType={userType}
          onUpdate={handleUpdate}
        />
        <SecuritySettings 
          user={user}
          userType={userType}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}