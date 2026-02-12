import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GigCard from "../GigCard/GigCard";

const LatestGigs = () => {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchProjects = async () => {
    const authToken = await getToken();
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

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load projects");
    }

    return data;
  };

  // Only fetch when Clerk is loaded AND user is signed in
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
    isRefetching,
    isError,
  } = useQuery({
    queryKey: ["projects-latest"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    enabled: isLoaded && isSignedIn, // CRITICAL: Only fetch when Clerk is ready AND user is authenticated
    retry: 2,
    retryDelay: 2000,
  });

  // Get all projects and limit to 5
  const allProjects = projectsData?.success ? projectsData.data : [];
  const limitedProjects = allProjects.slice(0, 5);
  const totalProjects = allProjects.length;

  // Show Clerk initialization state
  if (!isLoaded) {
    return (
      <View className="mt-10 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-2 text-gray-600">Initializing...</Text>
      </View>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <View className="mt-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-semiBold text-[16px]">Latest Gigs</Text>
        </View>
        <View className="items-center justify-center py-8 bg-gray-50 rounded-lg">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-2 text-gray-600">Loading latest gigs...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (isError) {
    const isNetworkError =
      error?.message?.includes("Network") ||
      error?.message?.includes("Failed to fetch");
    const isAuthError = error?.message?.includes("logged in");

    return (
      <View className="mt-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-semiBold text-[16px]">Latest Gigs</Text>
        </View>

        <View className="p-4 bg-red-50 rounded-lg border border-red-100">
          <Text className="text-red-800 font-semiBold text-center">
            {isAuthError
              ? "Authentication Required"
              : isNetworkError
              ? "Network Error"
              : "Could not load projects"}
          </Text>

          <Text className="text-red-600 mt-2 text-center">
            {isAuthError
              ? "Please log in to view projects"
              : isNetworkError
              ? "Check your internet connection"
              : error?.message || "An unexpected error occurred"}
          </Text>

          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 bg-red-100 py-3 rounded-lg"
            disabled={isRefetching}
          >
            {isRefetching ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#DC2626" />
                <Text className="text-red-700 ml-2 font-medium">
                  Retrying...
                </Text>
              </View>
            ) : (
              <Text className="text-red-700 font-medium text-center">
                Try Again
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show empty state
  if (totalProjects === 0) {
    return (
      <View className="mt-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-semiBold text-[16px]">Latest Gigs</Text>
        </View>

        <View className="py-12 items-center bg-gray-50 rounded-lg border border-gray-200">
          <Text className="text-gray-700 font-medium mb-1">
            No projects found
          </Text>
          <Text className="text-gray-500 text-sm mb-4">
            Get started by creating your first project
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/new/gigname")}
            className="bg-primary py-3 px-6 rounded-lg"
          >
            <Text className="text-white font-medium">Create New Project</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render the main list
  return (
    <View className="mt-10">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semiBold text-[16px]">Latest Gigs</Text>
        {totalProjects > 5 && (
          <TouchableOpacity
            onPress={() => router.push("/personalgigs/personal")}
          >
            <Text className="text-blue-600 font-semiBold text-sm">
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={limitedProjects}
        renderItem={({ item }) => <GigCard item={item} />}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        className="mb-6"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      />
    </View>
  );
};

export default LatestGigs;
