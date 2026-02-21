import BackBtn from "@/components/BackBtn/BackBtn";
import CreateNewGig from "@/components/CreateNewGig/CreateNewGig";
import GigCard from "@/components/GigCard/GigCard";
import Layout from "@/components/Layout/Layout";
import { Client, ClientStats, Project, TabType } from "@/interfaces";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, Trash } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ============================================================================
// INTERFACES
// ============================================================================

interface ClientProjectsResponse {
  success: boolean;
  client: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
  };
  stats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    totalRevenue: number;
    totalPaid: number;
  };
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Project[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateClientStats = (projects: any[]): ClientStats => {
  const activeProjects = projects.filter(
    (project) =>
      project.status === "in_progress" || project.status === "not_started"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  ).length;

  const overdueProjects = projects.filter((project) => {
    const dueDate = project.dueDate ? new Date(project.dueDate) : null;
    const isOverdue = dueDate ? dueDate < new Date() : false;
    return (
      isOverdue &&
      project.status !== "completed" &&
      project.status !== "archived"
    );
  }).length;

  const totalRevenue = projects.reduce(
    (sum, project) => sum + (project.totalAmount || 0),
    0
  );
  const totalPaid = projects.reduce(
    (sum, project) => sum + (project.amountPaid || 0),
    0
  );

  return {
    totalProjects: projects.length,
    activeProjects,
    completedProjects,
    overdueProjects,
    totalRevenue,
    totalPaid,
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientProfile() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // ============================================================================
  // API FUNCTION - Get client details and projects in one call
  // ============================================================================

  const fetchClientData = async (): Promise<{
    client: Client;
    projects: Project[];
    stats: ClientStats;
  }> => {
    const token = await getToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/api/project/client/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data: ClientProjectsResponse = await response.json();
    console.log("daygdsjh", data);

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to fetch client data (${response.status})`
      );
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch client data");
    }

    // Transform the client data from the response
    const client: Client = {
      id: data.client.id,
      name: data.client.name,
      address: data.client.address,
      company: data.client.company || "",
      email: data.client.email || "",
      phone: data.client.phone || "",
      status: "active",
      hasOverdue: data.stats.overdue > 0,
      initials: data.client.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
    };

    // Transform stats
    const stats: ClientStats = {
      totalProjects: data.stats.total,
      activeProjects: data.stats.active,
      completedProjects: data.stats.completed,
      overdueProjects: data.stats.overdue,
      totalRevenue: data.stats.totalRevenue,
      totalPaid: data.stats.totalPaid,
    };

    return {
      client,
      projects: data.data,
      stats,
    };
  };

  // ============================================================================
  // DELETE CLIENT FUNCTION
  // ============================================================================

  const deleteClient = async (): Promise<void> => {
    const token = await getToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete client");
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to delete client");
    }

    return data;
  };

  // ============================================================================
  // REACT QUERY HOOKS
  // ============================================================================

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["client-data", id],
    queryFn: fetchClientData,
    enabled: !!id,
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client-data", id] });

      Alert.alert("Success", "Client deleted successfully");
      router.back();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to delete client");
    },
  });

  // ============================================================================
  // HANDLER FOR REFRESHING AFTER PROJECT CREATION
  // ============================================================================

  const handleProjectCreated = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["client-data", id],
    });
  }, [queryClient, id]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentClient = useMemo<Client>(() => {
    return (
      data?.client || {
        id: id as string,
        _id: id as string,
        name: "Unknown Client",
        company: "Unknown Company",
        email: "",
        address: "",
        phone: "",
        status: "active",
        hasOverdue: false,
        initials: "UC",
      }
    );
  }, [data, id]);

  // Enhanced projects with computed fields for display
  const enhancedProjects = useMemo<any[]>(() => {
    if (!data?.projects || !Array.isArray(data.projects)) return [];

    return data.projects.map((project) => {
      // Calculate days remaining
      const dueDate = project.dueDate ? new Date(project.dueDate) : null;
      const daysRemaining = dueDate
        ? Math.ceil(
            (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      // Check if overdue
      const isOverdue = dueDate ? dueDate < new Date() : false;

      // Create display date
      const displayDate = dueDate
        ? dueDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : new Date(
            project.createdAt || project.updatedAt || Date.now()
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

      // Calculate remaining amount
      const remainingAmount =
        (project.totalAmount || 0) - (project.amountPaid || 0);

      console.log("currrrent", currentClient);

      // Ensure client object exists in the format GigCard expects
      const clientObject = project.client || {
        id: currentClient.id,
        name: currentClient.name,
        email: currentClient.email,
        phone: currentClient.phone,
        company: currentClient.company,
        address: currentClient.address,
      };

      console.log("skjds", clientObject);

      // Return the full project with all original data plus computed fields
      return {
        ...project,
        // Add computed fields
        date: displayDate,
        isOverdue,
        daysRemaining,
        remainingAmount,
        // Ensure client is properly set
        client: clientObject,
        // Ensure id is available (some components might use id, some might use _id)
        id: project._id,
      };
    });
  }, [data?.projects, currentClient]);

  // Filter projects based on active tab
  const filteredProjects = useMemo<any[]>(() => {
    switch (activeTab) {
      case "active":
        return enhancedProjects.filter(
          (p) => p.status === "in_progress" || p.status === "not_started"
        );
      case "overdue":
        return enhancedProjects.filter(
          (p) =>
            p.isOverdue && p.status !== "completed" && p.status !== "archived"
        );
      default:
        return enhancedProjects;
    }
  }, [enhancedProjects, activeTab]);

  // Tab statistics
  const tabStats = useMemo(() => {
    return {
      all: enhancedProjects.length,
      active: enhancedProjects.filter(
        (p) => p.status === "in_progress" || p.status === "not_started"
      ).length,
      overdue: enhancedProjects.filter(
        (p) =>
          p.isOverdue && p.status !== "completed" && p.status !== "archived"
      ).length,
    };
  }, [enhancedProjects]);

  // Client statistics
  const clientStats = useMemo<ClientStats>(() => {
    if (data?.stats) {
      return data.stats;
    }
    return calculateClientStats(enhancedProjects);
  }, [data?.stats, enhancedProjects]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTabPress = useCallback((tab: TabType) => setActiveTab(tab), []);

  const handleDeleteClient = useCallback(async () => {
    if (enhancedProjects.length > 0) {
      Alert.alert(
        "Cannot Delete Client",
        `This client has ${enhancedProjects.length} project(s). Delete or reassign projects first.`,
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    Alert.alert(
      "Delete Client",
      `Are you sure you want to delete ${currentClient.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteClientMutation.mutate(),
        },
      ]
    );
  }, [enhancedProjects.length, currentClient.name, deleteClientMutation]);

  const handleEditClient = useCallback(() => {
    router.push({
      pathname: "/userprofile/client/edit/",
      params: { client: JSON.stringify(currentClient) },
    });
  }, [currentClient, router]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderGigItem = useCallback(({ item }: { item: any }) => {
    return <GigCard item={item} />;
  }, []);

  const keyExtractor = useCallback((item: any) => item._id || item.id, []);

  const renderEmptyState = useCallback(() => {
    const emptyStates = {
      all: {
        title: "No Projects Found",
        message: "This client doesn't have any projects yet",
        showButton: true,
      },
      active: {
        title: "No Active Projects",
        message: "This client doesn't have any active projects",
        showButton: true,
      },
      overdue: {
        title: "No Overdue Projects",
        message: "Great! This client has no overdue projects",
        showButton: false,
      },
    };
    const { title, message, showButton } = emptyStates[activeTab];

    useFocusEffect(
      useCallback(() => {
        // Refetch data when the screen comes into focus
        refetch();
      }, [refetch])
    );

    return (
      <View className="py-12 items-center px-4">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Text className="text-gray-400 text-3xl">📂</Text>
        </View>
        <Text className="text-gray-700 font-semiBold text-lg mb-2">
          {title}
        </Text>
        <Text className="text-gray-500 text-center font-aeonikRegular mb-6">
          {message}
        </Text>
      </View>
    );
  }, [activeTab, id, router]);

  // ============================================================================
  // LOADING STATES
  // ============================================================================

  if (isLoading) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Loading client data...</Text>
        </View>
      </Layout>
    );
  }

  if (error) {
    const errorMessage = error.message || "An error occurred";
    const is404 =
      errorMessage.includes("404") || errorMessage.includes("not found");

    return (
      <Layout>
        <View className="flex-1 justify-center items-center py-8 px-4">
          <View
            className={`${
              is404 ? "bg-yellow-50" : "bg-red-50"
            } p-6 rounded-xl w-full max-w-md`}
          >
            <Text
              className={`${
                is404 ? "text-yellow-800" : "text-red-800"
              } font-bold text-lg text-center mb-2`}
            >
              {is404 ? "Client Not Found" : "Failed to Load Client Data"}
            </Text>
            <Text
              className={`${
                is404 ? "text-yellow-600" : "text-red-600"
              } text-center mb-4`}
            >
              {is404
                ? "This client doesn't exist or has been deleted."
                : errorMessage}
            </Text>
            <TouchableOpacity
              onPress={is404 ? () => router.back() : onRefresh}
              className={`${
                is404 ? "bg-yellow-100" : "bg-red-100"
              } py-3 rounded-lg`}
            >
              <Text
                className={`${
                  is404 ? "text-yellow-700" : "text-red-700"
                } font-medium text-center`}
              >
                {is404 ? "Go Back" : "Try Again"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Layout>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Layout>
      <View className="flex-1">
        {/* Header */}
        <View className="my-3 flex-row justify-between items-center">
          <BackBtn title={currentClient.name} />
          <View className="flex-row">
            <Pressable className="mr-4" onPress={handleEditClient}>
              <Pencil fill="#061D3F" size={25} color="#061D3F" />
            </Pressable>
            <Pressable
              onPress={handleDeleteClient}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? (
                <ActivityIndicator size="small" color="red" />
              ) : (
                <Trash fill="red" size={25} color="white" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Client Info Card */}
        <View className="bg-white p-4 rounded-lg mb-4 border border-gray-100">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-gray-500 text-sm font-regular">
                Company
              </Text>
              <Text className="text-gray-900 font-semiBold text-base mt-1">
                {currentClient.company || "No company specified"}
              </Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-500 text-sm font-regular">Email</Text>
              <Text className="text-gray-900 font-semiBold text-base mt-1">
                {currentClient.email || "No email"}
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-500 text-sm font-regular">Phone</Text>
            <Text className="text-gray-900 font-semiBold text-base mt-1">
              {currentClient.phone || "No phone number"}
            </Text>
          </View>

          {/* Stats Badges */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className="bg-blue-50 rounded-lg px-3 py-1">
              <Text className="text-blue-600 font-medium text-xs">
                {clientStats.totalProjects} Total
              </Text>
            </View>
            {clientStats.activeProjects > 0 && (
              <View className="bg-green-50 rounded-lg px-3 py-1">
                <Text className="text-green-600 font-medium text-xs">
                  {clientStats.activeProjects} Active
                </Text>
              </View>
            )}
            {clientStats.completedProjects > 0 && (
              <View className="bg-purple-50 rounded-lg px-3 py-1">
                <Text className="text-purple-600 font-medium text-xs">
                  {clientStats.completedProjects} Completed
                </Text>
              </View>
            )}
            {clientStats.overdueProjects > 0 && (
              <View className="bg-red-50 rounded-lg px-3 py-1">
                <Text className="text-red-600 font-medium text-xs">
                  {clientStats.overdueProjects} Overdue
                </Text>
              </View>
            )}
          </View>

          {/* Financial Summary */}
          {clientStats.totalRevenue > 0 && (
            <View className="pt-3 border-t border-gray-100">
              <Text className="text-gray-500 text-sm font-regular mb-1">
                Financial Summary
              </Text>
              <View className="flex-row justify-between">
                <Text className="text-gray-700 text-sm font-aeonikRegular">
                  Total Revenue: ${clientStats.totalRevenue.toLocaleString()}
                </Text>
                <Text className="text-green-600 text-sm font-aeonikRegular">
                  Paid: ${clientStats.totalPaid.toLocaleString()}
                </Text>
              </View>
              {clientStats.totalRevenue - clientStats.totalPaid > 0 && (
                <Text className="text-red-600 text-sm font-aeonikRegular mt-1">
                  Outstanding: $
                  {(
                    clientStats.totalRevenue - clientStats.totalPaid
                  ).toLocaleString()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row mt-4 border-b border-gray-200">
          {(["all", "active", "overdue"] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              className="pb-3 border-b-2 mr-6"
              style={{
                borderBottomColor:
                  activeTab === tab ? "#3B82F6" : "transparent",
              }}
              onPress={() => handleTabPress(tab)}
            >
              <View className="flex-row items-center">
                <Text
                  className={`font-semiBold text-base ${
                    activeTab === tab ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
                {tabStats[tab] > 0 && (
                  <View
                    className={`ml-2 ${
                      tab === "all"
                        ? "bg-blue-100"
                        : tab === "active"
                        ? "bg-green-100"
                        : "bg-red-100"
                    } rounded-full px-2 py-0.5`}
                  >
                    <Text
                      className={`${
                        tab === "all"
                          ? "text-blue-600"
                          : tab === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      } text-xs font-medium`}
                    >
                      {tabStats[tab]}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Projects List */}
        <FlatList
          data={filteredProjects}
          renderItem={renderGigItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 80,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />

        {/* Create New Project Button */}
        <CreateNewGig
          location="new/gigname"
          clientData={currentClient}
          onSuccess={handleProjectCreated}
        />
      </View>
    </Layout>
  );
}
