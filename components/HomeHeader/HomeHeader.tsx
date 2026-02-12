import NotificationIcon from "@/assets/icons/Notification";
import { getFirstName, getInitials } from "@/helpers/getInitials";
import { UserData } from "@/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const HomeHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-row mt-5 items-center justify-between">
      <Pressable
        onPress={() => router.push("/(tabs)/profile")}
        className="items-center flex-row"
        disabled={loading}
      >
        <View className="w-[42px] h-[42px] rounded-full items-center justify-center bg-secondary">
          <Text className="text-white font-textBold text-[16px]">
            {getInitials(user?.name)}
          </Text>
        </View>
        <Text className="ml-2 font-semiBold text-[20px]">
          Hi, {loading ? "..." : getFirstName(user?.name)}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/notification/notification")}
        className="w-[42px] h-[42px] rounded-full bg-white justify-center items-center shadow-sm"
      >
        <NotificationIcon />
      </Pressable>
    </View>
  );
};

export default HomeHeader;
