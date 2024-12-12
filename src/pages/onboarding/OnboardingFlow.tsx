import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';
import { DocumentUpload } from '../../components/onboarding/DocumentUpload';
import { SubscriptionPlan } from '../../components/onboarding/SubscriptionPlan';
import { PersonalInfoForm } from '../../components/onboarding/PersonalInfoForm';
import { VehicleInfoForm } from '../../components/onboarding/VehicleInfoForm';
import { uploadFile, getStoragePath } from '../../lib/utils/storage';
import { Driver } from '../../types/driver';
import { useAuth } from '../../providers/AuthProvider';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

const STEPS = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic details and contact information'
  },
  {
    id: 'documents',
    title: 'Document Verification',
    description: 'Upload required documents and licenses'
  },
  {
    id: 'vehicle',
    title: 'Vehicle Information',
    description: 'Your vehicle details and documentation'
  },
  {
    id: 'subscription',
    title: 'Elite Membership',
    description: 'Choose your subscription plan'
  }
];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [driver, setDriver] = useState<Partial<Driver>>({
    id: user?.uid || '',
    name: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    isActive: true,
    available: false,
    rating: 5.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const handlePersonalInfo = async (data: Partial<Driver>) => {
    setDriver(prev => ({ ...prev, ...data }));
    setCurrentStep(1);
  };

  const handleDocuments = async (
    licenseFile: File,
    backgroundCheckFile: File
  ) => {
    try {
      // Upload driver's license
      const licensePath = getStoragePath('licenses', user?.uid || '', licenseFile.name);
      const licenseUrl = await uploadFile(licenseFile, licensePath);

      // Upload background check
      const backgroundPath = getStoragePath('background-checks', user?.uid || '', backgroundCheckFile.name);
      const backgroundUrl = await uploadFile(backgroundCheckFile, backgroundPath);

      setDriver(prev => ({
        ...prev,
        driversLicense: {
          number: '',
          expirationDate: new Date().toISOString(),
          documentUrl: licenseUrl
        },
        backgroundCheck: {
          status: 'pending',
          submissionDate: new Date().toISOString(),
          documentUrl: backgroundUrl
        }
      }));
      setCurrentStep(2);
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents. Please try again.');
    }
  };

  const handleVehicleInfo = async (vehicleData: Driver['vehicle']) => {
    if (!vehicleData) return;
    setDriver(prev => ({
      ...prev,
      vehicle: vehicleData
    }));
    setCurrentStep(3);
  };

  const handleSubscription = async (plan: string) => {
    try {
      const subscriptionData = {
        status: 'trial',
        plan: 'elite',
        startDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      } as const;

      setDriver(prev => ({
        ...prev,
        subscription: subscriptionData
      }));

      // Save complete driver data
      if (user?.uid) {
        const driverRef = doc(db, 'drivers', user.uid);
        await setDoc(driverRef, {
          ...driver,
          updated_at: new Date().toISOString()
        });
        toast.success('Registration completed successfully!');
        navigate('/driver/tutorial');
      }
    } catch (error) {
      console.error('Error saving driver data:', error);
      toast.error('Failed to complete registration. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoForm
            initialData={driver}
            onSubmit={handlePersonalInfo}
          />
        );
      case 1:
        return (
          <DocumentUpload
            onSubmit={handleDocuments}
            driverLicenseUrl={driver.driversLicense?.documentUrl}
            backgroundCheckUrl={driver.backgroundCheck?.documentUrl}
          />
        );
      case 2:
        return (
          <VehicleInfoForm
            initialData={driver.vehicle}
            onSubmit={handleVehicleInfo}
          />
        );
      case 3:
        return (
          <SubscriptionPlan
            onSubmit={handleSubscription}
          />
        );
      default:
        return null;
    }
  };

  const steps = [
    {
      id: 'profile',
      title: 'Personal Information',
      description: 'Basic details about you',
      completed: currentStep > 0,
      current: currentStep === 0
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'License and background check',
      completed: currentStep > 1,
      current: currentStep === 1
    },
    {
      id: 'vehicle',
      title: 'Vehicle Information',
      description: 'Your vehicle details',
      completed: currentStep > 2,
      current: currentStep === 2
    },
    {
      id: 'subscription',
      title: 'Subscription',
      description: 'Choose your plan',
      completed: currentStep > 3,
      current: currentStep === 3
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <OnboardingProgress
          steps={steps}
          currentStep={currentStep}
        />
        <div className="mt-8">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}