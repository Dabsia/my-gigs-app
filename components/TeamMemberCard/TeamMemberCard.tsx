import { getInitials } from "@/helpers/getInitials";
import React from "react";
import { View, Text, Pressable } from "react-native";

type TeamMemberCardProps = {
  name: string;
  role: string;
  openModal: () => void;
};

// Function to generate a random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  role,
  openModal,
}) => {
  const initials = getInitials(name);
  const backgroundColor = getRandomColor(); // generate a random color

  return (
    <Pressable onPress={openModal} className="w-[70px] mr-3">
      <View
        className="h-[66px] w-[66px] items-center justify-center rounded-full"
        style={{ backgroundColor }} // apply the random color
      >
        <Text className="font-textBold text-white text-[18px]">{initials}</Text>
      </View>
      <Text className="text-[12px] text-center mt-2 font-regular">{role}</Text>
    </Pressable>
  );
};

export default TeamMemberCard;
