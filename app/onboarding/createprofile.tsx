import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";

export default function CreateProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Andi Lane");
  const [email, setEmail] = useState("andi.lane@example.com");
  const [profession, setProfession] = useState("UI/UX Designer");
  const [experience, setExperience] = useState("");

  const experienceOptions = [
    { label: "0-2 years", value: "0-2" },
    { label: "3-5 years", value: "3-5" },
    { label: "5+ years", value: "5+" },
  ];

  const handleContinue = () => {
    const profileData = {
      fullName,
      email,
      profession,
      experience,
    };

    // Pass data as query params or use state management
    router.push({
      pathname: "/onboarding/createpayout",
      params: profileData,
    });
  };

  return (
    <Layout>
      <View className="flex-1 ">
        {/* Header */}
        <View className="pt-4 pb-4 border-b border-gray-200 ">
          <BackBtn title="Create Your Profile" />

          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-base font-semiBold text-gray-900">
              Personal Info
            </Text>
            <Text className="text-sm text-gray-500 font-regular">
              Step 1 of 3
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <View className="flex-1 justify-between h-full">
            <View className="b">
              <View className="mt-6 mb-2">
                <Text className="text-2xl font-textBold text-gray-900 mb-2">
                  Let's Get Started
                </Text>
                <Text className="text-base text-gray-600 font-regular leading-6">
                  First, tell us a bit about yourself.
                </Text>
              </View>

              {/* Full Name Section */}
              <View className="mt-6">
                <Text className="text-base font-semiBold text-gray-900 mb-3">
                  Full Name
                </Text>
                <View className="border border-gray-300 rounded-[12px] bg-white">
                  <TextInput
                    className="px-4 py-3 text-base text-gray-900 font-regular"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                  />
                </View>
              </View>

              {/* Email Section */}
              <View className="mt-6">
                <Text className="text-base font-semiBold text-gray-900 mb-3">
                  Email Address
                </Text>
                <View className="border border-gray-300 rounded-[12px] bg-white">
                  <TextInput
                    className="px-4 py-3 text-base text-gray-900 font-regular"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Profession Section */}
              <View className="mt-6">
                <Text className="text-base font-semiBold text-gray-900 mb-3">
                  Profession / Specialization
                </Text>
                <View className="border border-gray-300 rounded-[12px] bg-white">
                  <TextInput
                    className="px-4 py-3 text-base text-gray-900 font-regular"
                    value={profession}
                    onChangeText={setProfession}
                    placeholder="Enter your profession"
                  />
                </View>
              </View>

              {/* Experience Section */}
              <View className="mt-6">
                <Text className="text-base font-semiBold text-gray-900 mb-3">
                  Years of Experience
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {experienceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      className={`flex-1 min-w-[30%] border rounded-[12px] py-3 px-4 items-center ${
                        experience === option.value
                          ? "border-secondary bg-secondary"
                          : "border-secondary bg-white"
                      }`}
                      onPress={() => setExperience(option.value)}
                    >
                      <Text
                        className={`text-sm font-regular ${
                          experience === option.value
                            ? "text-white font-semiBold"
                            : "text-gray-600"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Continue Button */}

            <PrimaryBtn
              text="Continue"
              handlePress={handleContinue}
              className="mt-8"
            />
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}
