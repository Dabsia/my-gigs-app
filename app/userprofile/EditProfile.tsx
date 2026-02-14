import Avatar from "@/components/Avatar/Avatar";
import BackBtn from "@/components/BackBtn/BackBtn";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { UserData } from "@/interfaces";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Add useQueryClient
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EditProfile() {
  const router = useRouter();
  const queryClient = useQueryClient(); // Add this
  const [user, setUser] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);

  const { getToken } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    phoneNumber: "",
    address: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("Error fetching user data:", text);
        throw new Error(text);
      }

      return res.json();
    },
  });

  // Update user state and form data when data is fetched
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        profession: data.user.profession || "",
        phoneNumber: data.user.phoneNumber || "",
        address: data.user.address || "",
      });
    }
  }, [data]);

  const userData = data?.user;

  const userName = {
    firstName: userData?.name?.split(" ")[0] || "User",
    lastName: userData?.name?.split(" ").slice(1).join(" ") || "",
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Name validation
    if (!formData.name.trim()) {
      errors.push("Name is required");
    } else if (formData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    } else if (formData.name.trim().length > 50) {
      errors.push("Name cannot exceed 50 characters");
    }

    // Profession validation
    if (formData.profession && formData.profession.trim().length > 100) {
      errors.push("Profession cannot exceed 100 characters");
    }

    // Phone validation
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        errors.push("Phone number must have at least 10 digits");
      }
    }

    // Address validation
    if (formData.address && formData.address.trim().length > 500) {
      errors.push("Address cannot exceed 500 characters");
    }

    return errors;
  };

  const handleSave = async () => {
    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        Alert.alert("Validation Error", validationErrors.join("\n"));
        return;
      }

      setSaving(true);

      console.log("Attempting to update profile...");

      // Get fresh token
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        setSaving(false);
        return;
      }

      // Prepare update data
      const updateData: any = {};

      // Only include fields that have changed
      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.profession !== user?.profession)
        updateData.profession = formData.profession;
      if (formData.phoneNumber !== user?.phoneNumber) {
        if (formData.phoneNumber.trim()) {
          // Format phone number
          const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
          updateData.phoneNumber = `+${cleanPhone}`;
        } else {
          updateData.phoneNumber = "";
        }
      }
      if (formData.address !== user?.address)
        updateData.address = formData.address;

      // Check if any changes were made
      if (Object.keys(updateData).length === 0) {
        Alert.alert("No Changes", "No changes detected to save");
        setSaving(false);
        return;
      }

      console.log("Sending update data:", updateData);

      // MAKE THE PATCH REQUEST TO PROFILE URL
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();

      console.log("Update response:", {
        status: response.status,
        success: responseData.success,
        message: responseData.message,
      });

      if (response.ok && responseData.success) {
        // Update local state
        const updatedUser = {
          ...user,
          ...responseData.data,
          id: responseData.data.id,
        } as UserData;

        setUser(updatedUser);

        // Update AsyncStorage
        await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));

        // IMPORTANT: Invalidate the "me" query to refetch data
        await queryClient.invalidateQueries({ queryKey: ["me"] });

        // Navigate back
        router.back();
      } else {
        // Handle specific error messages
        let errorMessage = responseData.message || "Failed to update profile";

        if (response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
        } else if (response.status === 400) {
          errorMessage = responseData.message || "Please check your inputs";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        Alert.alert("Update Failed", errorMessage);
      }
    } catch (error: any) {
      console.error("Save error:", error);

      let errorMessage = "Failed to update profile";

      if (error.message) {
        if (error.message.includes("Network request failed")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Invalid response from server";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <Layout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-600">Loading profile...</Text>
        </View>
      </Layout>
    );
  }

  const name = userName?.firstName + " " + userName?.lastName;

  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row mt-3 items-center">
          <BackBtn title="" />
        </View>

        {/* Profile Image */}
        <View className="items-center mt-6">
          <Avatar
            textSize="40px"
            userName={userName}
            className="w-40 h-40 rounded-full items-center justify-center bg-secondary"
          />

          {/* Use displayName and displayProfession which remain static while typing */}
          <Text className="text-black text-2xl text-center font-semiBold mt-4">
            {name}
          </Text>
          <Text className="text-gray-500 text-center font-regular text-base mt-1">
            {user?.profession || "No profession set"}
          </Text>
        </View>

        {/* Form Fields */}
        <View className="mt-8">
          {/* Full Name */}
          <Text className="text-gray-700 text-base font-semiBold mb-2">
            Full Name *
          </Text>
          <TextInput
            className="border border-secondary font-regular rounded-lg p-4 text-secondary bg-white"
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            editable={!saving}
          />

          {/* Profession */}
          <Text className="text-gray-700 text-base font-semiBold mt-6 mb-2">
            Profession
          </Text>
          <TextInput
            className="border border-secondary font-regular rounded-lg p-4 text-secondary bg-white"
            placeholder="e.g., Software Developer"
            placeholderTextColor="#9CA3AF"
            value={formData.profession}
            onChangeText={(value) => handleInputChange("profession", value)}
            editable={!saving}
          />

          {/* Phone Number */}
          <Text className="text-base font-semiBold text-gray-700 mt-6 mb-2">
            Phone Number
          </Text>
          <TextInput
            placeholder="e.g., 1234567890"
            placeholderTextColor="#9CA3AF"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            className="border border-secondary font-regular rounded-lg p-4 text-secondary bg-white"
            keyboardType="phone-pad"
            editable={!saving}
          />

          {/* Address */}
          <Text className="text-gray-700 text-base font-semiBold mt-6 mb-2">
            Address
          </Text>
          <TextInput
            multiline
            placeholder="Enter your address"
            placeholderTextColor="#6B7280"
            className="w-full bg-white border border-secondary font-regular rounded-lg p-4 text-black px-5 py-4 text-base min-h-[120px]"
            textAlignVertical="top"
            value={formData.address}
            onChangeText={(value) => handleInputChange("address", value)}
            editable={!saving}
          />
        </View>

        {/* Save Button */}
        <View className="mt-10 mb-5">
          <PrimaryBtn
            handlePress={handleSave}
            text={saving ? "Saving..." : "Save Changes"}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </Layout>
  );
}
