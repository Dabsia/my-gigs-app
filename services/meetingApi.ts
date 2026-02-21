import { getClerkToken } from '@/utils/authToken';
import { API_BASE_URL } from '@/utils/config';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL ,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  // Get your auth token from Clerk or your auth system
  const token = await getClerkToken(); // Implement this based on your auth
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const meetingApi = {
  // Create a new meeting
  createMeeting: async (meetingData) => {
    try {
      // Format the data to match your backend expectations
      const payload = {
        title: meetingData.topic,
        description: meetingData.agenda || '',
        startTime: meetingData.startTime.toISOString(),
        duration: meetingData.duration,
        clientEmail: meetingData.clientEmail,
        additionalParticipants: meetingData.additionalParticipants 
          ? meetingData.additionalParticipants
              .split(',')
              .map(email => ({ 
                email: email.trim()
              }))
              .filter(p => p.email.includes('@'))
          : [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sendInvites: true
      };

      // Add optional IDs if they exist
      if (meetingData.projectId) payload.projectId = meetingData.projectId;
      if (meetingData.clientId) payload.clientId = meetingData.clientId;

      const response = await api.post('/meetings', payload);
      return response.data;
    } catch (error) {
      console.error('Create meeting error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get all meetings
  getMeetings: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/meetings?${queryParams}` : '/meetings';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get meetings error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Check Google auth status
  checkGoogleAuth: async () => {
    try {
      const response = await api.get('/meetings/auth/status');
      return response.data;
    } catch (error) {
      console.error('Check Google auth error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get Google auth URL
  getGoogleAuthUrl: async () => {
    try {
      const response = await api.get('/meetings/auth/google');
      return response.data;
    } catch (error) {
      console.error('Get Google auth URL error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};