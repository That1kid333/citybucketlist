import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './providers/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import BookingPage from './pages/BookingPage';
import DriverPortal from './pages/DriverPortal';
import RiderPortal from './pages/RiderPortal';
import DriverLogin from './pages/DriverLogin';
import RiderLogin from './pages/RiderLogin';
import DriverRegistration from './pages/DriverRegistration';
import RiderRegistration from './pages/RiderRegistration';
import RidesManagement from './components/dashboard/RidesManagement';
import Settings from './components/dashboard/Settings';
import ScheduleManager from './components/dashboard/ScheduleManager';
import CommunicationHub from './components/dashboard/CommunicationHub';
import SavedRiders from './components/dashboard/SavedRiders';
import Membership from './components/dashboard/Membership';
import Overview from './components/dashboard/Overview';
import ThankYou from './pages/ThankYou';
import RideConfirmation from './pages/mobile/RideConfirmation';
import RideRequestConfirmation from './pages/mobile/RideRequestConfirmation';
import RiderSchedule from './pages/mobile/RiderSchedule';
import MobileManagedRidersPage from './pages/mobile/MobileManagedRidersPage';
import { MobileSchedulePage } from './pages/mobile/MobileSchedulePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-black">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<BookingPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/ride-confirmation" element={<RideConfirmation />} />
            <Route path="/ride-request-confirmation" element={<RideRequestConfirmation />} />

            {/* Driver Routes */}
            <Route path="/driver/login" element={<DriverLogin />} />
            <Route path="/driver/register" element={<DriverRegistration mode="create" />} />
            <Route path="/driver" element={<Navigate to="/driver/portal/overview" replace />} />
            <Route
              path="/driver/portal/*"
              element={
                <ProtectedRoute userType="driver">
                  <DriverPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/portal/settings"
              element={
                <ProtectedRoute userType="driver">
                  <DriverPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/portal/managed-riders"
              element={
                <ProtectedRoute userType="driver">
                  <MobileManagedRidersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/portal/schedule"
              element={
                <ProtectedRoute userType="driver">
                  <MobileSchedulePage />
                </ProtectedRoute>
              }
            />

            {/* Rider Routes */}
            <Route path="/rider/login" element={<RiderLogin />} />
            <Route path="/rider/register" element={<RiderRegistration />} />
            <Route path="/rider" element={<Navigate to="/rider/portal/overview" replace />} />
            <Route
              path="/rider/portal/*"
              element={
                <ProtectedRoute userType="rider">
                  <RiderPortal />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/rider/portal/schedule" 
              element={
                <ProtectedRoute userType="rider">
                  <MobileSchedulePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rider/schedule" 
              element={
                <ProtectedRoute userType="rider">
                  <RiderSchedule />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;