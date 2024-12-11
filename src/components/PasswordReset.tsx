import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FormInput } from './FormInput';

interface PasswordResetProps {
  onClose: () => void;
}

export function PasswordReset({ onClose }: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-[#C69249] mb-4">Reset Password</h2>
        
        {success ? (
          <div className="space-y-4">
            <p className="text-green-400">
              Password reset email sent! Check your inbox for further instructions.
            </p>
            <button
              onClick={onClose}
              className="w-full p-3 bg-[#C69249] text-white rounded-lg hover:bg-[#B58238] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-neutral-400">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            <FormInput
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white text-black"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 p-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 p-3 bg-[#C69249] text-white rounded-lg hover:bg-[#B58238] transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
