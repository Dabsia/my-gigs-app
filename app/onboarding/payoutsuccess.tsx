// screens/onboarding/PayoutSuccessScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, CreditCard } from "lucide-react-native";
import Layout from "@/components/Layout/Layout";

export default function PayoutSuccessScreen() {
  const router = useRouter();

  return (
    <Layout>
      <View className="flex-1 bg-white px-4">
        {/* Success Content */}
        <View className="flex-1 justify-center items-center">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <CheckCircle size={40} color="#10B981" />
          </View>

          <Text className="text-2xl font-textBold text-gray-900 text-center mb-3">
            Payout Account Connected!
          </Text>

          <Text className="text-base text-gray-600 font-regular text-center leading-6 mb-8">
            Your Stripe Express account is now connected. You can receive
            payments and create invoices.
          </Text>

          <View className="bg-gray-50 rounded-[12px] p-4 w-full mb-8">
            <View className="flex-row items-center mb-3">
              <CreditCard size={20} color="#6B7280" />
              <Text className="text-sm font-semiBold text-gray-700 ml-2">
                What's next?
              </Text>
            </View>
            <Text className="text-sm text-gray-600 font-regular leading-5">
              • Create your first invoice{"\n"}• Share payment links with
              clients{"\n"}• Get paid within 1-2 business days
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className="bg-purple-600 rounded-[12px] py-4 items-center mb-6"
          //   onPress={() => router.push("/onboarding/complete")}
        >
          <Text className="text-white font-semiBold text-base">
            Continue to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}
