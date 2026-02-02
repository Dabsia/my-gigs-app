import React from "react";
import { Pressable, Text } from "react-native";

interface PrimaryBtnInterface {
  text: string;
  handlePress: () => void;
  className?: string;
  disabled?: boolean;
}

const PrimaryBtn: React.FC<PrimaryBtnInterface> = ({
  text,
  handlePress,
  className,
}) => {
  return (
    <Pressable
      onPress={handlePress}
      className={`w-full items-center justify-center rounded-[18px] py-6 ${className} bg-primary`}
    >
      <Text className="text-white  font-textBold text-[16px] ">{text}</Text>
    </Pressable>
  );
};

export default PrimaryBtn;
