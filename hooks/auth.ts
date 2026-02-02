// hooks/useAuthCheck.js
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const useAuthCheck = (redirectIfLoggedIn = true) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsChecking(true);
      const authToken = await AsyncStorage.getItem("auth_token");
      
      if (authToken) {
        setIsLoggedIn(true);
        if (redirectIfLoggedIn) {
          router.replace("/(tabs)");
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedIn(false);
    } finally {
      setIsChecking(false);
    }
  };

  return { isChecking, isLoggedIn, checkAuth };
};