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
import RiderRegistration from './pages/RiderRegistration';
import DriverSignup from './pages/DriverSignup';
import DriverTutorialPage from './pages/DriverTutorialPage';
import FindDrivers from './pages/FindDrivers';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import { EarningsDashboard } from './pages/dashboard/EarningsDashboard';
import BookingConfirmation from './pages/BookingConfirmation';
import { ThankYouPage } from './pages/ThankYouPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ManageRiders } from './pages/ManageRiders';
import MembershipPage from './pages/MembershipPage';
import RiderMembershipPage from './pages/RiderMembershipPage';

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
      path: "/driver/login",
      element: <DriverLogin />,
    },
    {
      path: "/driver/register",
      element: <DriverRegistration />,
    },
    {
      path: "/driver/registration",
      element: <DriverRegistration />,
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
      path: "/membership",
      element: (
        <ProtectedRoute userType="driver">
          <MembershipPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/rider/membership",
      element: (
        <ProtectedRoute userType="rider">
          <RiderMembershipPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/rider/login",
      element: <RiderLogin />,
    },
    {
      path: "/rider/register",
      element: <RiderRegistration />,
    },
    {
      path: "/rider/portal/*",
      element: (
        <ProtectedRoute userType="rider">
          <RiderPortal />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <RiderPortal />
        },
        {
          path: "rides",
          element: <RiderPortal />
        },
        {
          path: "schedule",
          element: <RiderPortal />
        },
        {
          path: "messages",
          element: <RiderPortal />
        },
        {
          path: "settings",
          element: <RiderPortal />
        },
        {
          path: "membership",
          element: <RiderPortal />
        }
      ]
    },
    {
      path: "/driver-signup",
      element: <DriverSignup />,
    },
    {
      path: "/driver/signup",
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
      path: "/booking-confirmation",
      element: <BookingConfirmation />,
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
      v7_startTransition: true
    }
  }
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}

export default App;