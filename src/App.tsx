import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';
import { EarningsDashboard } from './pages/dashboard/EarningsDashboard';
import { ThankYouPage } from './pages/ThankYouPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ManageRiders } from './pages/ManageRiders';
import { GoogleAuthCallback } from './components/GoogleAuthCallback';
import { Messages } from './components/messages/Messages';

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
    path: "/find-drivers",
    element: (
      <ProtectedRoute requiresRider={true}>
        <FindDrivers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/login",
    element: <DriverLogin />,
  },
  {
    path: "/rider/login",
    element: <RiderLogin />,
  },
  {
    path: "/driver/signup",
    element: <DriverSignup />,
  },
  {
    path: "/driver/registration",
    element: (
      <ProtectedRoute>
        <DriverRegistration />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/portal",
    element: (
      <ProtectedRoute requiresDriver={true}>
        <DriverPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/portal/*",
    element: (
      <ProtectedRoute requiresDriver={true}>
        <DriverPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/rider/portal/*",
    element: (
      <ProtectedRoute requiresRider={true}>
        <RiderPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/tutorial",
    element: (
      <ProtectedRoute requiresDriver={true}>
        <DriverTutorialPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/onboarding",
    element: (
      <ProtectedRoute requiresDriver={true}>
        <OnboardingFlow />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/earnings",
    element: (
      <ProtectedRoute requiresDriver={true}>
        <EarningsDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/riders",
    element: (
      <ProtectedRoute requiresDriver={true}>
        <ManageRiders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/messages",
    element: (
      <ProtectedRoute requiresDriver={true}>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth/google/callback",
    element: <GoogleAuthCallback />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_prependBasename: true
  }
});

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}