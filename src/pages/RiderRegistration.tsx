import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../providers/AuthProvider';
import { Header } from '../components/Header';

interface RiderFormData {
  name: string;
  email: string;
  phone: string;
}

export default function RiderRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RiderFormData) => {
    if (!user) {
      message.error('You must be logged in to register as a rider');
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'riders', user.uid), {
        id: user.uid,
        name: values.name,
        email: values.email,
        phone: values.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      message.success('Registration successful!');
      sessionStorage.setItem('isNewRegistration', 'true');
      navigate('/rider/portal');
    } catch (error) {
      console.error('Error registering rider:', error);
      message.error('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-md mx-auto p-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <h1 className="text-2xl font-bold text-white mb-6">Rider Registration</h1>
          <Form
            name="rider-registration"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-white">Full Name</span>}
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input 
                className="bg-zinc-800 border-zinc-700 text-white" 
                placeholder="Enter your full name" 
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-white">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                className="bg-zinc-800 border-zinc-700 text-white" 
                placeholder="Enter your email" 
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-white">Phone Number</span>}
              name="phone"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input 
                className="bg-zinc-800 border-zinc-700 text-white" 
                placeholder="Enter your phone number" 
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-[#C69249] hover:bg-[#B58239] border-none"
              >
                Register as Rider
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
