import { formatDate } from "@/helpers/formatDate";
import { getInitials } from "@/helpers/getInitials";
import { ProjectInterface } from "@/interfaces";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import CircularProgress from "../CircularProgress/CircularProgress";

// Color palette for client avatars
const CLIENT_COLORS = [
  "#E8FBFF", // Light blue (original)
  "#FFE8E8", // Light red
  "#E8FFE8", // Light green
  "#FFF8E8", // Light yellow
  "#F5E8FF", // Light purple
  "#E8F8FF", // Light cyan
  "#FFE8F8", // Light pink
  "#E8FFFB", // Light teal
  "#F0E8FF", // Light lavender
  "#FFFAE8", // Light cream
];

// Function to get a consistent color based on client name
const getClientColor = (clientName: string): string => {
  if (!clientName) return CLIENT_COLORS[0]; // Default color

  // Generate a hash from the client name
  let hash = 0;
  for (let i = 0; i < clientName.length; i++) {
    hash = clientName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % CLIENT_COLORS.length;
  return CLIENT_COLORS[index];
};

const GigCard = ({ item }: { item: ProjectInterface }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/giginfo/personalgiginfo",
      params: {
        gigInfo: JSON.stringify(item),
      },
    });
  };

  const { title, dueDate, progressPercentage, name, percent, date, client } =
    item;

  // Handle missing client
  const clientName = client?.name || "Client";
  const clientInitials = getInitials(clientName);

  // Get color based on client name
  const clientColor = getClientColor(clientName);

  // Use the appropriate date
  const displayDate = dueDate || date;

  // Use the appropriate progress
  const progress = progressPercentage || percent || 0;

  return (
    <Pressable
      onPress={handlePress}
      className="mt-4 bg-white w-full flex-row justify-between items-center px-4 h-[90px] rounded-[16px] shadow-sm"
    >
      <View className="flex-row justify-between items-center flex-1 mr-4">
        <View
          className="mr-[15px] w-[44px] h-[44px] items-center justify-center rounded-[18px]"
          style={{ backgroundColor: clientColor }}
        >
          <Text className="text-gray-800 font-textBold text-[16px]">
            {clientInitials}
          </Text>
        </View>
        <View className="flex-1">
          {/* Text with truncation */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="font-semiBold text-[12px] text-gray-900"
          >
            {title || name || "Untitled Project"}
          </Text>
          <Text className="text-[12px] mt-2 font-regular text-gray-500">
            {displayDate ? formatDate(displayDate) : "No date"}
          </Text>
        </View>
      </View>
      <View>
        <CircularProgress progress={Number(progress)} />
      </View>
    </Pressable>
  );
};

export default GigCard;
