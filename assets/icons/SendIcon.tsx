import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface SendIconProp {
  size?: number;
  color: string;
}

const SendIcon: React.FC<SendIconProp> = ({ size = 30, color = "#4F46E5" }) => {
  return (
    <View>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 0 7z" fill={color} />
      </Svg>
    </View>
  );
};

export default SendIcon;
