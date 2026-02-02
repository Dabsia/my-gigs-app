import GigsIcon from "@/assets/icons/GigsIcon";
import HomeIcon from "@/assets/icons/Home";
import SendIcon from "@/assets/icons/SendIcon";
import UserIcon from "@/assets/icons/User";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

interface TabIconInterface {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconInterface> = ({ icon, name, focused }) => {
  return (
    <View className="flex items-center w-[150%] justify-center">
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
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        // tabBarActiveTintColor: "#6F2DA8",
        // tabBarInactiveTintColor: "#cdcde0",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#061D3F",
          height: 80,
          display: "flex",
          paddingTop: 23,
          // top: -45,
          alignItems: "center", // Center items vertically
          justifyContent: "center", // Center items horizontally
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
