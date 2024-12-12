import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export const getAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', SCOPES.join(' '));
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');
  
  return url.toString();
};

export const handleAuthCallback = async (code: string) => {
  if (!code) {
    throw new Error('No authorization code found in URL');
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const redirectUri = `${window.location.origin}/auth/google/callback`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token');
  }

  const tokens = await tokenResponse.json();
  localStorage.setItem('googleCalendarTokens', JSON.stringify(tokens));
  return tokens;
};

export const addEventToCalendar = async (event: {
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
}) => {
  const tokensStr = localStorage.getItem('googleCalendarTokens');
  if (!tokensStr) {
    throw new Error('Not authenticated with Google Calendar');
  }

  const tokens = JSON.parse(tokensStr);
  let accessToken = tokens.access_token;

  // Check if token needs refresh
  if (tokens.expires_at && Date.now() >= tokens.expires_at) {
    const refreshedTokens = await refreshAccessToken(tokens.refresh_token);
    accessToken = refreshedTokens.access_token;
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
  const tokensStr = localStorage.getItem('googleCalendarTokens');
  if (!tokensStr) {
    throw new Error('Not authenticated with Google Calendar');
  }

  const tokens = JSON.parse(tokensStr);
  let accessToken = tokens.access_token;

  // Check if token needs refresh
  if (tokens.expires_at && Date.now() >= tokens.expires_at) {
    const refreshedTokens = await refreshAccessToken(tokens.refresh_token);
    accessToken = refreshedTokens.access_token;
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

async function refreshAccessToken(refreshToken: string) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const tokens = await response.json();
  tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
  
  // Update stored tokens
  const storedTokens = JSON.parse(localStorage.getItem('googleCalendarTokens') || '{}');
  const updatedTokens = { ...storedTokens, ...tokens };
  localStorage.setItem('googleCalendarTokens', JSON.stringify(updatedTokens));
  
  return updatedTokens;
}
