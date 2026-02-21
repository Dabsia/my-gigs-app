import { meetingApi } from '@/services/meetingApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// Query keys
export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (filters: object) => [...meetingKeys.lists(), filters] as const,
  details: () => [...meetingKeys.all, 'detail'] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
};

// Hook to get all meetings
export const useGetMeetings = (filters = {}) => {
  return useQuery({
    queryKey: meetingKeys.list(filters),
    queryFn: () => meetingApi.getMeetings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a meeting
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingData) => meetingApi.createMeeting(meetingData),
    onSuccess: (data) => {
      // Invalidate meetings list to refetch
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      
      Alert.alert(
        '✅ Success',
        'Meeting created successfully! Check your Google Calendar.',
        [{ text: 'OK' }]
      );
    },
    onError: (error) => {
      console.error('Create meeting error:', error);
      
      // Handle specific error types
      if (error.action === 'connect_google') {
        Alert.alert(
          'Google Account Required',
          'Please connect your Google account to create meetings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Connect', onPress: () => handleGoogleAuth() }
          ]
        );
      } else if (error.action === 'reconnect_google') {
        Alert.alert(
          'Google Auth Expired',
          'Your Google authentication has expired. Please reconnect.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reconnect', onPress: () => handleGoogleAuth() }
          ]
        );
      } else {
        Alert.alert(
          '❌ Error',
          error.message || 'Failed to create meeting. Please try again.'
        );
      }
    }
  });
};

// Hook to check Google auth status
export const useGoogleAuthStatus = () => {
  return useQuery({
    queryKey: ['googleAuthStatus'],
    queryFn: () => meetingApi.checkGoogleAuth(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
};

// Helper function to handle Google auth
const handleGoogleAuth = async () => {
  try {
    const response = await meetingApi.getGoogleAuthUrl();
    if (response.data?.authUrl) {
      // Open the auth URL in browser
      Linking.openURL(response.data.authUrl);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to initiate Google authentication');
  }
};