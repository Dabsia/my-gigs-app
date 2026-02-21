import HomeHeader from "@/components/HomeHeader/HomeHeader";
import LatestGigs from "@/components/LatestGigs/LatestGigs";
import Layout from "@/components/Layout/Layout";
import MyStats from "@/components/MyStats/MyStats";
import { API_BASE_URL, TAB_BAR_BASE_HEIGHT } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  // React Query - only runs when Clerk is loaded AND user is signed in
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();

        throw new Error(text);
      }

      return res.json();
    },
    enabled: isLoaded && isSignedIn, // Don't run query until Clerk is ready AND user is signed in
  });

  const userData = data?.user;

  const userName = {
    firstName: userData?.name?.split(" ")[0] || "User",
    lastName: userData?.name?.split(" ").slice(1).join(" ") || "",
  };

  const tabBarPadding = TAB_BAR_BASE_HEIGHT + (insets.bottom ?? 0);

  return (
    <Layout className="white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
      >
        <HomeHeader userName={userName} />
        <MyStats />
        <LatestGigs />
      </ScrollView>
    </Layout>
  );
}
