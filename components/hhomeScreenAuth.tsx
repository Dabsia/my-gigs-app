import React, { useEffect, useState } from "react";
import { View, Text, Image, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "@/components/Layout/Layout";
import GoogleAuthBtn from "@/components/GoogleAuthBtn/GoogleAuthBtn";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const Index = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   // expoClientId:
  //   //   "483734584452-0ftjtogr6jv93bharckdts0vg4v53tgv.apps.googleusercontent.com", // Web client ID
  //   iosClientId:
  //     "483734584452-3e8291sq8gikjf1f8fe1tuar4bis9fvu.apps.googleusercontent.com",
  //   androidClientId:
  //     "483734584452-6u5b7tuo8qgaknr9l4f14ps0j72rqiaj.apps.googleusercontent.com",
  //   webClientId:
  //     "483734584452-vp06gd5j738okgjvj42o5nf8004157gq.apps.googleusercontent.com",
  //   scopes: ["profile", "email"],
  //   redirectUri: AuthSession.makeRedirectUri(),
  // });

  // Handle response
  // useEffect(() => {
  //   if (response?.type === "success") {
  //     const { authentication } = response;
  //     if (authentication?.accessToken) {
  //       // Save token to AsyncStorage
  //       AsyncStorage.setItem("google_token", authentication.accessToken);
  //       fetchUserInfo(authentication.accessToken);
  //     }
  //   } else if (response?.type === "error") {
  //     Alert.alert("Google Auth Error", "Something went wrong during login.");
  //   }
  // }, [response]);

  // Fetch basic user info from Google
  // const fetchUserInfo = async (token: string) => {
  //   try {
  //     const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log(AuthSession.makeRedirectUri());
  //     const data = await res.json();
  //     setUserInfo(data);
  //     // Navigate to your app home or dashboard
  //     router.push("/(tabs)");
  //   } catch (err) {
  //     console.error("Failed to fetch user info:", err);
  //   }
  // };

  const handleSubmit = () => {
    // promptAsync();
    // fetchUserInfo();
    // router.push("/(tabs)");
    router.push("/auth/login");
    // router.push("/onboarding/createprofile");
  };

  return (
    <Layout>
      <View className="h-full py-12 flex-col justify-between">
        <View>
          <Image source={require("../assets/images/smallLivestorm.png")} />
          <View className="mt-8">
            <Text className="font-regular leading-[60px] text-[48px] ">
              Let’s help you
              <Text className="text-primary font-textBold "> manage </Text>your
              freelance projects
            </Text>
          </View>
        </View>

        <View>
          <GoogleAuthBtn handleSubmit={handleSubmit} />
        </View>
      </View>
    </Layout>
  );
};

export default Index;
