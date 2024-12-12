import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  `${window.location.origin}/auth/google/callback`
);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

export const handleAuthCallback = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  localStorage.setItem('googleCalendarTokens', JSON.stringify(tokens));
  return tokens;
};

export const addEventToCalendar = async (event: {
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
}) => {
  const tokens = localStorage.getItem('googleCalendarTokens');
  if (!tokens) {
    throw new Error('Not authenticated with Google Calendar');
  }

  oauth2Client.setCredentials(JSON.parse(tokens));
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    throw error;
  }
};

export const listEvents = async () => {
  const tokens = localStorage.getItem('googleCalendarTokens');
  if (!tokens) {
    throw new Error('Not authenticated with Google Calendar');
  }

  oauth2Client.setCredentials(JSON.parse(tokens));
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return response.data.items;
  } catch (error) {
    console.error('Error listing Google Calendar events:', error);
    throw error;
  }
};
