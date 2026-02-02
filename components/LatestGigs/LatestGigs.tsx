import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import GigCard from "../GigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";
import { useRouter } from "expo-router";

const LatestGigs = () => {
  const router = useRouter();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Delay the initial fetch to avoid race conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldFetch(true);
      setIsInitialLoad(false);
    }, 1000); // 1 second delay for initial load

    return () => clearTimeout(timer);
  }, []);

  const fetchProjects = async () => {
    // Add a small delay before fetching
    await new Promise((resolve) => setTimeout(resolve, 300));

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
      const errorMessage =
        errorData.message || `Server error: ${response.status}`;

      // If 404, try plural endpoint as fallback
      if (response.status === 404) {
        try {
          const altResponse = await fetch(`${API_BASE_URL}/api/projects`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.success) {
              return altData;
            }
          }
        } catch (altError) {
          console.log("Alternative endpoint also failed");
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load projects");
    }

    return data;
  };

  // Only fetch when shouldFetch is true
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
    isRefetching,
    isError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    enabled: shouldFetch, // CRITICAL: Only fetch when ready
    retry: 2,
    retryDelay: 2000,
  });

  // Get all projects and limit to 5
  const allProjects = projectsData?.success ? projectsData.data : [];
  const limitedProjects = allProjects.slice(0, 5);
  const totalProjects = allProjects.length;

  // Show initial loading state
  if (isInitialLoad) {
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
      <View className="mt-10 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-2 text-gray-600">Loading latest gigs...</Text>
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
