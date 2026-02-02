import BackBtn from "@/components/BackBtn/BackBtn";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { formatDate } from "@/helpers/formatDate";
import { getInitials } from "@/helpers/getInitials";
import { API_BASE_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

export default function GigInformation(): JSX.Element {
  const { gigInfo } = useLocalSearchParams();
  const router = useRouter();

  // State for project data
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Parse initial data from params if available
  const initialGig = gigInfo ? JSON.parse(gigInfo as string) : null;

  const fetchProjectData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      // Get project ID - either from params or from initial data
      const idToFetch = initialGig?._id;

      if (!idToFetch) {
        console.log("No project ID available for fetching");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in again.");
        router.replace("/auth/login");
        return;
      }

      console.log(`Fetching project with ID: ${idToFetch}`);

      const response = await fetch(`${API_BASE_URL}/api/project/${idToFetch}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Project fetch response:", data);

      if (response.ok && data.success) {
        setGig(data.data);
      } else {
        setError(data.message || "Failed to fetch project");

        // If we have initial data, keep showing it
        if (!initialGig && !gig) {
          Alert.alert("Error", data.message || "Failed to load project");
        }
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      setError(error.message || "Network error");

      // If we have initial data, keep showing it
      if (!initialGig && !gig) {
        Alert.alert("Error", "Failed to load project data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    // If we have initial data, use it immediately
    if (initialGig) {
      setGig(initialGig);
    }

    // Always try to fetch fresh data
    fetchProjectData();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, refreshing project data...");
      fetchProjectData(false); // Don't show loading overlay on focus
    }, [])
  );

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchProjectData(false);
  };

  const handleEditProject = () => {
    if (!gig) {
      Alert.alert("Error", "No project data available");
      return;
    }

    router.push({
      pathname: "/giginfo/editgig",
      params: {
        gigInfo: JSON.stringify(gig),
        refreshOnGoBack: "true", // Add this flag to trigger refresh
      },
    });
  };

  // Format project format for display
  const formatProjectFormat = (format: string) => {
    if (!format) return "Not specified";

    const formatMap: Record<string, string> = {
      milestone: "Milestone",
      hourly: "Hourly",
      "full-project": "Full Project",
    };

    const normalizedFormat = format.toLowerCase().replace("_", "-");
    return formatMap[normalizedFormat] || format;
  };

  // Loading state
  if (loading && !gig) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center bg-[#F6F6F1]">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-700">Loading project...</Text>
        </View>
      </Layout>
    );
  }

  // Error state (only show if we don't have initial data)
  if (error && !gig) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center bg-[#F6F6F1] p-4">
          <Text className="text-lg font-semiBold text-red-600 mb-4">
            Error loading project
          </Text>
          <Text className="text-gray-600 text-center mb-6">{error}</Text>
          <PrimaryBtn handlePress={handleRefresh} text="Try Again" />
          <BackBtn title="Go Back" />
        </View>
      </Layout>
    );
  }

  // No project data
  if (!gig) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center bg-[#F6F6F1] p-4">
          <Text className="text-lg font-semiBold text-gray-800 mb-4">
            No project data available
          </Text>
          <PrimaryBtn handlePress={() => router.back()} text="Go Back" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView
        contentContainerClassName="pb-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0000ff"]}
            tintColor="#0000ff"
          />
        }
      >
        <View className="pt-3">
          <BackBtn title="Back" />

          {/* Refresh button */}

          {/* Title Card */}
          <View className="bg-white rounded-xl p-5 my-4 shadow-sm ">
            <Text className="text-[18px] font-textBold text-gray-900 leading-tight">
              {gig.title || "Untitled Project"}
            </Text>
            <Text className="mt-3 text-[12px] font-semiBold text-gray-500">
              Due : {gig.dueDate ? formatDate(gig.dueDate) : "Not set"}
            </Text>
          </View>

          {/* Client */}
          {gig?.clientInfo && (
            <View className="mb-4 ">
              <Text className="text-lg font-semiBold text-gray-800 mb-3">
                Client
              </Text>
              <View className="bg-white rounded-xl p-4 flex-row items-center gap-4 shadow-sm">
                <View className="w-12 h-12 rounded-full bg-gray-800 items-center justify-center">
                  <Text className="text-white font-textBold text-lg">
                    {getInitials(gig.clientInfo.name)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semiBold text-gray-900">
                    {gig.clientInfo.name}
                  </Text>
                  {gig.clientInfo.company && (
                    <Text className="text-sm font-regular text-gray-600">
                      {gig.clientInfo.company}
                    </Text>
                  )}
                  {gig.clientInfo.email && (
                    <Text className="text-xs font-regular text-gray-500 mt-1">
                      {gig.clientInfo.email}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Project Status */}
          {gig.status && (
            <View className="mb-6 ">
              <Text className="text-lg font-semiBold text-gray-800 mb-3">
                Status
              </Text>
              <View className="bg-white rounded-xl p-5 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-semiBold text-gray-600">
                    Current Status
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      gig.status === "completed"
                        ? "bg-green-100"
                        : gig.status === "in_progress"
                        ? "bg-blue-100"
                        : gig.status === "on_hold"
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semiBold ${
                        gig.status === "completed"
                          ? "text-green-800"
                          : gig.status === "in_progress"
                          ? "text-blue-800"
                          : gig.status === "on_hold"
                          ? "text-yellow-800"
                          : "text-gray-800"
                      }`}
                    >
                      {gig.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Project Start Date */}
          <View className="mb-6 ">
            <Text className="text-lg font-semiBold text-gray-800 mb-3">
              Project Dates
            </Text>

            <View className="bg-white rounded-xl p-5 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-semiBold text-gray-600">
                  Start Date
                </Text>
                <Text className="text-base font-regular text-gray-900">
                  {gig.startDate ? formatDate(gig.startDate) : "Not set"}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semiBold text-gray-600">
                  Due Date
                </Text>
                <Text className="text-base font-regular text-gray-900">
                  {gig.dueDate ? formatDate(gig.dueDate) : "Not set"}
                </Text>
              </View>
            </View>
          </View>

          {/* Budget section */}
          <View className="mb-6 ">
            <Text className="text-lg font-semiBold text-gray-800 mb-3">
              Budget
            </Text>

            <View className="bg-white rounded-xl p-5 shadow-sm">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semiBold text-gray-600">
                  Total Budget
                </Text>
                <View>
                  <Text className="text-3xl font-textBold text-gray-900">
                    ${gig.budget || 0}
                  </Text>
                </View>
              </View>

              {gig.startingAmount > 0 && (
                <View className="flex-row justify-between items-center mt-4">
                  <Text className="text-sm font-regular text-gray-600">
                    Starting Amount
                  </Text>
                  <Text className="text-lg font-semiBold text-gray-900">
                    ${gig.startingAmount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Project Details */}
          <View className="mb-6 ">
            <Text className="text-lg font-semiBold text-gray-800 mb-3">
              Project Details
            </Text>
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-sm font-regular text-secondary">
                  Project Format
                </Text>
                <Text className="text-sm font-semiBold text-gray-900">
                  {formatProjectFormat(gig.format)}
                </Text>
              </View>

              {gig.startingAmount > 0 && (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <Text className="text-sm font-regular text-secondary">
                    Starting Amount
                  </Text>
                  <Text className="text-sm font-semiBold text-gray-900">
                    ${gig.startingAmount}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center py-3">
                <Text className="text-sm font-regular text-secondary">
                  Progress
                </Text>
                <Text className="text-sm font-semiBold text-gray-900">
                  {gig.progressPercentage ?? 0}%
                </Text>
              </View>
            </View>
          </View>

          {/* Hourly Rate section */}
          {(gig.format === "hourly" || gig.hourlyRate > 0) && (
            <View className="mb-6 ">
              <Text className="text-lg font-semiBold text-gray-800 mb-3">
                Rate
              </Text>
              <View className="bg-white rounded-xl p-5 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-semiBold text-gray-600">
                    Hourly Rate
                  </Text>
                  <View>
                    <Text className="text-3xl font-textBold text-gray-900">
                      ${gig.hourlyRate || 0}
                    </Text>
                  </View>
                </View>

                {gig.totalHours > 0 && (
                  <View className="flex-row justify-between items-center mt-4">
                    <Text className="text-sm font-regular text-gray-600">
                      Total Hours
                    </Text>
                    <Text className="text-lg font-semiBold text-gray-900">
                      {gig.totalHours} hours
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Milestones section */}
          {gig.format === "milestone" &&
            gig.milestones &&
            gig.milestones.length > 0 && (
              <View className="mb-6 ">
                <Text className="text-lg font-semiBold text-gray-800 mb-3">
                  Milestones
                </Text>
                <View className="bg-white rounded-xl  shadow-sm">
                  {gig.milestones.map((milestone: any, index: number) => (
                    <View
                      className="flex-row justify-between items-center py-5 border-b border-gray-100"
                      key={milestone._id || index}
                    >
                      <View className="flex-1">
                        <Text className="text-[14px] font-semiBold text-gray-900">
                          {milestone.name ||
                            milestone.title ||
                            `Milestone ${index + 1}`}
                        </Text>
                        <Text className="text-sm font-regular text-gray-600 mt-1">
                          Amount: ${milestone.amount || 0}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-semiBold text-gray-900">
                          {milestone.dueDate
                            ? formatDate(milestone.dueDate)
                            : "No due date"}
                        </Text>
                        {milestone.isCompleted && (
                          <Text className="text-xs font-regular text-green-600 mt-1">
                            Completed
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}

                  {/* Milestone Total */}
                  {gig.milestoneTotal !== undefined && (
                    <View className="py-4 border-t border-gray-200">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-semiBold text-gray-900">
                          Total Milestone Value
                        </Text>
                        <Text className="text-lg font-textBold text-primary">
                          ${gig.milestoneTotal}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

          {/* Description */}
          {gig.description && (
            <View className="mb-6 ">
              <Text className="text-lg font-semiBold text-gray-800 mb-3">
                Description
              </Text>
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <Text className="text-sm font-regular text-secondary">
                  {gig.description}
                </Text>
              </View>
            </View>
          )}

          {/* Edit Button */}
          <View className="">
            <PrimaryBtn
              handlePress={handleEditProject}
              text="Edit Project Information"
            />
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}
