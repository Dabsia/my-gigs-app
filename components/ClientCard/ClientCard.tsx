import { View, Text } from "react-native";
import { Building2, DollarSign, Clock } from "lucide-react-native";
import React from "react";

type ClientCardProps = {
  name: string;
  email: string;
  status: string;
  statusColor: string;
  iconBg: string;
  iconColor: string;
  amount: string;
  projects: string;
};

const ClientCard = ({
  name,
  email,
  status,
  statusColor,
  iconBg,
  iconColor,
  amount,
  projects,
}: ClientCardProps) => {
  return (
    <View className="bg-white rounded-xl p-4 border border-gray-100">
      <View className="flex-row items-start gap-4 mb-3">
        <View
          className={`w-12 h-12 rounded-xl items-center justify-center ${iconBg}`}
        >
          <Building2 size={24} className={iconColor} />
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-gray-900 mb-1">{name}</Text>
          <Text className="text-xs text-gray-500 mb-2">{email}</Text>

          <View className="flex-row gap-2">
            <Text
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
            >
              {status}
            </Text>
          </View>
        </View>
      </View>

      <View className="pt-3 border-t border-gray-100">
        <View className="flex-row justify-between">
          <View className="flex-row items-center gap-2">
            <DollarSign size={12} className="text-gray-500" />
            <Text className="text-xs text-gray-500">{amount}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Clock size={12} className="text-gray-500" />
            <Text className="text-xs text-gray-500">{projects}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ClientCard;
