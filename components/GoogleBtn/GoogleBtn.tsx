// GoogleAuthButton.js
import React, { useEffect } from "react";
import { Pressable, Text, Alert, StyleSheet, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { auth } from "../../firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import GoogleIcon from "@/assets/icons/Google";

// Allow Google Auth to open in Expo browser
WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthButton() {
  // Use your actual Firebase / Google Cloud client IDs
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "483734584452-vp06gd5j738okgjvj42o5nf8004157gq.apps.googleusercontent.com", // Web client ID
    androidClientId:
      "483734584452-6u5b7tuo8qgaknr9l4f14ps0j72rqiaj.apps.googleusercontent.com", // Android standalone
    iosClientId:
      "483734584452-3e8291sq8gikjf1f8fe1tuar4bis9fvu.apps.googleusercontent.com", // iOS standalone
    webClientId:
      "483734584452-vp06gd5j738okgjvj42o5nf8004157gq.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const user = userCredential.user;
          Alert.alert("Success", `Signed in as ${user.email}`);
        })
        .catch((error) => {
          console.error("Firebase Sign-In Error:", error);
          Alert.alert("Error", error.message);
        });
    } else if (response?.type === "error") {
      console.error("Google Auth Error:", response);
      Alert.alert("Google Sign-In Error", "Authorization failed");
    }
  }, [response]);

  return (
    <Pressable
      onPress={() => promptAsync()}
      className="w-full bg-secondary h-[60px] rounded-[25px] justify-center items-center "
    >
      <View className="jusify-center flex-row items-center text-[16px]">
        <GoogleIcon />
        <Text className="text-white font-regular font-[500] ml-2">
          Continue with Google
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
