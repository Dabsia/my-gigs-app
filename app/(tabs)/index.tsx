import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import HomeHeader from "@/components/HomeHeader/HomeHeader";
import GigBalanceContainer from "@/components/GigBalanceContainer/GigBalanceContainer";
import MyStats from "@/components/MyStats/MyStats";
import LatestGigs from "@/components/LatestGigs/LatestGigs";
import Layout from "@/components/Layout/Layout";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Layout className="white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader />
        {/* <GigBalanceContainer /> */}
        <MyStats />
        <LatestGigs />
      </ScrollView>
    </Layout>
  );
}
