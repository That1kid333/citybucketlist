import React, { useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { ProfileImage } from './ProfileImage';
import { VehicleInfo } from './VehicleInfo';
import { PricingSection } from './PricingSection';
import { SubscriptionBanner } from './SubscriptionBanner';
import { TrialBanner } from './TrialBanner';
import { Driver, initialDriver } from '../types/driver';
import { supabase } from '../lib/supabase';
import { isTrialAvailable, calculateTrialEndDate, calculateNextBillingDate } from '../utils/subscription';

export function ProfileSection() {
  const [profile, setProfile] = useState<Driver>(() => {
    const currentDriver = JSON.parse(localStorage.getItem('currentDriver') || '{}');
    return { ...initialDriver, ...currentDriver };
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}_profile_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('driver-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('driver-photos')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, photo: publicUrl }));
      
      // Update in localStorage
      const currentDriver = JSON.parse(localStorage.getItem('currentDriver') || '{}');
      localStorage.setItem('currentDriver', JSON.stringify({
        ...currentDriver,
        photo: publicUrl
      }));

      // Update in Supabase
      await supabase
        .from('drivers')
        .update({ photo: publicUrl })
        .eq('id', profile.id);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleStartTrial = async () => {
    try {
      const trialEndDate = calculateTrialEndDate();
      const nextBillingDate = calculateNextBillingDate(trialEndDate);

      const updatedProfile = {
        ...profile,
        subscription: {
          status: 'trial',
          plan: 'elite',
          startDate: new Date().toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          nextBillingDate: nextBillingDate.toISOString()
        }
      };

      setProfile(updatedProfile);
      localStorage.setItem('currentDriver', JSON.stringify(updatedProfile));

      await supabase
        .from('drivers')
        .update({ subscription: updatedProfile.subscription })
        .eq('id', profile.id);

    } catch (error) {
      console.error('Error starting trial:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const updatedProfile = {
        ...profile,
        subscription: {
          status: 'active',
          plan: 'elite',
          startDate: new Date().toISOString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      setProfile(updatedProfile);
      localStorage.setItem('currentDriver', JSON.stringify(updatedProfile));

      await supabase
        .from('drivers')
        .update({ subscription: updatedProfile.subscription })
        .eq('id', profile.id);

    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    
    // Update in localStorage
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    const updatedDrivers = drivers.map((d: Driver) => 
      d.id === profile.id ? { ...d, ...profile } : d
    );
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    localStorage.setItem('currentDriver', JSON.stringify(profile));

    // Update in Supabase
    try {
      await supabase
        .from('drivers')
        .update(profile)
        .eq('id', profile.id);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleVehicleChange = (field: keyof Driver['vehicle'], value: string) => {
    setProfile(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value
      }
    }));
  };

  const handleRateChange = (field: string, value: number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const showTrialBanner = isTrialAvailable() && 
    !profile.subscription?.status;

  const isSubscribed = profile.subscription?.status === 'active' || 
    profile.subscription?.status === 'trial';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showTrialBanner && (
        <TrialBanner
          onStartTrial={handleStartTrial}
          isTrialAvailable={true}
        />
      )}

      <div className="bg-neutral-900 rounded-lg p-6 space-y-6">
        <div className="flex items-start gap-6">
          <ProfileImage
            photo={profile.photo}
            isEditing={isEditing}
            onImageChange={handleImageUpload}
          />
          
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold bg-neutral-800 text-white px-2 py-1 rounded"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                )}
                <div className="flex items-center gap-2 text-[#F5A623] mt-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{profile.rating}</span>
                  <span className="text-neutral-400">({profile.metrics.totalRides} rides)</span>
                </div>
              </div>
              
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <VehicleInfo
                vehicle={profile.vehicle}
                isEditing={isEditing}
                onVehicleChange={handleVehicleChange}
              />
              
              <div className="flex items-center gap-2 text-neutral-300">
                <MapPin className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-neutral-800 px-2 py-1 rounded flex-1"
                    placeholder="Your location"
                  />
                ) : (
                  <span>{profile.location || 'Add your location'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <PricingSection
          baseRate={profile.baseRate || 0}
          airportRate={profile.airportRate || 0}
          longDistanceRate={profile.longDistanceRate || 0}
          isEditing={isEditing}
          onRateChange={handleRateChange}
        />
      </div>

      {!showTrialBanner && (
        <SubscriptionBanner
          onSubscribe={handleSubscribe}
          isSubscribed={isSubscribed}
        />
      )}
    </div>
  );
}