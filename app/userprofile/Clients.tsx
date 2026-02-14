// app/(tabs)/clients/index.tsx
import BackBtn from "@/components/BackBtn/BackBtn";
import CreateNewGig from "@/components/CreateNewGig/CreateNewGig";
import Layout from "@/components/Layout/Layout";
import { getInitials } from "@/helpers/getInitials";
import { clientService } from "@/services/clientService";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Added useQueryClient
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Color palette for client avatars
const CLIENT_COLORS = [
  "#E9D5FF", // Lavender
  "#CCFBF1", // Mint
  "#FEE2E2", // Light red
  "#DBEAFE", // Light blue
  "#FEF3C7", // Light yellow
  "#D1FAE5", // Light green
  "#E0E7FF", // Light indigo
  "#FCE7F3", // Light pink
];

const getClientColor = (clientId: string): string => {
  let hash = 0;
  for (let i = 0; i < clientId.length; i++) {
    hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CLIENT_COLORS.length;
  return CLIENT_COLORS[index];
};

interface ClientItem {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectsCount?: number;
  hasOverdueInvoices?: boolean;
  status?: "active" | "inactive";
  createdAt?: string;
  initials: string;
  color: string;
}

const Clients = () => {
  const router = useRouter();
  const queryClient = useQueryClient(); // Added queryClient
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { getToken } = useAuth(); // ✅ hook at top level
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      setToken(token);
    };
    fetchToken();
  }, [getToken]);

  // Fetch clients using React Query
  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getClients(token),
    staleTime: 5 * 60 * 1000,
  });

  // Transform API data to match UI interface
  const clients: ClientItem[] = useMemo(() => {
    if (!clientsData?.success) return [];

    return clientsData.data.map((client: any) => ({
      _id: client._id,
      id: client._id, // For backward compatibility
      name: client.name,
      company: client.company || "No company",
      email: client.email,
      phone: client.phone || "No phone",
      projectsCount: client.projectsCount || 0,
      hasOverdueInvoices: client.hasOverdueInvoices || false,
      status: client.projectsCount > 0 ? "active" : "inactive",
      initials: getInitials(client.name),
      color: getClientColor(client._id),
    }));
  }, [clientsData]);

  // Handle pull-to-refresh - UPDATED to use queryClient
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // First invalidate the cache to force fresh data
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Then refetch
      await refetch();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, refetch]);

  // Filter clients based on search query and active tab
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search filter
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.company &&
          client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.email &&
          client.email.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tab filter
      let matchesTab = true;
      if (activeTab === "active") {
        matchesTab = client.projectsCount > 0;
      } else if (activeTab === "overdue") {
        matchesTab = client.hasOverdueInvoices === true;
      } else if (activeTab === "inactive") {
        matchesTab = client.projectsCount === 0;
      }

      return matchesSearch && matchesTab;
    });
  }, [clients, searchQuery, activeTab]);

  const handleClientPress = (clientId: string) => {
    router.push(`/userprofile/client/${clientId}`);
  };

  // Listen for focus events to refresh data when screen comes into view
  useFocusEffect(
    React.useCallback(() => {
      // This runs when the screen comes into focus
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      // Optional: Force immediate refetch
      refetch();

      // Optional cleanup function (runs when screen loses focus)
    }, [queryClient, refetch])
  );

  // Render each client item
  const renderClientItem = ({ item: client }: { item: ClientItem }) => (
    <Pressable
      onPress={() => handleClientPress(client._id)}
      className="border border-gray-100 rounded-[12px] h-[120px] mb-4 bg-white px-4 py-4 active:bg-gray-50"
    >
      <View className="flex-row items-center justify-between h-full">
        <View className="flex-1 justify-between h-full">
          {/* Client with Avatar */}
          <View className="flex-row justify-between items-center pb-2 border-b border-gray-100">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: client.color }}
              >
                <Text className="text-gray-700 font-semiBold text-sm">
                  {client.initials}
                </Text>
              </View>
              <View className="max-w-[90%]">
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-gray-900  font-semiBold text-base"
                >
                  {client.name}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-gray-500 text-sm font-regular mt-1"
                >
                  {client.company}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </View>

          {/* Project Status and Info */}
          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center space-x-3">
              {/* Active Projects Badge */}
              {client.projectsCount > 0 ? (
                <View className="bg-[#CCFBF1] rounded-[8px] px-3 py-1">
                  <Text className="text-[#0D9488] font-medium text-xs">
                    {client.projectsCount} Active Project
                    {client.projectsCount !== 1 ? "s" : ""}
                  </Text>
                </View>
              ) : (
                <View className="bg-gray-100 rounded-[8px] px-3 py-1">
                  <Text className="text-gray-500 font-medium text-xs">
                    No active projects
                  </Text>
                </View>
              )}

              {/* Overdue Badge */}
              {client.hasOverdueInvoices && (
                <View className="bg-red-50 rounded-[8px] px-3 py-1">
                  <Text className="text-red-600 font-medium text-xs">
                    Invoice Overdue
                  </Text>
                </View>
              )}
            </View>

            {/* Email (truncated) */}
            <Text
              className="text-gray-400 text-xs max-w-[40%]"
              numberOfLines={1}
            >
              {client.email}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  // Render loading state
  const renderLoading = () => (
    <View className="flex-1 justify-center items-center py-8">
      <ActivityIndicator size="large" color="#007AFF" />
      <Text className="mt-4 text-gray-600">Loading clients...</Text>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View className="flex-1 justify-center items-center py-8 px-4">
      <View className="bg-red-50 p-6 rounded-xl w-full max-w-md">
        <Text className="text-red-800 font-bold text-lg text-center mb-2">
          Failed to Load Clients
        </Text>
        <Text className="text-red-600 text-center mb-4">
          {error?.message || "An error occurred while loading clients"}
        </Text>
        <TouchableOpacity
          onPress={() => onRefresh()}
          className="bg-red-100 py-3 rounded-lg"
        >
          <Text className="text-red-700 font-medium text-center">
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="py-12 items-center px-4">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Text className="text-gray-400 text-3xl">👤</Text>
      </View>
      <Text className="text-gray-700 font-bold text-lg mb-2">
        No Clients Found
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        {searchQuery
          ? `No clients match "${searchQuery}"`
          : activeTab !== "all"
          ? `No ${activeTab} clients`
          : "You haven't added any clients yet"}
      </Text>
    </View>
  );

  return (
    <Layout>
      <View className="flex-1">
        {/* Header */}
        <View className="pt-4 pb-4">
          <BackBtn title="Clients" />
        </View>

        {/* Clients List */}
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <FlatList
            data={filteredClients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isRefetching}
                onRefresh={onRefresh}
                colors={["#007AFF"]}
                tintColor="#007AFF"
              />
            }
          />
        )}

        {/* Create New Client Button */}
        <CreateNewGig location="userprofile/client/new" />
      </View>
    </Layout>
  );
};

export default Clients;
