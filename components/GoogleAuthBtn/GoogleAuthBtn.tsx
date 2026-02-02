import { View, Text, Pressable } from "react-native";
import React from "react";
import GoogleIcon from "@/assets/icons/Google";

interface GoogleAuthProps {
  handleSubmit: () => void;
}

const GoogleAuthBtn = ({ handleSubmit }: GoogleAuthProps) => {
  return (
    <Pressable
      onPress={handleSubmit}
      className="w-full bg-secondary h-[60px] rounded-[25px] justify-center items-center "
    >
      <View className="jusify-center flex-row items-center text-[16px]">
        {/* <GoogleIcon />
        <Text className="text-white font-regular font-[500] ml-2">
          Continue with Google
        </Text> */}
        <Text className="text-white font-regular font-[500] ml-2">
          Continue
        </Text>
      </View>
    </Pressable>
  );
};

export default GoogleAuthBtn;
