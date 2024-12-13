import React from 'react';
import { Form, Input, DatePicker, Button, InputNumber } from 'antd';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import toast from 'react-hot-toast';

const RideBookingForm = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      if (!auth.currentUser) {
        toast.error('Please log in to book a ride');
        return;
      }

      const rideData = {
        riderId: auth.currentUser.uid,
        pickupLocation: values.pickupLocation || '',
        dropoffLocation: values.dropoffLocation || '',
        date: values.date.toDate(),
        passengers: values.passengers || 1,
        notes: values.notes || '',
        status: 'pending',
        created_at: Timestamp.now(),
      };

      await addDoc(collection(db, 'rides'), rideData);
      toast.success('Ride booked successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Failed to book ride');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="max-w-md mx-auto"
    >
      <Form.Item
        label={<span className="text-white">Pickup Location</span>}
        name="pickupLocation"
      >
        <Input 
          className="bg-zinc-700 border-zinc-600 text-white" 
          placeholder="Enter pickup location (optional)"
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-white">Dropoff Location</span>}
        name="dropoffLocation"
      >
        <Input 
          className="bg-zinc-700 border-zinc-600 text-white" 
          placeholder="Enter dropoff location (optional)"
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-white">Date</span>}
        name="date"
        rules={[{ required: true, message: 'Please select a date' }]}
      >
        <DatePicker 
          className="w-full bg-zinc-700 border-zinc-600 text-white" 
          showTime 
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-white">Number of Passengers</span>}
        name="passengers"
        initialValue={1}
      >
        <InputNumber 
          className="w-full bg-zinc-700 border-zinc-600 text-white" 
          min={1} 
          max={10}
        />
      </Form.Item>

      <Form.Item
        label={<span className="text-white">Additional Notes</span>}
        name="notes"
      >
        <Input.TextArea 
          className="bg-zinc-700 border-zinc-600 text-white" 
          placeholder="Any special requests or notes?"
          rows={4}
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          className="w-full bg-[#C69249] hover:bg-[#B27F3C] border-0"
        >
          Book Ride
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RideBookingForm;
