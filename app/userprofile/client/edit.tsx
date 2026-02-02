// app/(tabs)/clients/edit-client.tsx
import BackBtn from "@/components/BackBtn/BackBtn";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService } from "@/services/clientService";

export default function EditClient() {
  const router = useRouter();
  const { id: clientId } = useLocalSearchParams();
  const { client } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Parse and use the client data passed from the previous screen
  const clientInfo = client ? JSON.parse(client as string) : null;

  // Populate form with client data only once on mount
  useEffect(() => {
    if (clientInfo) {
      console.log("Client data received:", clientInfo);
      setClientName(clientInfo.name || "");
      setEmail(clientInfo.email || "");
      setCompany(clientInfo.company || "");
      setPhone(clientInfo.phone || "");
      setAddress(clientInfo.address || "");
      setIsLoading(false);
    } else {
      // If no client data was passed, fetch it
      console.log("No client data passed, would need to fetch from API");
      Alert.alert("Error", "Client data not found", [
        {
          text: "Go Back",
          onPress: () => router.back(),
        },
      ]);
    }
  }, []); // Empty dependency array - run only once on mount

  // Mutation for updating client
  const updateClientMutation = useMutation({
    mutationFn: (updateData: any) =>
      clientService.updateClient(
        clientInfo?._id || (clientId as string),
        updateData
      ),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch client list and this client
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });

        // Also invalidate the client profile page queries
        queryClient.invalidateQueries({
          queryKey: ["client", clientInfo?._id],
        });

        Alert.alert("Success", "Client updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to update client");
      }
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update client");
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const handleEditClient = async () => {
    // Validate inputs
    if (!clientName.trim()) {
      Alert.alert("Error", "Please enter client name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter client email");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsSaving(true);

    const updateData = {
      name: clientName.trim(),
      email: email.trim(),
      company: company.trim() || undefined, // Send as undefined if empty
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      status: clientInfo?.status || "active", // Keep existing status
    };

    console.log("Updating client with data:", updateData);

    // Call the mutation
    updateClientMutation.mutate(updateData);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Loading client data...</Text>
        </View>
      </Layout>
    );
  }

  // Client not found or no data
  if (!clientInfo) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center p-4">
          <View className="bg-red-50 p-6 rounded-xl w-full max-w-md">
            <Text className="text-red-800 font-bold text-lg text-center mb-2">
              Client Data Not Found
            </Text>
            <Text className="text-red-600 text-center mb-4">
              Could not load client information
            </Text>
            <PrimaryBtn text="Go Back" handlePress={() => router.back()} />
          </View>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View className="bg-[#F6F6F1] flex-1 h-full">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-9 justify-between flex pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <BackBtn title="Back" onPress={() => router.back()} />

            {/* Header */}
            <View className="mb-6 mt-6">
              <Text className="text-[18px] mt-3 font-semiBold text-center mb-8">
                Edit {clientInfo?.name || "Client"}
              </Text>

              {/* Client Name */}
              <View className="mb-4">
                <Text className="text-base font-semiBold text-gray-700 mb-2">
                  Client Name *
                </Text>
                <TextInput
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                  value={clientName}
                  onChangeText={setClientName}
                  className="bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                  autoFocus
                  editable={!isSaving}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-base font-semiBold text-gray-700 mb-2">
                  Email Address *
                </Text>
                <TextInput
                  placeholder="client@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  className="bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>

              {/* Company Name */}
              <View className="mb-4">
                <Text className="text-base font-semiBold text-gray-700 mb-2">
                  Company Name
                </Text>
                <TextInput
                  placeholder="Enter company name"
                  placeholderTextColor="#9CA3AF"
                  value={company}
                  onChangeText={setCompany}
                  className="bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                  editable={!isSaving}
                />
              </View>

              {/* Phone Number */}
              <View className="mb-4">
                <Text className="text-base font-semiBold text-gray-700 mb-2">
                  Phone Number
                </Text>
                <TextInput
                  placeholder="(123) 456-7890"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  className="bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              {/* Address */}
              <View className="mb-6">
                <Text className="text-gray-700 text-base font-semiBold mb-2">
                  Client Address
                </Text>
                <TextInput
                  multiline
                  placeholder="Enter client address"
                  placeholderTextColor="#6B7280"
                  value={address}
                  onChangeText={setAddress}
                  className="w-full bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base min-h-[120px]"
                  textAlignVertical="top"
                  editable={!isSaving}
                />
              </View>
            </View>
          </View>

          <View className="mt-4">
            <PrimaryBtn
              text={isSaving ? "Saving..." : "Save Changes"}
              handlePress={handleEditClient}
              disabled={isSaving}
            />
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}
