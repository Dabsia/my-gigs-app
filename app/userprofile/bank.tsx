import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { Shield } from "lucide-react-native";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";

type BankDetails = {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
};

export default function BankDetailsScreen() {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
  });

  const handleSave = () => {
    if (!bankDetails.accountHolderName.trim()) {
      Alert.alert("Error", "Please enter account holder name");
      return;
    }
    if (!bankDetails.accountNumber.trim()) {
      Alert.alert("Error", "Please enter account number");
      return;
    }
    if (!bankDetails.routingNumber.trim()) {
      Alert.alert("Error", "Please enter routing number");
      return;
    }

    Alert.alert("Success", "Bank details saved successfully");
    console.log("Bank details:", bankDetails);
  };

  const updateBankDetails = (field: keyof BankDetails, value: string) => {
    setBankDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Layout>
      <View className="flex-1">
        {/* Header */}
        <View className="pt-4 pb-4 border-b border-gray-200">
          <View className="mb-4">
            <BackBtn title="Bank Account Details" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Account Holder Name */}
          <View className="py-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Account Holder Name
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-[12px] px-4 py-4 text-gray-900 font-regular text-base"
              placeholder="Enter full name"
              placeholderTextColor="#9CA3AF"
              value={bankDetails.accountHolderName}
              onChangeText={(text) =>
                updateBankDetails("accountHolderName", text)
              }
              autoCapitalize="words"
            />
          </View>

          {/* Account Number and Routing Number */}
          <View className="pb-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-4">
              Bank Information
            </Text>

            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 font-regular mb-2">
                  Account Number
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-[12px] px-4 py-4 text-gray-900 font-regular text-base"
                  placeholder="Enter account number"
                  placeholderTextColor="#9CA3AF"
                  value={bankDetails.accountNumber}
                  onChangeText={(text) =>
                    updateBankDetails("accountNumber", text)
                  }
                  keyboardType="numeric"
                  maxLength={20}
                />
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-gray-700 font-regular mb-2">
                  Routing Number
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-[12px] px-4 py-4 text-gray-900 font-regular text-base"
                  placeholder="Enter routing number"
                  placeholderTextColor="#9CA3AF"
                  value={bankDetails.routingNumber}
                  onChangeText={(text) =>
                    updateBankDetails("routingNumber", text)
                  }
                  keyboardType="numeric"
                  maxLength={9}
                />
              </View>
            </View>
          </View>

          {/* Security Note */}
          <View className="pb-6">
            <View className="bg-blue-50 rounded-[12px] p-4 border border-blue-200">
              <View className="flex-row items-start">
                <Shield size={20} color="#3B82F6" className="mr-3 mt-0.5" />
                <Text className="text-blue-800 text-sm font-regular flex-1">
                  Your bank information is securely encrypted
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View className="">
            <PrimaryBtn text="Save Payment Method" handlePress={handleSave} />
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}
