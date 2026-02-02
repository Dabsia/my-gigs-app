import React, { useState, useRef, useMemo } from "react";
import { View, Dimensions, PanResponder } from "react-native";
import {
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
  Line,
  Text as SvgText,
} from "react-native-svg";

const InteractiveAreaChart = ({ data = [], labels = [], height = 240 }) => {
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width - 32
  );

  const [activeIndex, setActiveIndex] = useState(
    data.length > 0 ? data.length - 1 : 0
  );

  const paddingX = 20;
  const bottomAxisSpace = 30;
  const topTooltipSpace = 70;

  const chartData = useMemo(() => {
    return labels.map((label, i) => ({
      value: data[i] || 0,
      label: label,
    }));
  }, [data, labels]);

  const maxValue = Math.max(...chartData.map((d) => d.value)) || 1;
  const minValue = 0;

  const getX = (index) =>
    paddingX +
    (index * (containerWidth - paddingX * 2)) / (chartData.length - 1);

  const getY = (value) =>
    height -
    bottomAxisSpace -
    ((value - minValue) / (maxValue - minValue)) *
      (height - topTooltipSpace - bottomAxisSpace);

  const points = chartData.map((item, i) => ({
    x: getX(i),
    y: getY(item.value),
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        const relativeX = touchX - paddingX;
        const colWidth =
          (containerWidth - paddingX * 2) / (chartData.length - 1);
        let index = Math.round(relativeX / colWidth);
        index = Math.max(0, Math.min(chartData.length - 1, index));
        setActiveIndex(index);
      },
    })
  ).current;

  const createSmoothPath = (pts) => {
    return pts.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const cp1x = a[i - 1].x + (point.x - a[i - 1].x) / 2;
      return `${acc} C ${cp1x},${a[i - 1].y} ${cp1x},${point.y} ${point.x},${
        point.y
      }`;
    }, "");
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${
    height - bottomAxisSpace
  } L ${points[0].x},${height - bottomAxisSpace} Z`;

  const activePoint = points[activeIndex];

  return (
    <View
      className="w-full bg-secondary rounded-[32px] py-6 shadow-2xl"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View {...panResponder.panHandlers}>
        <Svg width={containerWidth} height={height}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#d4ff70" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#d4ff70" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <Path d={areaPath} fill="url(#areaGradient)" />
          <Path
            d={linePath}
            fill="none"
            stroke="#d4ff70"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* UPDATED: Dotted Indicator Line is now White */}
          <Line
            x1={activePoint.x}
            y1={activePoint.y}
            x2={activePoint.x}
            y2={height - bottomAxisSpace}
            stroke="#ffffff" // Changed to white
            strokeOpacity="0.5" // Optional: makes it look more integrated
            strokeDasharray="4, 4"
          />

          <Circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="10"
            fill="#d4ff70"
            opacity="0.15"
          />
          <Circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#d4ff70" />

          <G
            x={Math.min(Math.max(activePoint.x - 45, 5), containerWidth - 95)}
            y={Math.max(activePoint.y - 75, 5)}
          >
            <Path
              d="M 10,0 H 80 A 10,10 0 0 1 90,10 V 35 A 10,10 0 0 1 80,45 H 55 L 45,52 L 35,45 H 10 A 10,10 0 0 1 0,35 V 10 A 10,10 0 0 1 10,0 Z"
              fill="#fff"
            />
            <SvgText
              x="45"
              y="16"
              fill="#8e8e93"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
              letterSpacing={0.5}
            >
              {chartData[activeIndex].label.toUpperCase()}
            </SvgText>
            <SvgText
              x="45"
              y="34"
              fill="#061D3F"
              fontSize="16"
              textAnchor="middle"
              fontWeight="900"
            >
              {`$${chartData[activeIndex].value.toLocaleString()}`}
            </SvgText>
          </G>

          {/* X-Axis Labels */}
          {chartData.map((item, i) => (
            <SvgText
              key={i}
              x={getX(i)}
              y={height - 5}
              fill={i === activeIndex ? "#ffffff" : "#636366"}
              fontSize="9"
              fontWeight={i === activeIndex ? "900" : "500"}
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  );
};

export default InteractiveAreaChart;
