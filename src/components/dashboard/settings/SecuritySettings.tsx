import React from 'react';
import { Lock, Shield, Smartphone, ChevronRight } from 'lucide-react';
import { Driver, Rider } from '../../../types';
import { auth } from '../../../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface SecuritySettingsProps {
  user: Driver | Rider;
  userType: 'driver' | 'rider';
  onUpdate: (updates: Partial<Driver | Rider>) => void;
}

export function SecuritySettings({ user, userType, onUpdate }: SecuritySettingsProps) {
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);
  const [password, setPassword] = React.useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      if (password.new !== password.confirm) {
        throw new Error('New passwords do not match');
      }

      if (password.new.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      await updatePassword(auth.currentUser, password.new);
      toast.success('Password updated successfully');
      setShowPasswordForm(false);
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

      {showPasswordForm ? (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Current Password</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
              className="w-full bg-neutral-800 px-3 py-2 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C69249]"
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-400">New Password</label>
            <input
              type="password"
              value={password.new}
              onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
              className="w-full bg-neutral-800 px-3 py-2 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C69249]"
              placeholder="Enter new password"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Confirm New Password</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
              className="w-full bg-neutral-800 px-3 py-2 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#C69249]"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-[#C69249] text-white rounded-lg hover:bg-[#B58239] transition-colors"
            >
              Update Password
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(false);
                setPassword({ current: '', new: '', confirm: '' });
              }}
              className="w-full sm:w-auto px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setShowPasswordForm(true)}
            className="w-full flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-neutral-500" />
              <span>Change Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500" />
          </button>

          <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-neutral-500" />
              <div>
                <span className="block">Two-Factor Authentication</span>
                <span className="text-sm text-neutral-500">Add an extra layer of security</span>
              </div>
            </div>
            <button className="px-3 py-1 text-sm bg-neutral-700 rounded-lg">Coming Soon</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-neutral-500" />
              <div>
                <span className="block">Connected Devices</span>
                <span className="text-sm text-neutral-500">Manage your active sessions</span>
              </div>
            </div>
            <button className="px-3 py-1 text-sm bg-neutral-700 rounded-lg">Coming Soon</button>
          </div>
        </div>
      )}
    </div>
  );
}