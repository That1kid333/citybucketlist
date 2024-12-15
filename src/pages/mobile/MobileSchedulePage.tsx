import React from 'react';
import { MobileScheduleManager } from '../../components/mobile/MobileScheduleManager';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { MobileBottomNav } from '../../components/mobile/MobileBottomNav';
import { useAuth } from '../../providers/AuthProvider';
import { useLocation } from 'react-router-dom';

export function MobileSchedulePage() {
  const { user, userType, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-950">
      <MobileHeader
        userName={user?.displayName || ''}
        userPhoto={user?.photoURL || ''}
        onSignOut={signOut}
      />
      <div className="pt-16 pb-20">
        <MobileScheduleManager
          riderId={userType === 'rider' ? user?.uid : undefined}
          userType={userType || 'rider'}
        />
      </div>
      <MobileBottomNav
        userType={userType || 'rider'}
        currentView={location.pathname}
      />
    </div>
  );
}
