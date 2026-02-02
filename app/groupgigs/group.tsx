import { View, Text, Pressable, FlatList } from "react-native";
import GigCard from "@/components/GigCard/GigCard";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import CreateNewGig from "@/components/CreateNewGig/CreateNewGig";
import BackBtn from "@/components/BackBtn/BackBtn";

const group = () => {
  const router = useRouter();

  const data = [
    {
      id: "1",
      name: "Web3 NFT Website",
      date: "Jan 10, 2023",
      percent: 70,
      gigType: "group",
    },
    {
      id: "2",
      name: "Fintech UI Design",
      date: "Jan 10, 2023",
      percent: 64,
      gigType: "personal",
    },
    // Add more items as needed
  ];

  return (
    <SafeAreaView className="bg-[#F6F6F1] px-4 h-full w-full">
      <View className="pt-4 h-full ">
        <BackBtn title="Group Gigs" />
        <View className="mt-3">
          <Text className="font-regular text-[16px]">
            Team Collaboration Projects
          </Text>
        </View>
        <FlatList
          data={data}
          className="mt-8"
          renderItem={({ item }) => <GigCard item={item} />}
          keyExtractor={(item) => item.id}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />

        <CreateNewGig location="new/create" />
      </View>
    </SafeAreaView>
  );
};

export default group;
