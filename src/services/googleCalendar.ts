import { google } from 'googleapis';
import type { calendar_v3 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const oauth2Client = new google.auth.OAuth2(
  import.meta.env.VITE_GOOGLE_CLIENT_ID,
  import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  `${window.location.origin}/auth/google/callback`
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

interface GoogleTokens {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export const getAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

export const handleAuthCallback = async (code: string): Promise<GoogleTokens> => {
  if (!code) {
    throw new Error('No authorization code provided');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Store tokens securely
    if (tokens.refresh_token) {
      localStorage.setItem('googleRefreshToken', tokens.refresh_token);
    }
    
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

export const addEventToCalendar = async (event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> => {
  try {
    const refreshToken = localStorage.getItem('googleRefreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    await refreshAccessToken();
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    throw error;
  }
};

export const listEvents = async (): Promise<calendar_v3.Schema$Event[]> => {
  try {
    const refreshToken = localStorage.getItem('googleRefreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    await refreshAccessToken();

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error listing events:', error);
    throw error;
  }
};

async function refreshAccessToken(): Promise<void> {
  try {
    const credentials = await oauth2Client.getCredentials();
    if (!credentials.refresh_token) {
      throw new Error('No refresh token available');
    }
    
    const { tokens } = await oauth2Client.refreshAccessToken();
    await oauth2Client.setCredentials(tokens);
    
    // Store the new tokens
    localStorage.setItem('googleTokens', JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || credentials.refresh_token,
      expiry_date: tokens.expiry_date,
    }));
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}
