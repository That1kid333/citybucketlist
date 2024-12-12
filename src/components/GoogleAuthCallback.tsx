import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../services/googleCalendar';

export function GoogleAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code found in URL');
        }

        await handleAuthCallback(code);
        window.opener?.postMessage('google-calendar-success', window.location.origin);
        window.close();
      } catch (error) {
        console.error('Error processing Google Calendar auth:', error);
        window.opener?.postMessage('google-calendar-error', window.location.origin);
        window.close();
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Processing Google Calendar authentication...</p>
    </div>
  );
}
