// app/(tabs)/clients/create-simple.tsx
import BackBtn from "@/components/BackBtn/BackBtn";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService, ClientData } from "@/services/clientService";
import { useRouter } from "expo-router";

export default function CreateClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ClientData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ClientData, string>>
  >({});

  // Update form fields
  const updateFormField = (field: keyof ClientData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: clientService.createClient,
    onSuccess: (data) => {
      // Invalidate clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      router.back();
    },
    onError: (error: Error) => {
      Alert.alert(
        "❌ Error",
        error.message || "Failed to create client. Please try again.",
        [{ text: "OK" }]
      );
    },
  });

  const handleCreateClient = () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validate form
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    // Submit
    createClientMutation.mutate(formData);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Creation",
      "Are you sure you want to cancel? All unsaved changes will be lost.",
      [
        {
          text: "Continue Editing",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Check if form has any data
  const hasFormData = Object.values(formData).some(
    (value) => value.trim() !== ""
  );

  return (
    <Layout>
      <View className="bg-[#F6F6F1] flex-1 h-full">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-9 flex pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Header with back button */}
            <View className="flex-row items-center justify-between mb-4">
              <BackBtn title="Back" onPress={handleCancel} />
              {hasFormData && (
                <TouchableOpacity onPress={handleCancel} className="px-4 py-2">
                  <Text className="text-red-500 font-medium">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Header */}
            <View className="mb-6 mt-2">
              <Text className="text-[24px] font-bold text-gray-900 text-center mb-2">
                Create New Client
              </Text>
            </View>

            {/* Client Name */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Text className="text-base font-semiBold text-gray-700">
                  Client Name
                </Text>
                <Text className="text-red-500 ml-1">*</Text>
              </View>
              <TextInput
                placeholder="Enter client's full name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => updateFormField("name", text)}
                className={`bg-white border font-regular rounded-lg text-black px-5 py-4 text-base ${
                  errors.name ? "border-red-500" : "border-secondary"
                }`}
                autoFocus
                editable={!createClientMutation.isPending}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Text className="text-base font-semiBold text-gray-700">
                  Email Address
                </Text>
                <Text className="text-red-500 ml-1">*</Text>
              </View>
              <TextInput
                placeholder="client@example.com"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => updateFormField("email", text)}
                className={`bg-white border font-regular rounded-lg text-black px-5 py-4 text-base ${
                  errors.email ? "border-red-500" : "border-secondary"
                }`}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!createClientMutation.isPending}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Company Name */}
            <View className="mb-5">
              <Text className="text-base font-semiBold text-gray-700 mb-2">
                Company Name
              </Text>
              <TextInput
                placeholder="Enter company name (optional)"
                placeholderTextColor="#9CA3AF"
                value={formData.company || ""}
                onChangeText={(text) => updateFormField("company", text)}
                className="bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                editable={!createClientMutation.isPending}
              />
            </View>

            {/* Phone Number */}
            <View className="mb-5">
              <Text className="text-base font-semiBold text-gray-700 mb-2">
                Phone Number
              </Text>
              <TextInput
                placeholder="(123) 456-7890 (optional)"
                placeholderTextColor="#9CA3AF"
                value={formData.phone || ""}
                onChangeText={(text) => updateFormField("phone", text)}
                className="bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                keyboardType="phone-pad"
                editable={!createClientMutation.isPending}
              />
            </View>

            {/* Client Address */}
            <View className="mb-5">
              <Text className="text-base font-semiBold text-gray-700 mb-2">
                Client Address
              </Text>
              <TextInput
                multiline
                placeholder="Enter client address (optional)"
                placeholderTextColor="#6B7280"
                value={formData.address || ""}
                onChangeText={(text) => updateFormField("address", text)}
                className="w-full bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base min-h-[100px]"
                textAlignVertical="top"
                editable={!createClientMutation.isPending}
              />
            </View>
          </View>

          {/* Submit Button */}
          <View className="mt-4">
            {createClientMutation.isPending ? (
              <View className="py-4 rounded-lg bg-primary flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white mt-2 text-sm">
                  Creating client...
                </Text>
              </View>
            ) : (
              <PrimaryBtn
                text="Create Client"
                handlePress={handleCreateClient}
                disabled={!formData.name.trim() || !formData.email.trim()}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}
