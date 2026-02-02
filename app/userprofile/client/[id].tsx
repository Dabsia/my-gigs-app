import BackBtn from "@/components/BackBtn/BackBtn";
import CreateNewGig from "@/components/CreateNewGig/CreateNewGig";
import GigCard from "@/components/GigCard/GigCard";
import Layout from "@/components/Layout/Layout";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, Trash } from "lucide-react-native";
import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";

// ============================================================================
// TYPES
// ============================================================================

type ProjectStatus = "not_started" | "in_progress" | "completed" | "archived";

interface Project {
  _id: string;
  title?: string;
  name?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  progressPercentage?: number;
  progress?: number;
  format?: string;
  type?: string;
  status?: ProjectStatus;
  totalAmount?: number;
  amountPaid?: number;
  clientId?: string | { _id: string; name?: string };
  clientInfo?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

interface TransformedGig {
  id: string;
  name: string;
  date: string;
  percent: number;
  gigType: string;
  status: string;
  isOverdue: boolean;
  totalAmount: number;
  amountPaid: number;
  clientInfo?: { name: string };
}

interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: string;
  hasOverdue: boolean;
  initials: string;
}

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalRevenue: number;
  totalPaid: number;
}

type TabType = "all" | "active" | "overdue";

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem("auth_token");
  if (!token) throw new Error("You are not logged in");
  return token;
};

// OPTION 1: Use dedicated endpoint for client projects
const fetchClientProjects = async (clientId: string) => {
  const authToken = await getAuthToken();

  // Try dedicated endpoint first, fallback to filtered endpoint
  try {
    // Try /api/projects/client/:clientId if it exists
    const response = await fetch(
      `${API_BASE_URL}/api/projects/client/${clientId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log(
      "Dedicated endpoint not available, trying filtered endpoint..."
    );
  }

  // Fallback to filtered endpoint with query parameter
  const response = await fetch(
    `${API_BASE_URL}/api/project?clientId=${clientId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `Failed to fetch client projects (${response.status})`
    );
  }

  return data;
};

const fetchClientDetails = async (clientId: string) => {
  const authToken = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `Failed to fetch client (${response.status})`
    );
  }

  return data;
};

const deleteClient = async (clientId: string) => {
  const authToken = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to delete client");
  }

  return response;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const transformProjectToGig = (
  project: Project,
  currentClient: Client
): TransformedGig => {
  // Extract client name from project data or use current client
  let clientName = "Client";

  if (project.clientInfo?.name) {
    clientName = project.clientInfo.name;
  } else if (typeof project.clientId === "object" && project.clientId.name) {
    clientName = project.clientId.name;
  } else {
    clientName = currentClient.name;
  }

  const dueDate = project.dueDate ? new Date(project.dueDate) : null;
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

  const isOverdue = dueDate ? dueDate < new Date() : false;

  return {
    id: project._id,
    name: project.title || project.name || "Untitled Project",
    date: displayDate,
    percent: project.progressPercentage || project.progress || 0,
    gigType: project.format || project.type || "personal",
    status: project.status || "active",
    isOverdue: isOverdue,
    totalAmount: project.totalAmount || 0,
    amountPaid: project.amountPaid || 0,
    clientInfo: { name: clientName },
  };
};

const calculateClientStats = (gigs: TransformedGig[]): ClientStats => {
  const activeProjects = gigs.filter(
    (gig) => gig.status === "in_progress" || gig.status === "not_started"
  ).length;

  const completedProjects = gigs.filter(
    (gig) => gig.status === "completed"
  ).length;

  const overdueProjects = gigs.filter(
    (gig) =>
      gig.isOverdue && gig.status !== "completed" && gig.status !== "archived"
  ).length;

  const totalRevenue = gigs.reduce((sum, gig) => sum + gig.totalAmount, 0);
  const totalPaid = gigs.reduce((sum, gig) => sum + gig.amountPaid, 0);

  return {
    totalProjects: gigs.length,
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

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: clientData,
    isLoading: isLoadingClient,
    error: clientError,
    refetch: refetchClient,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: () => fetchClientDetails(id as string),
    enabled: !!id,
  });

  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects,
    isRefetching,
  } = useQuery({
    queryKey: ["clientProjects", id],
    queryFn: () => fetchClientProjects(id as string),
    // queryFn: () => fetchAllProjectsAndFilter(id as string), // Use this if above doesn't work
    enabled: !!id,
  });

  // ============================================================================
  // COMPUTED VALUES - ALL HOOKS BEFORE EARLY RETURNS
  // ============================================================================

  const currentClient = useMemo<Client>(() => {
    const client = clientData?.data || {
      id: id as string,
      name: "Unknown Client",
      company: "Unknown Company",
      email: "",
      phone: "",
      status: "active",
      hasOverdue: false,
      initials: "UC",
    };
    return client;
  }, [clientData?.data, id]);

  const allGigs = useMemo<TransformedGig[]>(() => {
    if (!projectsData?.data || !Array.isArray(projectsData.data)) {
      console.log("No projects data or not an array");
      return [];
    }

    console.log("Raw projects:", projectsData.data.length, "projects");

    const transformedGigs = projectsData.data.map((project: Project) => {
      return transformProjectToGig(project, currentClient);
    });

    return transformedGigs;
  }, [projectsData?.data, currentClient]);

  const filteredGigs = useMemo<TransformedGig[]>(() => {
    let result: TransformedGig[] = [];

    switch (activeTab) {
      case "all":
        result = allGigs;
        break;
      case "active":
        result = allGigs.filter(
          (gig) => gig.status === "in_progress" || gig.status === "not_started"
        );
        break;
      case "overdue":
        result = allGigs.filter(
          (gig) =>
            gig.isOverdue &&
            gig.status !== "completed" &&
            gig.status !== "archived"
        );
        break;
      default:
        result = allGigs;
    }

    return result;
  }, [allGigs, activeTab]);

  const tabStats = useMemo(() => {
    const activeGigs = allGigs.filter(
      (gig) => gig.status === "in_progress" || gig.status === "not_started"
    );
    const overdueGigs = allGigs.filter(
      (gig) =>
        gig.isOverdue && gig.status !== "completed" && gig.status !== "archived"
    );

    return {
      all: allGigs.length,
      active: activeGigs.length,
      overdue: overdueGigs.length,
    };
  }, [allGigs]);

  const clientStats = useMemo<ClientStats>(
    () => calculateClientStats(allGigs),
    [allGigs]
  );

  const onRefresh = useCallback(() => {
    refetchClient();
    refetchProjects();
  }, [refetchClient, refetchProjects]);

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Add queryClient to dependencies// In your ClientProfile component, update the handleDeleteClient function:
  const handleDeleteClient = useCallback(async () => {
    if (allGigs.length > 0) {
      Alert.alert(
        "Cannot Delete Client",
        `This client has ${allGigs.length} project(s). Please delete or reassign the projects before deleting the client.`,
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
          onPress: async () => {
            try {
              await deleteClient(id as string);

              // CRITICAL: Invalidate the clients cache BEFORE navigating back
              queryClient.invalidateQueries({ queryKey: ["clients"] });

              Alert.alert("Success", "Client deleted successfully");
              router.back();
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete client"
              );
            }
          },
        },
      ]
    );
  }, [allGigs.length, currentClient.name, id, router, queryClient]); // Add queryClient to dependencies
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGigItem = useCallback(
    ({ item }: { item: TransformedGig }) => <GigCard item={item} />,
    []
  );

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

    return (
      <View className="py-12 items-center px-4">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Text className="text-gray-400 text-3xl">📂</Text>
        </View>
        <Text className="text-gray-700 font-bold text-lg mb-2">{title}</Text>
        <Text className="text-gray-500 text-center mb-6">{message}</Text>
        {showButton && (
          <TouchableOpacity
            onPress={() => router.push(`/new/gigname?clientId=${id}`)}
            className="bg-primary py-3 px-6 rounded-lg"
          >
            <Text className="text-white font-bold">Create New Project</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [activeTab, id, router]);

  const keyExtractor = useCallback((item: TransformedGig) => item.id, []);

  // ============================================================================
  // EARLY RETURNS FOR LOADING/ERROR STATES
  // ============================================================================

  if (isLoadingClient || isLoadingProjects) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Loading client projects...</Text>
        </View>
      </Layout>
    );
  }

  if (clientError || projectsError) {
    const errorMessage =
      clientError?.message || projectsError?.message || "An error occurred";
    const is404 = errorMessage.includes("404");

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
            <Pressable
              className="mr-4"
              onPress={() =>
                router.push({
                  pathname: "/userprofile/client/edit/",
                  params: {
                    client: JSON.stringify(currentClient),
                  },
                })
              }
            >
              <Pencil fill="#061D3F" size={25} color="#061D3F" />
            </Pressable>
            <Pressable onPress={handleDeleteClient}>
              <Trash fill="red" size={25} color="white" />
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
            <View className="flex-1">
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
                <Text className="text-gray-700 text-sm font-medium">
                  Total Revenue: ${clientStats.totalRevenue.toLocaleString()}
                </Text>
                <Text className="text-green-600 text-sm font-medium">
                  Paid: ${clientStats.totalPaid.toLocaleString()}
                </Text>
              </View>
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
          data={filteredGigs}
          renderItem={renderGigItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
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
        {/* <CreateNewGig location={`new/gigname`} /> */}
        <CreateNewGig location="new/gigname" clientData={currentClient} />
      </View>
    </Layout>
  );
}
