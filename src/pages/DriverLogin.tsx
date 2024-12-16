import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { FormInput } from '../components/FormInput';
import { PasswordReset } from '../components/PasswordReset';
import { loginDriver, signInWithGoogle, handleRedirectResult } from '../services/auth';
import { loginSchema } from '../lib/utils/validation';
import { Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { z } from 'zod'; // Import zod

function DriverLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Handle Google redirect result
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        console.log('Checking for Google sign-in redirect result');
        setIsLoading(true);
        const driver = await handleRedirectResult();
        
        if (driver) {
          console.log('Driver found from redirect:', driver);
          navigate('/driver/portal');
          toast.success('Successfully signed in with Google!');
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        const message = error instanceof Error ? error.message : 'Failed to complete Google sign-in';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    checkRedirectResult();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      // Note: Don't set isLoading to false here as we're redirecting
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      setError(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate form data
      const validatedData = loginSchema.parse(formData);

      // Attempt to log in
      const driver = await loginDriver(validatedData.email, validatedData.password);
      console.log('Login successful:', driver);
      
      navigate('/driver/portal');
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        const message = error.errors[0].message;
        setError(message);
        toast.error(message);
      } else {
        const message = error instanceof Error 
          ? error.message.includes('auth/user-not-found')
            ? 'No account found with this email. Please register first.'
            : error.message.includes('auth/wrong-password')
              ? 'Incorrect password. Please try again.'
              : error.message
          : 'Failed to log in';
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-neutral-900 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Driver Login</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={error}
              required
            />
            
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={error}
              required
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-[#C69249] hover:text-[#E5B980]"
              >
                Forgot password?
              </button>
              <Link to="/driver/register" className="text-sm text-[#C69249] hover:text-[#E5B980]">
                Sign up for an account
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-[#C69249] text-white rounded-md hover:bg-[#E5B980] focus:outline-none focus:ring-2 focus:ring-[#C69249] ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-black py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </main>
      
      {showPasswordReset && (
        <PasswordReset onClose={() => setShowPasswordReset(false)} />
      )}
    </div>
  );
}

export default DriverLogin;