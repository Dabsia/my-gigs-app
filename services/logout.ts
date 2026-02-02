// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '@/utils/react_query';

export const authService = {
  logout: async () => {
    try {
      // 1. Clear ALL AsyncStorage data related to user
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter keys to clear (keep app settings, preferences if needed)
      const keysToRemove = allKeys.filter(key => 
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') || 
        key.includes('client') || 
        key.includes('project') ||
        key === 'auth_token' ||
        key === 'user_data'
      );
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('Cleared storage keys:', keysToRemove);
      
      // 2. Clear React Query cache
      if (queryClient) {
        queryClient.clear();
        queryClient.removeQueries();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear essential items
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      return { success: true };
    }
  },
};