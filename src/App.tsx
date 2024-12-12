import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import BookingPage from './pages/BookingPage';
import DriversPage from './pages/DriversPage';
import DriverPortal from './pages/DriverPortal';
import RiderPortal from './pages/RiderPortal';
import DriverLogin from './pages/DriverLogin';
import RiderLogin from './pages/RiderLogin';
import DriverRegistration from './pages/DriverRegistration';
import DriverSignup from './pages/DriverSignup';
import DriverTutorialPage from './pages/DriverTutorialPage';
import FindDrivers from './pages/FindDrivers';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import { EarningsDashboard } from './pages/dashboard/EarningsDashboard';
import { ThankYouPage } from './pages/ThankYouPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ManageRiders } from './pages/ManageRiders';
import { GoogleAuthCallback } from './components/GoogleAuthCallback';
import { Messages } from './components/messages/Messages';

function MessagesRoute() {
  const { user, driver, rider } = useAuth();
  const userType = driver ? 'driver' : rider ? 'rider' : 'admin';
  
  return (
    <ProtectedRoute userType="any">
      <Messages user={user!} userType={userType} />
    </ProtectedRoute>
  );
}

const routes = [
  {
    path: "/",
    element: <BookingPage />,
  },
  {
    path: "/thank-you",
    element: <ThankYouPage />,
  },
  {
    path: "/drivers",
    element: <DriversPage />,
  },
  {
    path: "/driver/portal",
    element: (
      <ProtectedRoute userType="driver">
        <DriverPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/login",
    element: <DriverLogin />,
  },
  {
    path: "/driver/signup",
    element: <DriverSignup />,
  },
  {
    path: "/driver/registration",
    element: <DriverRegistration />,
  },
  {
    path: "/driver/onboarding",
    element: (
      <ProtectedRoute userType="driver">
        <OnboardingFlow />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/tutorial",
    element: (
      <ProtectedRoute userType="driver">
        <DriverTutorialPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/earnings",
    element: (
      <ProtectedRoute userType="driver">
        <EarningsDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/rider/portal",
    element: (
      <ProtectedRoute userType="rider">
        <RiderPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/rider/login",
    element: <RiderLogin />,
  },
  {
    path: "/find-drivers",
    element: <FindDrivers />,
  },
  {
    path: "/manage-riders",
    element: (
      <ProtectedRoute userType="admin">
        <ManageRiders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth/google/callback",
    element: <GoogleAuthCallback />,
  },
  {
    path: "/messages",
    element: <MessagesRoute />,
  },
];

const router = createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true,
  }
});

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}