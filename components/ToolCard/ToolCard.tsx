import { Text, Pressable } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

interface ToolCardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onRoute?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, label, onRoute }) => {
  return (
    <Pressable
      className="w-full bg-secondary px-4 h-[80px] mb-3 rounded-2xl flex-row items-center border-[1px]"
      onPress={onRoute}
    >
      <Feather name={icon} size={20} color="#fff" />
      <Text className="ml-3 text-white font-bold">{label}</Text>
    </Pressable>
  );
};

export default ToolCard;
