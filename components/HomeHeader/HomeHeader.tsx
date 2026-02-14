import NotificationIcon from "@/assets/icons/Notification";
import { getFirstName } from "@/helpers/getInitials";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Avatar from "../Avatar/Avatar";

interface UserName {
  firstName: string;
  lastName: string;
}

interface HomeHeaderProps {
  userName: UserName;
}

const HomeHeader = ({ userName }: HomeHeaderProps) => {
  const router = useRouter();

  return (
    <View className="flex-row mt-5 items-center justify-between">
      <Pressable
        onPress={() => router.push("/(tabs)/profile")}
        className="items-center flex-row"
      >
        <Avatar
          className="w-[42px] h-[42px] rounded-full items-center justify-center bg-secondary"
          userName={userName}
          textSize="16px"
        />
        <Text className="ml-2 font-semiBold text-[20px]">
          {userName?.firstName
            ? `Hi, ${getFirstName(
                `${userName.firstName} ${userName.lastName ?? ""}`
              )}`
            : "Loading..."}
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
