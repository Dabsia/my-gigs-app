import BackBtn from "@/components/BackBtn/BackBtn";
import CreateNewGig from "@/components/CreateNewGig/CreateNewGig";
import GigCard from "@/components/GigCard/GigCard";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Personal = () => {
  const { getToken } = useAuth();

  /**
   * Fetch Projects (Authenticated)
   */
  const fetchProjects = async () => {
    const token = await getToken();

    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/api/project/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load projects");
    }

    return data;
  };

  /**
   * React Query
   */
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  const allProjects = projectsData?.data ?? [];

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <SafeAreaView className="bg-[#F6F6F1] flex-1">
        <View className="pt-4 px-4">
          <BackBtn title="Personal Gigs" />
          <View className="mt-10 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="mt-2 text-gray-600">Loading personal gigs...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <SafeAreaView className="bg-[#F6F6F1] flex-1">
        <View className="pt-4 px-4">
          <BackBtn title="Personal Gigs" />
          <View className="mt-10 p-4 bg-red-50 rounded-lg">
            <Text className="text-red-800 font-semiBold">
              Could not load personal projects
            </Text>
            <Text className="text-red-600 mt-1">{error?.message}</Text>
            <Pressable onPress={() => refetch()}>
              <Text className="text-blue-600 mt-2 text-sm">
                {isRefetching ? "Retrying..." : "Tap to retry"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Main Render
   */
  return (
    <SafeAreaView className="bg-[#F6F6F1] flex-1">
      <View className="pt-4 px-4 flex-1">
        <BackBtn title="Personal Gigs" />

        <Text className="font-regular mt-3 text-[16px]">
          Solo Projects ({allProjects.length})
        </Text>

        <View className="mt-8 flex-1">
          {allProjects.length > 0 ? (
            <FlatList
              data={allProjects}
              renderItem={({ item }) => <GigCard item={item} />}
              keyExtractor={(item) => item._id}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View className="pb-20" />}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  colors={["#007AFF"]}
                />
              }
            />
          ) : (
            <View className="items-center justify-center mt-20">
              <Text className="text-gray-500">No personal projects yet.</Text>
            </View>
          )}
        </View>

        <CreateNewGig location="new/gigname" />
      </View>
    </SafeAreaView>
  );
};

export default Personal;
