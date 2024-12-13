import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Form, Input, Button, message } from 'antd';
import { Rider } from '../types/rider';

const RiderRegistration: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // First check if email is already registered
      const { email, password, name, phone } = values;
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create rider profile in Firestore
      const riderData: Rider = {
        id: user.uid,
        email,
        name,
        phone,
        memberSince: new Date().toISOString(),
        totalRides: 0,
        averageRating: 0,
        status: 'active'
      };

      await setDoc(doc(db, 'riders', user.uid), riderData);
      
      message.success('Registration successful!');
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        message.error('This email is already registered. Please try logging in instead.');
      } else {
        message.error('Registration failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="rider_registration"
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input your name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Phone"
        name="phone"
        rules={[{ required: true, message: 'Please input your phone number!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: 'Please input your password!' },
          { min: 6, message: 'Password must be at least 6 characters!' }
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Register as Rider
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RiderRegistration;
