import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Button, message } from 'antd';
import { Driver } from '../types/driver';
import { rideTransferService } from '../services/rideTransfer.service';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  currentDriverId: string;
}

interface TransferFormData {
  newDriverId: string;
  transferFee: number;
}

export function RideTransferModal({ isOpen, onClose, rideId, currentDriverId }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const loadAvailableDrivers = async () => {
      try {
        const driversQuery = query(
          collection(db, 'drivers'),
          where('available', '==', true),
          where('isActive', '==', true)
        );
        
        const querySnapshot = await getDocs(driversQuery);
        const drivers = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Driver))
          .filter(driver => driver.id !== currentDriverId); // Exclude current driver
        
        setAvailableDrivers(drivers);
      } catch (error) {
        console.error('Error loading available drivers:', error);
        message.error('Failed to load available drivers');
      }
    };

    if (isOpen) {
      loadAvailableDrivers();
    }
  }, [isOpen, currentDriverId]);

  const handleSubmit = async (values: TransferFormData) => {
    setLoading(true);
    try {
      await rideTransferService.createTransferRequest({
        rideId,
        originalDriverId: currentDriverId,
        newDriverId: values.newDriverId,
        transferFee: values.transferFee,
      });

      message.success('Transfer request sent successfully');
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error creating transfer request:', error);
      message.error('Failed to send transfer request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Transfer Ride"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className="bg-zinc-900"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ transferFee: 5 }}
      >
        <Form.Item
          label={<span className="text-white">Select Driver</span>}
          name="newDriverId"
          rules={[{ required: true, message: 'Please select a driver' }]}
        >
          <Select
            placeholder="Select a driver"
            className="bg-zinc-800 border-zinc-700 text-white"
          >
            {availableDrivers.map(driver => (
              <Select.Option key={driver.id} value={driver.id}>
                {driver.name} - {driver.vehicle.make} {driver.vehicle.model}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={<span className="text-white">Transfer Fee ($)</span>}
          name="transferFee"
          rules={[
            { required: true, message: 'Please enter a transfer fee' },
            { type: 'number', min: 0, message: 'Fee must be positive' }
          ]}
        >
          <InputNumber
            className="w-full bg-zinc-800 border-zinc-700 text-white"
            precision={2}
            step={1}
            min={0}
          />
        </Form.Item>

        <div className="flex justify-end space-x-4">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-[#C69249] hover:bg-[#B58239] border-none"
          >
            Send Transfer Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
