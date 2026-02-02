import React, { useEffect, useState } from "react";
import { View, Text, Image, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "@/components/Layout/Layout";
import GoogleAuthBtn from "@/components/GoogleAuthBtn/GoogleAuthBtn";
import { useFocusEffect } from "expo-router";

const Index = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  // Check auth status when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Also check when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkAuthStatus();
    }, [])
  );

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);

      // Check for auth token
      const authToken = await AsyncStorage.getItem("auth_token");

      if (authToken) {
        console.log("User is logged in, token found");
        setHasToken(true);

        router.replace("/(tabs)");
      } else {
        console.log("No auth token found, user is not logged in");
        setHasToken(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSubmit = () => {
    router.push("/auth/login");
  };

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Checking login status...</Text>
        </View>
      </Layout>
    );
  }

  // If user is already logged in but still on this screen,
  // show a message (though they should have been redirected)
  if (hasToken) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Redirecting to app...</Text>
          <Text
            className="text-blue-500 mt-4"
            onPress={() => router.replace("/(tabs)")}
          >
            Click here if not redirected
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View className="h-full py-12 flex-col justify-between">
        <View>
          <Image source={require("../assets/images/smallLivestorm.png")} />
          <View className="mt-8">
            <Text className="font-regular leading-[60px] text-[48px] ">
              Let's help you
              <Text className="text-primary font-textBold "> manage </Text>your
              freelance projects
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <GoogleAuthBtn handleSubmit={handleSubmit} />
        </View>
      </View>
    </Layout>
  );
};

export default Index;
