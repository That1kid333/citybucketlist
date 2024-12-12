import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export const getAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'token');
  url.searchParams.append('scope', SCOPES.join(' '));
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');
  
  return url.toString();
};

export const handleAuthCallback = async () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found in URL');
  }
  
  localStorage.setItem('googleCalendarToken', accessToken);
  return accessToken;
};

export const addEventToCalendar = async (event: {
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
}) => {
  const accessToken = localStorage.getItem('googleCalendarToken');
  if (!accessToken) {
    throw new Error('Not authenticated with Google Calendar');
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error('Failed to add event to Google Calendar');
  }

  return response.json();
};

export const listEvents = async () => {
  const accessToken = localStorage.getItem('googleCalendarToken');
  if (!accessToken) {
    throw new Error('Not authenticated with Google Calendar');
  }

  const now = new Date().toISOString();
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.append('timeMin', now);
  url.searchParams.append('maxResults', '10');
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google Calendar events');
  }

  const data = await response.json();
  return data.items;
};
