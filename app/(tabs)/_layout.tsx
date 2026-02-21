import GigsIcon from "@/assets/icons/GigsIcon";
import HomeIcon from "@/assets/icons/Home";
import SendIcon from "@/assets/icons/SendIcon";
import UserIcon from "@/assets/icons/User";
import { TAB_BAR_BASE_HEIGHT } from "@/utils/config";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabIconInterface {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconInterface> = ({ icon, name, focused }) => {
  return (
    <View className="items-center w-[150%] justify-center">
      <View style={{ marginBottom: 4 }}>{icon}</View>
      <Text
        className={`${
          focused ? "text-white" : "text-[#B0B9DA]"
        } font-regular text-[12px]`}
      >
        {name}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom ?? 0;
  const tabBarTotalHeight = TAB_BAR_BASE_HEIGHT + bottomInset;

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#061D3F",
          height: tabBarTotalHeight,
          paddingTop: 23,
          paddingBottom: bottomInset,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={
                focused ? (
                  <HomeIcon color="white" />
                ) : (
                  <HomeIcon color="#B0B9DA" />
                )
              }
              color={color}
              name="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="gigs"
        options={{
          title: "gigs",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={
                focused ? (
                  <GigsIcon color="white" />
                ) : (
                  <GigsIcon color="#B0B9DA" />
                )
              }
              color={color}
              name="Gigs"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "ai",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={
                focused ? (
                  <SendIcon color="#fff" />
                ) : (
                  <SendIcon color="#B0B9DA" />
                )
              }
              color={color}
              name="AI Chat"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={
                focused ? (
                  <UserIcon color="white" />
                ) : (
                  <UserIcon color="#B0B9DA" />
                )
              }
              color={color}
              name="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
