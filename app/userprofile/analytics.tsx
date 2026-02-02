import React, { useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import {
  DollarSign,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BriefcaseBusiness,
} from "lucide-react-native";
import { Svg, Circle, G, Text as SvgText } from "react-native-svg";

// Layout & Custom Components
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import InteractiveAreaChart from "@/components/AnalyticsGraph";
import { getTopRevenueInsight } from "@/helpers/higestMoneyEarnedCalc";

// Mock data - Ensure these arrays match in length for the best UI
const mockAnalyticsData = {
  overview: {
    revenue: 12540,
    revenueChange: 15.3,
    hoursWorked: 86,
    hoursChange: 8.2,
    activeClients: 12,
    clientsChange: 20,
    projectCompletion: 85,
    completionChange: 5.1,
  },
  financials: {
    monthlyRevenue: [
      4200, 5800, 6100, 7300, 8900, 12540, 10200, 11800, 14450, 13200, 15100,
      16000,
    ],
    revenueLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  performance: {
    avgResponseTime: "2.4h",
    clientSatisfaction: 4.8,
    onTimeDelivery: 92,
    repeatClients: 6,
  },
  projects: {
    total: 26,
    active: 4,
    completed: 18,
    pending: 2,
  },
};

// Simplified Wrapper to bridge your Screen and the Interactive Graph
const SimpleLineChart = ({ data, labels, height = 240 }) => {
  return <InteractiveAreaChart data={data} labels={labels} height={height} />;
};

// Circular Graph Component
const CircularGraph = ({ data, size = 120, strokeWidth = 12 }) => {
  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {data.map((item, index) => {
            const percentage =
              totalHours === 0 ? 0 : (item.hours / totalHours) * 100;
            const segmentAngle = (percentage / 100) * 360;
            const strokeDashoffset =
              circumference - (percentage / 100) * circumference;

            const segment = (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                fill="transparent"
                rotation={currentAngle}
                origin={`${size / 2}, ${size / 2}`}
              />
            );
            currentAngle += segmentAngle;
            return segment;
          })}
        </G>
        <SvgText
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1F2937"
        >
          {totalHours.toFixed(1)}h
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
        >
          Total
        </SvgText>
      </Svg>

      <View className="mt-4 w-full">
        {data.map((item, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-2"
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <Text className="text-sm font-regular text-gray-700">
                {item.project}
              </Text>
            </View>
            <Text className="text-sm font-semiBold text-gray-900">
              {item.hours.toFixed(1)}h
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function AnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const analyticsData = mockAnalyticsData;

  const insight = getTopRevenueInsight(
    analyticsData.financials.monthlyRevenue,
    analyticsData.financials.revenueLabels
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const timeDistributionData = [
    { project: "Project Alpha", hours: 56.8, color: "#3B82F6" },
    { project: "Client Beta", hours: 49.7, color: "#8B5CF6" },
    { project: "Internal", hours: 35.5, color: "#10B981" },
    { project: "Others", hours: 15.2, color: "#6B7280" },
  ];

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = "number",
    suffix = "",
  }) => {
    const isPositive = change >= 0;
    return (
      <View className="bg-white rounded-[12px] p-4 border border-gray-200 flex-1 min-w-[48%] mx-1 mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-regular text-gray-500">{title}</Text>
          <Icon size={16} color="#6B7280" />
        </View>
        <Text className="text-xl font-textBold text-gray-900 mb-1">
          {format === "currency"
            ? `$${value.toLocaleString()}`
            : `${value}${suffix}`}
        </Text>
        <View className="flex-row items-center">
          {isPositive ? (
            <ArrowUpRight size={14} color="#10B981" />
          ) : (
            <ArrowDownRight size={14} color="#EF4444" />
          )}
          <Text
            className={`text-xs font-semiBold ml-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(change)}% {isPositive ? "up" : "down"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Layout>
      <View className="flex-1">
        <View className="pt-4 pb-4 border-b border-gray-200">
          <BackBtn title="Analytics Dashboard" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Main Stats */}
          <View className="pt-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-4 px-1">
              Performance Overview
            </Text>
            <View className="flex-row flex-wrap -mx-1">
              <StatCard
                title="Revenue"
                value={analyticsData.overview.revenue}
                change={analyticsData.overview.revenueChange}
                icon={DollarSign}
                format="currency"
              />
              <StatCard
                title="Clients"
                value={analyticsData.overview.activeClients}
                change={analyticsData.overview.clientsChange}
                icon={Users}
              />
              <StatCard
                title="Hours"
                value={analyticsData.overview.hoursWorked}
                change={analyticsData.overview.hoursChange}
                icon={Clock}
                suffix="h"
              />
              <StatCard
                title="Projects"
                value={analyticsData.projects.total}
                change={analyticsData.overview.hoursChange}
                icon={BriefcaseBusiness}
              />
            </View>
          </View>

          {/* DYNAMIC CHART SECTION */}
          <View className="pt-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-4">
              Revenue Trend
            </Text>
            <SimpleLineChart
              data={analyticsData.financials.monthlyRevenue}
              labels={analyticsData.financials.revenueLabels}
              height={240}
            />
          </View>

          {/* Insights Card */}
          <View className="pt-6">
            <View className="bg-white rounded-[12px] p-4 border border-gray-200">
              <Text className="text-sm font-regular text-gray-500 mb-1">
                {insight?.message}
              </Text>
              <Text className="text-2xl font-textBold text-gray-900">
                {insight?.formattedAmount}
              </Text>
            </View>
          </View>

          {/* Time Distribution */}
          <View className="pt-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-4">
              Time Distribution
            </Text>
            <View className="bg-white rounded-[12px] border border-gray-200 p-6">
              <CircularGraph
                data={timeDistributionData}
                size={140}
                strokeWidth={16}
              />
            </View>
          </View>

          {/* Project Summary */}
          <View className="pt-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-4">
              Project Metrics
            </Text>
            <View className="flex-row -mx-1">
              <View className="flex-1 px-1">
                <View className="bg-white rounded-[12px] p-4 border border-gray-200 items-center">
                  <Text className="text-2xl font-textBold text-gray-900">
                    {analyticsData.projects.active}
                  </Text>
                  <Text className="text-xs text-gray-500">Active</Text>
                </View>
              </View>
              <View className="flex-1 px-1">
                <View className="bg-white rounded-[12px] p-4 border border-gray-200 items-center">
                  <Text className="text-2xl font-textBold text-gray-900">
                    {analyticsData.projects.completed}
                  </Text>
                  <Text className="text-xs text-gray-500">Completed</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}
