import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from 'antd';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';

export default function RiderLogin() {
  const { user, rider, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && rider) {
      navigate('/rider/portal');
    }
  }, [user, rider, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-md mx-auto p-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-white">Rider Login</h1>
            <p className="text-zinc-400">
              Sign in to access your rider dashboard, book rides, and manage your preferences.
            </p>
            
            <Button
              icon={<FcGoogle className="w-5 h-5" />}
              onClick={handleGoogleSignIn}
              className="w-full h-12 flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-black font-medium rounded-lg"
            >
              <span>Continue with Google</span>
            </Button>

            <div className="text-sm text-zinc-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/rider/register')}
                className="text-[#C69249] hover:text-[#B58239]"
              >
                Register here
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
