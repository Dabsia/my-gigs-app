import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface BtnProp {
  title: string;
}

const BackBtn: React.FC<BtnProp> = ({ title }) => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      className="flex-row w-fit items-center"
    >
      <View className="bg-gray-100 mr-3 h-10 w-10 items-center justify-center rounded-full">
        <AntDesign name="left" size={20} color="#4B5563" />
      </View>
      <View className="">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-2xl font-textBold text-gray-900"
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

export default BackBtn;
