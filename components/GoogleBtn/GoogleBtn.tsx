import GoogleIcon from "@/assets/icons/Google";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function GoogleAuthButton() {
  useWarmUpBrowser();
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    if (loading) return; // prevent double clicks
    setLoading(true);

    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "mygigsapp",
      });

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        console.log("Session activated:", createdSessionId);
        await setActive({
          session: createdSessionId,
          navigate: async () => {
            // safely navigate after session is active
            router.replace("/(tabs)");
          },
        });
      } else {
        console.log("No session created");
      }
    } catch (err) {
      console.error("Google SSO failed:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <Pressable
      onPress={onPress}
      className="w-full bg-secondary h-[60px] rounded-[25px] justify-center items-center"
      disabled={loading}
    >
      <View className="justify-center flex-row items-center text-[16px]">
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <GoogleIcon />
            <Text className="text-white font-regular font-[500] ml-2">
              Continue with Google
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
