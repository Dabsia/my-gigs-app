import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  User,
  CreditCard,
  Edit3,
  Zap,
  Shield,
} from "lucide-react-native";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";

type UserProfile = {
  fullName: string;
  email: string;
  profession: string;
  experience: string;
  stripeConnected: boolean;
};

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // In a real app, this would come from your state management or API
  const userProfile: UserProfile = {
    fullName: params.fullName || "Andi Lane",
    email: params.email || "andi.lane@example.com",
    profession: params.profession || "UI/UX Designer",
    experience: params.experience || "3-5 years",
    stripeConnected: params.stripeConnected === "true",
  };

  const profileItems = [
    {
      icon: User,
      label: "Full Name",
      value: userProfile.fullName,
      screen: "/onboarding/createprofile",
    },
    {
      icon: CreditCard,
      label: "Profession",
      value: userProfile.profession,
      screen: "/onboarding/createprofile",
    },
    {
      icon: Zap,
      label: "Experience",
      value: userProfile.experience,
      screen: "/onboarding/createprofile",
    },
    {
      icon: Shield,
      label: "Payout Account",
      value: userProfile.stripeConnected ? "Connected" : "Not Connected",
      status: userProfile.stripeConnected ? "connected" : "not_connected",
      screen: "/onboarding/createpayout",
    },
  ];

  const handleEdit = (screen: string) => {
    router.push(screen);
  };

  const handleGetStarted = () => {
    // In a real app, you might:
    // 1. Save all data to your backend
    // 2. Update user onboarding status
    // 3. Navigate to main app
    router.replace("/(tabs)");
  };

  const StatusBadge = ({
    status,
  }: {
    status: "connected" | "not_connected";
  }) => (
    <View
      className={`flex-row items-center px-3 py-1 rounded-full ${
        status === "connected" ? "bg-green-100" : "bg-amber-100"
      }`}
    >
      <View
        className={`w-2 h-2 rounded-full mr-2 ${
          status === "connected" ? "bg-green-500" : "bg-amber-500"
        }`}
      />
      <Text
        className={`text-xs font-semiBold ${
          status === "connected" ? "text-green-700" : "text-amber-700"
        }`}
      >
        {status === "connected" ? "Connected" : "Action Required"}
      </Text>
    </View>
  );

  return (
    <Layout>
      <View className="flex-1 ">
        {/* Header */}
        <View className="pt-4 pb-4 border-b border-gray-200">
          <BackBtn title="Review & Complete" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="flex-row justify-between items-center my-4">
            <Text className="text-base font-semiBold text-gray-900">
              Profile Review
            </Text>
            <Text className="text-sm text-gray-500 font-regular">
              Step 3 of 3
            </Text>
          </View>
          {/* Success Header */}
          <View className="pt-8 items-center mb-8">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <CheckCircle size={40} color="#10B981" />
            </View>

            <Text className="text-2xl font-textBold text-gray-900 text-center mb-3">
              You're All Set!
            </Text>

            <Text className="text-base text-gray-600 font-regular text-center leading-6">
              Review your information below. You can always update these
              settings later.
            </Text>
          </View>

          {/* Profile Summary Card */}
          <View className="mb-6">
            <View className="">
              <Text className="text-lg font-semiBold text-gray-900 mb-4">
                Profile Summary
              </Text>

              <View className="space-y-4">
                {profileItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <View
                      key={index}
                      className="flex-row mb-3 items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-white rounded-lg items-center justify-center mr-3 shadow-sm">
                          <IconComponent size={20} color="#6B7280" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-regular text-gray-500 mb-1">
                            {item.label}
                          </Text>
                          <Text className="text-base font-semiBold text-gray-900">
                            {item.value}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        {item.status && <StatusBadge status={item.status} />}
                        <TouchableOpacity
                          onPress={() => handleEdit(item.screen)}
                          className="ml-3"
                        >
                          <Edit3 size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Next Steps */}

          {/* Important Notes */}
          <View className="">
            <View className="bg-blue-50 rounded-[12px] p-4 border border-blue-200">
              <Text className="text-sm font-semiBold text-primary mb-2">
                Ready to Start Freelancing?
              </Text>
              <Text className="text-sm text-blue-800 font-regular leading-5">
                Your profile is ready. You can now receive payments, send
                invoices, and manage your freelance work all in one place.
                {userProfile.stripeConnected
                  ? " You're all set to receive payments!"
                  : " Set up your payout account to start receiving payments."}
              </Text>
            </View>

            {/* Footer Actions */}
            <View className="pt-4 ">
              {/* Get Started Button */}

              <PrimaryBtn text="Get Started" handlePress={handleGetStarted} />
              {/* Optional: Setup Payout if not connected */}
              {!userProfile.stripeConnected && (
                <TouchableOpacity
                  className="border border-purple-600 rounded-[12px] py-4 items-center"
                  onPress={() => router.push("/onboarding/createpayout")}
                >
                  <Text className="text-purple-600 font-semiBold text-base">
                    Set Up Payouts First
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}
