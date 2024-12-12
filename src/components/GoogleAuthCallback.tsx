import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { handleRedirectResult } from '../services/auth';
import { toast } from 'react-hot-toast';

export function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('Handling Google Auth callback...');
        const driver = await handleRedirectResult();
        
        if (driver) {
          console.log('Driver data:', driver);
          toast.success('Successfully signed in!');
          
          if (!driver.vehicle || !driver.phone) {
            console.log('Driver needs to complete registration');
            navigate('/driver/registration');
          } else {
            console.log('Driver fully registered, navigating to portal');
            navigate('/driver/portal');
          }
        } else {
          console.log('No redirect result found');
          navigate('/driver/login');
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        toast.error('Failed to complete sign-in');
        navigate('/driver/login');
      }
    };

    if (!user) {
      handleRedirect();
    } else {
      navigate('/driver/portal');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#C69249] mx-auto mb-4"></div>
        <p>Completing sign-in...</p>
      </div>
    </div>
  );
}
