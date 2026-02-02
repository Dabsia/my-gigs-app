import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import GigCard from "@/components/GigCard/GigCard";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CreateNewGig from "@/components/CreateNewGig/CreateNewGig";
import BackBtn from "@/components/BackBtn/BackBtn";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";
import { RefreshControl } from "react-native";

// Service function to fetch projects
const fetchProjects = async () => {
  const authToken = await AsyncStorage.getItem("auth_token");
  if (!authToken) {
    throw new Error("You are not logged in");
  }

  const response = await fetch(`${API_BASE_URL}/api/project/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to load projects");
  }

  return data;
};

// Filter function to get personal projects only
const filterPersonalProjects = (projects) => {
  if (!projects || !Array.isArray(projects)) return [];

  // Filter for personal projects (projects without client or with personal type)
  return projects.filter((project) => {
    // Check if project has no client assigned
    const hasNoClient = !project.clientId && !project.clientInfo;

    // Check if project is marked as personal type
    const isPersonalType =
      project.format === "personal" || project.type === "personal";

    // Return projects that are either personal type or have no client
    return isPersonalType || hasNoClient;
  });
};

const Personal = () => {
  const router = useRouter();

  // Fetch projects using React Query
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["projects"], // Cache key
    queryFn: fetchProjects, // Fetch function
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Get all projects and filter for personal ones
  const allProjects = projectsData?.success ? projectsData.data : [];
  const personalProjects = filterPersonalProjects(allProjects);

  // Render loading state
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

  // Render error state
  if (error) {
    return (
      <SafeAreaView className="bg-[#F6F6F1] flex-1">
        <View className="pt-4 px-4">
          <BackBtn title="Personal Gigs" />
          <View className="mt-10 p-4 bg-red-50 rounded-lg">
            <Text className="text-red-800 font-semiBold">
              Could not load personal projects
            </Text>
            <Text className="text-red-600 mt-1">{error.message}</Text>
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

  return (
    <SafeAreaView className="bg-[#F6F6F1] flex-1">
      <View className="pt-4 px-4 flex-1">
        <BackBtn title="Personal Gigs" />

        <Text className="font-regular mt-3 text-[16px]">
          Solo Projects ({allProjects.length})
        </Text>

        <View className="mt-8 flex-1">
          {allProjects.length > 0 && (
            <FlatList
              data={allProjects}
              renderItem={({ item }) => <GigCard item={item} />}
              keyExtractor={(item) => item._id}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View className="pb-20" />}
              // Optional: Add pull-to-refresh
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  colors={["#007AFF"]}
                />
              }
            />
          )}
        </View>

        <CreateNewGig location="new/gigname" />
      </View>
    </SafeAreaView>
  );
};

export default Personal;
