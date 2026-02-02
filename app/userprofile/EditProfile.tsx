import BackBtn from "@/components/BackBtn/BackBtn";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { getInitials } from "@/helpers/getInitials";
import { UserData } from "@/interfaces";
import { API_BASE_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");

      if (userData) {
        const parsedUser: UserData = JSON.parse(userData);
        setUser(parsedUser);

        // Initialize form with current user data
        setFormData({
          name: parsedUser.name || "",
          profession: parsedUser.profession || "",
          phoneNumber: parsedUser.phoneNumber || "",
          address: parsedUser.address || "",
        });

        // Set display values (won't change while typing)
        // setDisplayName(parsedUser.name || "");
        // setDisplayProfession(parsedUser.profession || "");

        console.log("User loaded:", parsedUser);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
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

      // Get auth token
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in again.");
        router.replace("/auth/login");
        return;
      }

      console.log("Attempting to update profile...");

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

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      console.log("Update response:", {
        status: response.status,
        success: data.success,
        message: data.message,
      });

      if (response.ok && data.success) {
        // Update local state
        const updatedUser = {
          ...user,
          ...data.data,
          id: data.data.id || user?.id,
        } as UserData;

        setUser(updatedUser);

        // Update display values after successful save
        // setDisplayName(formData.name);
        // setDisplayProfession(formData.profession || "");

        // Update AsyncStorage
        await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));

        Alert.alert("Success", "Profile updated successfully!");

        // Navigate back
        router.back();
      } else {
        // Handle specific error messages
        let errorMessage = data.message || "Failed to update profile";

        if (response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
          // Clear storage and redirect to login
          await AsyncStorage.clear();
          router.replace("/auth/login");
        } else if (response.status === 400) {
          errorMessage = data.message || "Please check your inputs";
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
    // Note: We DON'T update displayName or displayProfession here
    // They will only update after successful save
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        profession: user.profession || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
    router.back();
  };

  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row mt-3 items-center">
          <BackBtn title="" onPress={handleCancel} />
        </View>

        {/* Profile Image */}
        <View className="items-center mt-6">
          <View className="relative">
            <View className="w-40 h-40 rounded-full items-center justify-center bg-secondary">
              <Text className="text-white font-textBold text-[32px]">
                {/* Use displayName which doesn't change while typing */}
                {getInitials(user?.name)}
              </Text>
            </View>
          </View>

          {/* Use displayName and displayProfession which remain static while typing */}
          <Text className="text-black text-2xl text-center font-semiBold mt-4">
            {user?.name}
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
          {saving ? (
            <TouchableOpacity
              className="bg-primary py-4 flex-row rounded-lg items-center justify-center"
              disabled
            >
              <ActivityIndicator color="white" />
              <Text className="text-white ml-2">Saving...</Text>
            </TouchableOpacity>
          ) : (
            <PrimaryBtn
              handlePress={handleSave}
              text="Save Changes"
              disabled={saving}
            />
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}
