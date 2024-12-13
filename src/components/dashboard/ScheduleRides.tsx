import React, { useState } from 'react';
import { Card, DatePicker, TimePicker, Form, Input, Button, message } from 'antd';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { MapPin, Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';

interface ScheduleFormData {
  date: dayjs.Dayjs;
  time: dayjs.Dayjs;
  pickupLocation: string;
  dropoffLocation: string;
  notes: string;
}

export default function ScheduleRides() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ScheduleFormData) => {
    if (!user) {
      message.error('You must be logged in to schedule a ride');
      return;
    }

    setLoading(true);
    try {
      const datetime = values.date
        .hour(values.time.hour())
        .minute(values.time.minute());

      const rideData = {
        riderId: user.uid,
        date: Timestamp.fromDate(datetime.toDate()),
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation,
        notes: values.notes,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'rides'), rideData);
      message.success('Ride scheduled successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error scheduling ride:', error);
      message.error('Failed to schedule ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Schedule a Ride</h2>
      <Card className="bg-zinc-900 border-zinc-800">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={
                <span className="text-white flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date
                </span>
              }
              name="date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker
                className="w-full bg-zinc-800 border-zinc-700 text-white"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-white flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Time
                </span>
              }
              name="time"
              rules={[{ required: true, message: 'Please select a time' }]}
            >
              <TimePicker
                className="w-full bg-zinc-800 border-zinc-700 text-white"
                format="HH:mm"
                minuteStep={15}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={
              <span className="text-white flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Pickup Location
              </span>
            }
            name="pickupLocation"
            rules={[{ required: true, message: 'Please enter pickup location' }]}
          >
            <Input className="bg-zinc-800 border-zinc-700 text-white" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-white flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Dropoff Location
              </span>
            }
            name="dropoffLocation"
            rules={[{ required: true, message: 'Please enter dropoff location' }]}
          >
            <Input className="bg-zinc-800 border-zinc-700 text-white" />
          </Form.Item>

          <Form.Item
            label={<span className="text-white">Additional Notes</span>}
            name="notes"
          >
            <Input.TextArea
              className="bg-zinc-800 border-zinc-700 text-white"
              rows={4}
              placeholder="Any special instructions or requirements?"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-[#C69249] hover:bg-[#B37F3D] border-none"
            >
              Schedule Ride
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
