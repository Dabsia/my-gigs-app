import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Root-level screen used after logout. Replaces the (tabs) stack with this screen,
 * then immediately replaces to "/" so we land on the true landing index (not tabs home).
 * Needed because router.replace("/") from inside (tabs) goes to the nearest "/" = tabs index.
 */
export default function SignOutScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
