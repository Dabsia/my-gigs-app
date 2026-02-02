import { View, Text, Image } from "react-native";
import React from "react";

interface ClientsProps {
  id: number;
  color: string;
  name: string; // Color as a string (e.g., "#FF0000" or "red")
}

const SmallPhotoCard = ({ client }: { client: ClientsProps }) => {
  return (
    <View className="flex-row justify-between">
      {/* Use dynamic inline styles for background color */}
      <View
        style={{
          height: 33,
          width: 33,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: client?.color, // Dynamically set background color
        }}
      >
        <Image
          className="h-[28px] w-[28px]"
          source={require("../../assets/images/profilePic.png")}
        />
      </View>
    </View>
  );
};

export default SmallPhotoCard;
