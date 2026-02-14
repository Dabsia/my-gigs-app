import { getInitials } from "@/helpers/getInitials";
import React from "react";
import { Text, View } from "react-native";

interface UserName {
  firstName: string;
  lastName: string;
}

interface HomeHeaderProps {
  userName: UserName;
  className: string;
  textSize: string;
}

const Avatar = ({ userName, className, textSize }: HomeHeaderProps) => {
  const name = userName?.firstName + " " + userName?.lastName;
  return (
    <View className="relative">
      <View className={`${className}`}>
        <Text className={`text-white font-textBold text-[${textSize}]`}>
          {getInitials(name)}
        </Text>
      </View>
    </View>
  );
};

export default Avatar;
