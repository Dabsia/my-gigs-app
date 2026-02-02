import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  User,
  AtSign,
  Lock,
  CreditCard,
  Bell,
  Mail,
  MonitorCog,
  Languages,
  HelpCircle,
  FileText,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function Settings() {
  const [pushNotif, setPushNotif] = useState(true);
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      {/* Header */}
      <View className="mt-2 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <View className="bg-gray-100 mr-3 h-10 w-10 items-center justify-center rounded-full">
            <AntDesign name="left" size={20} color="#4B5563" />
          </View>
        </Pressable>
        <Text className="flex-1 text-center text-black text-xl font-semibold">
          Settings
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-gray-100 rounded-2xl p-5 mt-6">
          <View className="flex-row items-center space-x-4">
            <View className="bg-gray-300 items-center justify-center mr-2 w-14 h-14 rounded-full">
              <Image
                source={require("../../assets/images/profilePic.png")}
                className="w-14 h-14 bg-black rounded-full"
              />
            </View>
            <View>
              <Text className="text-black font-semibold text-base">
                Aria Sharma
              </Text>
              <Text className="text-gray-500">aria.sharma@email.com</Text>
            </View>
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <SectionTitle title="NOTIFICATIONS" />

        <MenuCard>
          <View className="flex-row justify-between items-center py-4">
            <View className="flex-row items-center space-x-4">
              <Bell size={22} color="#000" />
              <Text className="text-black ml-2 text-base">
                Push Notifications
              </Text>
            </View>

            <Switch
              value={pushNotif}
              onValueChange={setPushNotif}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor="#fff"
            />
          </View>
        </MenuCard>

        {/* <SectionTitle title="CURRENCY" />
        <MenuCard>
          <View className="flex-row justify-between items-center py-4">
            <View className="flex-row py-4 items-center space-x-4">
              <CircleDollarSign size={22} color="#000" />
              <Text className="text-black ml-2 text-base">
                Currency
              </Text>
            </View>

          
          </View>
        </MenuCard> */}

        {/* SUPPORT & LEGAL */}
        {/* <SectionTitle title="SUPPORT & LEGAL" />

        <MenuCard>
          <MenuItem
            icon={<HelpCircle size={22} color="#000" />}
            label="Help & FAQ"
          />
          <Divider />
          <MenuItem
            icon={<FileText size={22} color="#000" />}
            label="Terms of Service"
          />
          <Divider />
          <MenuItem
            icon={<ShieldCheck size={22} color="#000" />}
            label="Privacy Policy"
          />
        </MenuCard> */}

        {/* App Version */}
        <Text className="text-center mt-2 text-gray-400 mb-10">
          App Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------ COMPONENTS ------------------ */

const SectionTitle = ({ title }: any) => (
  <Text className="text-gray-700 text-xs font-semibold mt-8 mb-3">{title}</Text>
);

const MenuCard = ({ children }: any) => (
  <View className="bg-gray-100 rounded-2xl px-5">{children}</View>
);

const Divider = () => <View className="h-[1px] bg-gray-300" />;

const MenuItem = ({ icon, label, value }: any) => (
  <TouchableOpacity className="flex-row justify-between items-center py-4">
    <View className="flex-row items-center space-x-4">
      {icon}
      <Text className="text-black ml-2 text-base">{label}</Text>
    </View>

    {value ? (
      <Text className="text-gray-500 text-base">{value}</Text>
    ) : (
      <ArrowLeft
        size={18}
        color="#9CA3AF"
        style={{ transform: [{ rotate: "180deg" }] }}
      />
    )}
  </TouchableOpacity>
);
