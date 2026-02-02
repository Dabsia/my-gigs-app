import React, { useState } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

const WaveGraph = () => {
  const [containerWidth, setContainerWidth] = useState(0);
  const height = 130;

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const pathData = containerWidth
    ? `
      M0 ${height * 1}
      C${containerWidth * 0.1} ${height * 0.1},
       ${containerWidth * 0.2} ${height * 1.5},
       ${containerWidth * 0.35} ${height * 0.7}
      S${containerWidth * 0.55} ${height * 0.3},
       ${containerWidth * 0.65} ${height * 0.7}
      S${containerWidth * 0.85} ${height * 1.0},
       ${containerWidth} ${height * 0.6}
    `
    : "";

  return (
    <View
      onLayout={handleLayout}
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {containerWidth > 0 && (
        <Svg width={containerWidth} height={height}>
          <Path d={pathData} fill="none" stroke="#3B82F6" strokeWidth={4} />
        </Svg>
      )}
    </View>
  );
};

export default WaveGraph;
