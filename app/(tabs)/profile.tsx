import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "@/components/Avatar/Avatar";
import Layout from "@/components/Layout/Layout";
import Logout from "@/components/Logout/Logout";
import { API_BASE_URL, TAB_BAR_BASE_HEIGHT } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ChartLine,
  ChevronRight,
  FileText,
  User,
  Users,
} from "lucide-react-native";

const Profile = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const { data, isLoading, error } = useQuery({
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
    enabled: isLoaded && isSignedIn,
  });

  // Get user data from MongoDB response
  const userData = data?.user;

  const userName = {
    firstName: userData?.name?.split(" ")[0] || "User",
    lastName: userData?.name?.split(" ").slice(1).join(" ") || "",
  };

  const name = userData?.name || "User";
  const profession = userData?.profession || "No profession set";

 

  // Show error state
  if (error) {
    return (
      <Layout>
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Error loading profile</Text>
        </View>
      </Layout>
    );
  }

  const tabBarPadding = TAB_BAR_BASE_HEIGHT + (insets.bottom ?? 0);

  return (
    <Layout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
      >
        {/* Avatar + Name */}
        <View className="items-center mt-6">
          <Avatar
            className="w-40 h-40 rounded-full items-center justify-center bg-secondary"
            textSize="40px"
            userName={userName}
          />
          <Text className="text-black text-2xl text-center font-semiBold mt-4">
            {name}
          </Text>
          <Text className="text-gray-500 font-regular text-center text-base mt-1">
            {profession}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-200 my-7" />

        {/* Account Management */}
        <Text className="text-gray-700 text-lg font-semiBold mb-4">
          Account Management
        </Text>

        <MenuItem
          icon={<User size={22} color="#000" />}
          label="Edit Information"
          onRoute={() => router.push("/userprofile/EditProfile")}
        />

        {/* Business Management */}
        <Text className="text-gray-700 text-lg font-semiBold mt-8 mb-4">
          Business Management
        </Text>

        <MenuItem
          onRoute={() => router.push("/userprofile/analytics")}
          icon={<ChartLine size={22} color="#000" />}
          label="Analytics"
        />
        <MenuItem
          onRoute={() => router.push("/userprofile/Clients")}
          icon={<Users size={22} color="#000" />}
          label="Clients"
        />
        <MenuItem
          icon={<FileText size={22} color="#000" />}
          onRoute={() => router.push("/userprofile/Invoices")}
          label="Invoices"
        />

        <Logout />
      </ScrollView>
    </Layout>
  );
};

const MenuItem = ({ icon, label, onRoute }: any) => (
  <Pressable
    onPress={onRoute}
    className="flex-row bg-white px-3 mb-3 rounded-[10px] items-center justify-between py-4"
  >
    <View className="flex-row items-center space-x-4">
      <View className="p-3 bg-gray-100 rounded-xl">{icon}</View>
      <Text className="text-black ml-2 font-regular text-base">{label}</Text>
    </View>

    <ChevronRight size={20} color="#9CA3AF" />
  </Pressable>
);

export default Profile;
