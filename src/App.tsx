import React from 'react';
import { createBrowserRouter, RouterProvider, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './providers/AuthProvider';
import BookingPage from './pages/BookingPage';
import DriversPage from './pages/DriversPage';
import DriverPortal from './pages/DriverPortal';
import DriverLogin from './pages/DriverLogin';
import DriverSignup from './pages/DriverSignup';
import DriverRegistration from './pages/DriverRegistration';
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
      <ProtectedRoute>
        <FindDrivers />
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
    path: "/driver/register",
    element: (
      <ProtectedRoute>
        <DriverRegistration />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/portal",
    element: (
      <ProtectedRoute>
        <DriverPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/tutorial",
    element: (
      <ProtectedRoute>
        <DriverTutorialPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingFlow />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/earnings",
    element: (
      <ProtectedRoute>
        <EarningsDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/riders",
    element: (
      <ProtectedRoute>
        <ManageRiders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/driver/messages",
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth/google/callback",
    element: <GoogleAuthCallback />,
  },
];

function App() {
  const router = createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
    }
  });

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;