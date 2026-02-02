import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BackBtn from "@/components/BackBtn/BackBtn";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";

export default function EditTeamMember() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className=" px-4 h-full flex justify-between  py-4 bg-white">
        <View>
          <BackBtn title="WP Ecommerce Site" />

          <View className="mt-8">
            <Text className="text-[16px] font-semiBold mb-2">Full Name</Text>
            <TextInput
              placeholder="e.g., Jane Doe"
              placeholderTextColor="#95a5a6"
              value={fullName}
              onChangeText={setFullName}
              className="h-[55px] rounded-xl font-regular border border-gray-300 px-4 text-[16px] mb-5"
            />

            {/* Email Address */}
            <Text className="text-[16px] font-semiBold mb-2">
              Email Address
            </Text>
            <TextInput
              placeholder="name@example.com"
              placeholderTextColor="#95a5a6"
              value={email}
              onChangeText={setEmail}
              className="h-[55px] rounded-xl border font-regular border-gray-300 px-4 text-[16px] mb-5"
            />

            {/* Role */}
            <Text className="text-[16px] font-semiBold mb-2">Role</Text>

            <TextInput
              placeholder="Product Manager"
              placeholderTextColor="#95a5a6"
              value={role}
              onChangeText={setRole}
              className="h-[55px] rounded-xl border font-regular border-gray-300 px-4 text-[16px] mb-5"
            />
          </View>
        </View>
        <PrimaryBtn
          className="mt-10"
          handlePress={() => console.log("Team mmate added")}
          text="Edit Team Member"
        />
      </View>
    </SafeAreaView>
  );
}
