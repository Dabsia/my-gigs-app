import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import Layout from "@/components/Layout/Layout";
import Logout from "@/components/Logout/Logout";
import { getInitials } from "@/helpers/getInitials";
import { UserData } from "@/interfaces";
import { queryClient } from "@/utils/react_query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  ChartLine,
  ChevronRight,
  FileText,
  User,
  Users,
} from "lucide-react-native";

export default function profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        console.log("User loaded:", parsedUser);
      } else {
        console.log("No user data found in storage");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear React Query cache first
            if (queryClient) {
              queryClient.clear();
              queryClient.removeQueries();
            }

            // Clear ALL AsyncStorage data
            const allKeys = await AsyncStorage.getAllKeys();
            const keysToRemove = allKeys.filter(
              (key) =>
                key.includes("auth") ||
                key.includes("token") ||
                key.includes("user") ||
                key.includes("client") ||
                key.includes("project") ||
                key === "auth_token" ||
                key === "user_data" ||
                key === "user"
            );

            if (keysToRemove.length > 0) {
              await AsyncStorage.multiRemove(keysToRemove);
            }

            console.log("Logged out, cleared:", keysToRemove.length, "keys");

            // Force a clean navigation to login

            router.replace("/auth/login");
          } catch (error) {
            console.error("Logout error:", error);
            // Still navigate to login
            router.replace("/auth/login");
          }
        },
      },
    ]);
  };

  return (
    <Layout>
      {/* Header */}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View className="items-center mt-6">
          <View className="w-40 h-40 rounded-full items-center justify-center bg-secondary">
            <Text className="text-white font-textBold text-[32px]">
              {getInitials(user?.name)}
            </Text>
          </View>
          <Text className="text-black text-2xl text-center font-semiBold mt-4">
            {user?.name}
          </Text>
          <Text className="text-gray-500 font-regular text-center text-base mt-1">
            {user?.profession}
          </Text>

          {/* Edit Profile */}
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

        {/* <MenuItem
          icon={<Settings size={22} color="#000" />}
          onRoute={() => router.push("/userprofile/Settings")}
          label="Settings"
        /> */}

        {/* Business Management */}
        <Text className="text-gray-700 text-lg font-semiBold mt-8 mb-4">
          Business Management
        </Text>
        {/* <MenuItem
          onRoute={() => router.push("/userprofile/bank")}
          icon={<Wallet size={22} color="#000" />}
          label="Bank Information"
        /> */}
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
}

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
