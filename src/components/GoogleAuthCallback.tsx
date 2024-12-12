import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { handleAuthCallback, handleRedirectResult } from '../services/auth';
import { toast } from 'react-hot-toast';

export function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('Handling Google Auth callback...');
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
          throw new Error('No authorization code found in URL');
        }

        // Get Google Calendar tokens
        const tokens = await handleAuthCallback(code);
        console.log('Google Calendar tokens received:', tokens);

        // Get or create driver profile
        const driver = await handleRedirectResult();
        console.log('Driver data:', driver);

        if (driver) {
          toast.success('Successfully signed in!');
          
          // Redirect based on profile completion
          if (!driver.vehicle || !driver.phone) {
            navigate('/onboarding');
          } else {
            navigate('/driver');
          }
        } else {
          toast.error('Failed to sign in');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error in Google Auth callback:', error);
        toast.error('Failed to authenticate with Google');
        navigate('/login');
      }
    };

    handleRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p className="text-neutral-400">Please wait while we complete the sign-in process.</p>
      </div>
    </div>
  );
}
