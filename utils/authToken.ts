// utils/auth.js or similar
import { useAuth } from '@clerk/clerk-expo';

export const getClerkToken = async () => {
  try {
    const { getToken } = useAuth();
    const token = await getToken();
    console.log(token)
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};