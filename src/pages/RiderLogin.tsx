import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Header } from '../components/Header';
import { useAuth } from '../providers/AuthProvider';

interface LoginFormData {
  email: string;
  password: string;
}

export default function RiderLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { refreshRiderData } = useAuth();

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // First sign in the user
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Then refresh rider data and wait for it
      const riderData = await refreshRiderData();
      
      if (riderData && riderData.id) {
        message.success('Login successful!');
        navigate('/rider/portal');
      } else {
        message.info('Please complete registration');
        navigate('/rider/register');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      message.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-md mx-auto p-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <h1 className="text-2xl font-bold text-white mb-6">Rider Login</h1>
          <Form
            name="rider-login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-white">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input className="bg-zinc-800 border-zinc-700 text-white" />
            </Form.Item>

            <Form.Item
              label={<span className="text-white">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password className="bg-zinc-800 border-zinc-700 text-white" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-[#C69249] hover:bg-[#B37F3D] border-none"
                loading={loading}
              >
                Log In
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <p className="text-zinc-400">
              Don't have an account?{' '}
              <Link to="/rider/register" className="text-[#C69249] hover:text-[#B37F3D]">
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
