import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../providers/AuthProvider';

interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const RiderRegistration = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { refreshRiderData } = useAuth();

  const onFinish = async (values: RegistrationFormData) => {
    setLoading(true);
    try {
      if (values.password !== values.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Create rider profile with full name
      const riderData = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: `${values.firstName} ${values.lastName}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        membershipTier: 'basic',
        totalRides: 0,
        lastRideDate: null,
        type: 'rider' as const
      };

      await setDoc(doc(db, 'riders', userCredential.user.uid), riderData);

      // Wait for rider data to be loaded in context
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshRiderData();

      toast.success('Registration successful!');
      navigate('/rider/portal/overview');
    } catch (error: any) {
      console.error('Error registering rider:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email is already registered');
      } else {
        toast.error(error.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <Card 
        className="w-full max-w-md bg-zinc-800 shadow-xl border-0"
        title={
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Rider Registration</h2>
            <p className="text-zinc-400">Create your rider account</p>
          </div>
        }
      >
        <Form
          form={form}
          name="rider-registration"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="firstName"
            label={<span className="text-white">First Name</span>}
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input className="bg-zinc-800 border-zinc-700 text-white" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span className="text-white">Last Name</span>}
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input className="bg-zinc-800 border-zinc-700 text-white" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-white">Email</span>}
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input className="bg-zinc-800 border-zinc-700 text-white" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-white">Password</span>}
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password className="bg-zinc-800 border-zinc-700 text-white" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span className="text-white">Confirm Password</span>}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The passwords do not match'));
                },
              }),
            ]}
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
              Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RiderRegistration;
