import React from 'react';
import { Form, Input, DatePicker, Button, InputNumber } from 'antd';
import { addDoc, collection, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Users, FileText, User, Phone } from 'lucide-react';

const RideBookingForm = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      if (!auth.currentUser) {
        toast.error('Please log in to book a ride');
        return;
      }

      // Get rider details
      const riderDoc = await getDoc(doc(db, 'riders', auth.currentUser.uid));
      if (!riderDoc.exists()) {
        toast.error('Rider profile not found');
        return;
      }
      const riderData = riderDoc.data();

      const rideData = {
        riderId: auth.currentUser.uid,
        riderName: riderData.firstName + ' ' + riderData.lastName,
        riderPhone: riderData.phone,
        riderEmail: riderData.email,
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation,
        date: values.date.toDate(),
        passengers: values.passengers || 1,
        notes: values.notes || '',
        status: 'pending',
        created_at: Timestamp.now(),
      };

      // Validate required fields
      if (!rideData.pickupLocation || !rideData.dropoffLocation) {
        toast.error('Please fill in both pickup and dropoff locations');
        return;
      }

      if (!rideData.riderPhone) {
        toast.error('Please update your profile with a phone number');
        return;
      }

      await addDoc(collection(db, 'rides'), rideData);
      toast.success('Ride booked successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Failed to book ride. Please ensure all required fields are filled.');
    }
  };

  // Custom styles for form components
  const inputStyle = {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    color: '#ffffff',
    '&::placeholder': {
      color: '#71717a',
    },
    '&:hover': {
      borderColor: '#C69249',
    },
    '&:focus': {
      borderColor: '#C69249',
      boxShadow: '0 0 0 2px rgba(198, 146, 73, 0.2)',
    },
  };

  const labelStyle = "text-zinc-300 flex items-center gap-2 font-medium";

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="max-w-md mx-auto space-y-4"
    >
      <Form.Item
        label={
          <span className={labelStyle}>
            <MapPin className="w-4 h-4 text-[#C69249]" />
            Pickup Location
          </span>
        }
        name="pickupLocation"
        rules={[{ required: true, message: 'Please enter pickup location' }]}
      >
        <Input 
          style={inputStyle}
          className="hover:border-[#C69249] focus:border-[#C69249]" 
          placeholder="Enter pickup location"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className={labelStyle}>
            <MapPin className="w-4 h-4 text-[#C69249]" />
            Dropoff Location
          </span>
        }
        name="dropoffLocation"
        rules={[{ required: true, message: 'Please enter dropoff location' }]}
      >
        <Input 
          style={inputStyle}
          className="hover:border-[#C69249] focus:border-[#C69249]" 
          placeholder="Enter dropoff location"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className={labelStyle}>
            <Calendar className="w-4 h-4 text-[#C69249]" />
            Date and Time
          </span>
        }
        name="date"
        rules={[{ required: true, message: 'Please select a date and time' }]}
      >
        <DatePicker 
          style={inputStyle}
          className="w-full hover:border-[#C69249] focus:border-[#C69249]" 
          showTime 
          format="MMMM D, YYYY h:mm A"
          placeholder="Select date and time"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className={labelStyle}>
            <Users className="w-4 h-4 text-[#C69249]" />
            Number of Passengers
          </span>
        }
        name="passengers"
        initialValue={1}
        rules={[{ required: true, message: 'Please select number of passengers' }]}
      >
        <InputNumber 
          style={inputStyle}
          className="w-full hover:border-[#C69249] focus:border-[#C69249]" 
          min={1} 
          max={10}
          placeholder="Select number of passengers"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className={labelStyle}>
            <FileText className="w-4 h-4 text-[#C69249]" />
            Additional Notes
          </span>
        }
        name="notes"
      >
        <Input.TextArea 
          style={inputStyle}
          className="hover:border-[#C69249] focus:border-[#C69249]" 
          placeholder="Any special requests or notes?"
          rows={4}
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          className="w-full bg-[#C69249] hover:bg-[#B37F3D] border-none h-10 font-medium"
        >
          Book Ride
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RideBookingForm;
