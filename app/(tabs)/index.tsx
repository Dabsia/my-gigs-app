import HomeHeader from "@/components/HomeHeader/HomeHeader";
import LatestGigs from "@/components/LatestGigs/LatestGigs";
import Layout from "@/components/Layout/Layout";
import MyStats from "@/components/MyStats/MyStats";
import { useAuth } from "@clerk/clerk-expo";
import { ScrollView } from "react-native";

export default function HomeScreen() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // React Query - only runs when Clerk is loaded AND user is signed in
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["me"],
  //   queryFn: async () => {
  //     const token = await getToken();

  //     if (!token) {
  //       throw new Error("Failed to get authentication token");
  //     }

  //     const res = await fetch(`${API_BASE_URL}/api/auth`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!res.ok) {
  //       const text = await res.text();
  //       console.log("Error fetching user data:", text);
  //       throw new Error(text);
  //     }

  //     return res.json();
  //   },
  //   enabled: isLoaded && isSignedIn, // Don't run query until Clerk is ready AND user is signed in
  // });

  // Optional: Show loading state while Clerk initializes
  // if (!isLoaded) {
  //   return (
  //     <Layout className="white">
  //       <ScrollView showsVerticalScrollIndicator={false}>
  //         <HomeHeader />
  //         {/* You might want to add a loading skeleton here */}
  //       </ScrollView>
  //     </Layout>
  //   );
  // }

  return (
    <Layout className="white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <MyStats />
        <LatestGigs />
      </ScrollView>
    </Layout>
  );
}
