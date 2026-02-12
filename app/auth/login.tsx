import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { API_BASE_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log(email, password);

    try {
      console.log("Attempting login for:", email);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      console.log("Login response:", {
        status: response.status,
        success: data.success,
        message: data.message,
        hasToken: !!data.token,
      });

      if (response.ok && data.success && data.token) {
        if (response.ok && data.success && data.token) {
          // Clear EVERYTHING in AsyncStorage
          await AsyncStorage.clear();

          // Save new data
          await AsyncStorage.setItem("auth_token", data.token);
          await AsyncStorage.setItem("user_data", JSON.stringify(data.user));

          // Force app reload or navigation

          router.replace("/(tabs)");
        }
      } else {
        // Handle specific error messages
        let errorMessage = data.message || "Login failed";

        if (response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (response.status === 400) {
          errorMessage = data.message || "Please check your credentials";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        Alert.alert("Login Failed", errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Check for specific network errors
      if (error.message?.includes("Network request failed")) {
        Alert.alert(
          "Connection Error",
          `Cannot connect to server.\n\nMake sure:\n1. Backend is running\n2. Correct API URL: ${API_BASE_URL}\n3. Network connection is stable`
        );
      } else if (error.message?.includes("JSON")) {
        Alert.alert("Server Error", "Invalid response from server");
      } else {
        Alert.alert("Error", error.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "A password reset link will be sent to your email.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Reset Link",
          onPress: () => {
            // You can implement forgot password flow here
            console.log("Forgot password for:", email);
          },
        },
      ]
    );
  };

  return (
    <Layout>
      <View className="justify-between h-full">
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-8">
            Welcome Back
          </Text>

          {/* Email Input */}
          <Text className="text-gray-700 text-base font-semiBold mt-6 mb-2">
            Email Address
          </Text>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            className="border border-secondary font-regular rounded-lg p-4  text-black"
            placeholder="alex.doe@example.com"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          {/* Password Input */}
          <Text className="text-gray-700 text-base font-semiBold mt-6 mb-2">
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            className="border border-secondary font-regular rounded-lg p-4 text-black "
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={true}
            editable={!loading}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            className="self-end mt-2"
            disabled={loading}
          >
            <Text className="text-blue-600 text-sm">Forgot password?</Text>
          </TouchableOpacity>

          {/* Error/Success Messages */}
          {loading && (
            <View className="mt-4 flex-row items-center">
              <ActivityIndicator size="small" color="#007AFF" />
              <Text className="ml-2 text-gray-600">Logging in...</Text>
            </View>
          )}
        </View>

        {/* Login Button */}
        <View className="mt-10 mb-5">
          {loading ? (
            <TouchableOpacity
              className="bg-primary py-4 rounded-lg items-center justify-center"
              disabled
            >
              <ActivityIndicator color="white" />
            </TouchableOpacity>
          ) : (
            <PrimaryBtn
              handlePress={handleLogin}
              text="Login"
              disabled={!email || !password || loading}
            />
          )}
        </View>
      </View>
    </Layout>
  );
}
