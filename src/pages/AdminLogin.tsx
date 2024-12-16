import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdTokenResult();
      
      if (token.claims.admin) {
        toast.success('Welcome back, admin!');
        navigate('/admin/drivers');
      } else {
        toast.error('This account does not have admin privileges');
        await auth.signOut();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#C69249] text-white py-2 px-4 rounded hover:bg-[#B58239]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
