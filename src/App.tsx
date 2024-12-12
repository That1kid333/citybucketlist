import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './providers/AuthProvider';
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

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <BookingPage />,
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
      path: "/rider-portal",
      element: (
        <ProtectedRoute userType="rider">
          <RiderPortal />
        </ProtectedRoute>
      ),
    },
    {
      path: "/driver-login",
      element: <DriverLogin />,
    },
    {
      path: "/rider-login",
      element: <RiderLogin />,
    },
    {
      path: "/driver-registration",
      element: <DriverRegistration />,
    },
    {
      path: "/driver-signup",
      element: <DriverSignup />,
    },
    {
      path: "/driver-tutorial",
      element: <DriverTutorialPage />,
    },
    {
      path: "/find-drivers",
      element: <FindDrivers />,
    },
    {
      path: "/onboarding",
      element: <OnboardingFlow />,
    },
    {
      path: "/earnings",
      element: (
        <ProtectedRoute userType="driver">
          <EarningsDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/thank-you",
      element: <ThankYouPage />,
    },
    {
      path: "/manage-riders",
      element: (
        <ProtectedRoute userType="admin">
          <ManageRiders />
        </ProtectedRoute>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}