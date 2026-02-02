import { View, Text, Pressable, ActivityIndicator } from "react-native";
import React from "react";
import ChargeIcon from "@/assets/icons/Charge";
import { useRouter } from "expo-router";
import { getInitials } from "@/helpers/getInitials";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/clientService";
import { projectService } from "@/services/projectService"; // You'll need to create this

interface ClientData {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  color?: string;
}

interface ClientsProps {
  _id: string;
  color: string;
  name: string;
}

interface ProjectData {
  _id: string;
  title: string;
  dueDate: string;
  status: string;
  clientInfo?: {
    name: string;
    company?: string;
  };
}

// Color palette for client avatars
const CLIENT_COLORS = [
  "#f3aba7", // Soft coral
  "#b4e5bb", // Mint green
  "#f4ce9b", // Peach
  "#a8d8ea", // Sky blue
  "#d9b8ff", // Lavender
  "#ffd6a5", // Apricot
  "#caffbf", // Light green
  "#ffadad", // Light red
];

// Get consistent color for a client based on their ID
const getClientColor = (clientId: string): string => {
  let hash = 0;
  for (let i = 0; i < clientId.length; i++) {
    hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CLIENT_COLORS.length;
  return CLIENT_COLORS[index];
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const MyStats = () => {
  const router = useRouter();

  // Fetch clients using React Query
  const {
    data: clientsData,
    isLoading: clientsLoading,
    error: clientsError,
    refetch: refetchClients,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: clientService.getClients,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch projects using React Query
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getProjects, // You need to create this service
    staleTime: 5 * 60 * 1000,
  });

  const moveToCreateClient = () => {
    router.push("/userprofile/client/new");
  };

  const clientWithMeeting = null;

  // Transform API data to match component interface
  const clients: ClientsProps[] = clientsData?.success
    ? clientsData.data.map((client: ClientData) => ({
        _id: client._id,
        name: client.name,
        color: getClientColor(client._id),
      }))
    : [];

  // Get only first 3 clients for display
  const displayedClients = clients.slice(0, 3);

  // Find the project with the closest due date
  const findClosestDueGig = (projects: ProjectData[] | undefined) => {
    if (!projects || projects.length === 0) return null;

    const now = new Date();

    // Filter for projects that are not completed and have future due dates
    const upcomingProjects = projects.filter((project) => {
      const dueDate = new Date(project.dueDate);
      const isNotCompleted =
        project.status !== "completed" && project.status !== "cancelled";
      return dueDate > now && isNotCompleted;
    });

    if (upcomingProjects.length === 0) return null;

    // Sort by due date (closest first)
    const sortedProjects = [...upcomingProjects].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedProjects[0];
  };

  const dueGig = projectsData?.success
    ? findClosestDueGig(projectsData.data)
    : null;

  // Calculate client initials
  const getClientInitials = (name: string): string => {
    return getInitials(name) || "?";
  };

  // Combined loading state for both clients and projects
  const isLoading = clientsLoading || projectsLoading;

  // Error state
  const hasError = clientsError || projectsError;

  const handlePress = () => {
    if (dueGig) {
      router.push({
        pathname: "/giginfo/personalgiginfo",
        params: {
          gigInfo: JSON.stringify(dueGig),
        },
      });
    } else return;
  };

  if (isLoading) {
    return (
      <View className="mt-10">
        <Text className="font-semiBold text-[16px] mb-4">My Stats</Text>
        <View className="mt-4 justify-between h-[200px] flex-row">
          <View className="h-full bg-white w-[48%] py-5 items-center justify-between rounded-[10px]">
            <ActivityIndicator size="small" color="#007AFF" />
            <Text className="text-gray-500 text-sm">Loading...</Text>
          </View>
          <View className="w-[48%] justify-between h-full">
            <View className="w-full h-[48%] px-3 py-4 bg-secondary rounded-[10px] justify-center items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-sm mt-2">Loading...</Text>
            </View>
            <View className="bg-white w-full h-[48%] px-3 py-2 rounded-[10px] justify-center items-center">
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="mt-10">
        <Text className="font-semiBold text-[16px] mb-4">My Stats</Text>
        <View className="mt-4 justify-between h-[200px] flex-row">
          <View className="h-full bg-white w-[48%] py-5 items-center justify-between rounded-[10px]">
            <View className="h-[45px] w-[44px] rounded-[15px] bg-[#fff3f5] items-center justify-center">
              <ChargeIcon />
            </View>
            <View className="items-center">
              <Text className="text-error font-textBold mb-3">Due Gig</Text>
              <View>
                <Text className="font-semiBold mb-1 text-[12px] text-center">
                  Error loading projects
                </Text>
              </View>
            </View>
          </View>
          <View className="w-[48%] justify-between h-full">
            <View className="w-full h-[48%] px-3 py-4 bg-red-50 rounded-[10px] justify-center items-center">
              <Text className="text-red-600 font-semiBold text-sm mb-2">
                Error Loading Data
              </Text>
              <Text className="text-red-500 text-xs text-center mb-3">
                {clientsError?.message ||
                  projectsError?.message ||
                  "Unknown error"}
              </Text>
              <Pressable
                onPress={() => {
                  refetchClients();
                }}
                className="bg-red-100 px-4 py-2 rounded-lg"
              >
                <Text className="text-red-700 text-sm">Retry</Text>
              </Pressable>
            </View>
            <View className="bg-white w-full h-[48%] px-3 py-2 rounded-[10px]">
              <View className="flex-row justify-between">
                <Text className="font-semiBold text-primary text-[14px]">
                  Meetings
                </Text>
              </View>
              <View>
                <Text className="font-semiBold mt-1 text-[13px]">
                  You have no scheduled meeting yet
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-10">
      <Text className="font-semiBold text-[16px]">My Stats</Text>
      <View className="mt-4 justify-between h-[200px] flex-row">
        {/* Left Card: Due Gig */}
        <Pressable
          onPress={handlePress}
          className="h-full bg-white w-[48%] py-5 items-center justify-between rounded-[10px]"
        >
          <View className="h-[45px] w-[44px] rounded-[15px] bg-[#fff3f5] items-center justify-center">
            <ChargeIcon />
          </View>
          <View className="items-center">
            <Text className="text-error font-textBold mb-3">Due Gig</Text>
            {dueGig ? (
              <View className="items-center">
                <Text className="font-semiBold mb-1 text-[12px] text-center">
                  {dueGig.title}
                </Text>
                <Text className="text-[12px] font-regular">
                  {formatDate(dueGig.dueDate)}
                </Text>
              </View>
            ) : (
              <View>
                <Text className="font-semiBold mb-1 text-[12px] text-center">
                  You have no gig due soon
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        {/* Right Cards Container */}
        <View className="w-[48%] justify-between h-full">
          {/* Top Right Card: Recent Clients */}
          <View className="w-full h-[48%] px-3 py-4 bg-secondary rounded-[10px]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-semiBold text-white text-[14px]">
                Recent Clients
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {/* Display client avatars */}
              {displayedClients.length > 0 ? (
                <>
                  {displayedClients.map((client: ClientsProps) => (
                    <View
                      key={client._id}
                      style={{
                        height: 33,
                        width: 33,
                        borderRadius: 100,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: client.color,
                      }}
                    >
                      <Text className="text-white font-semiBold text-[13px]">
                        {getClientInitials(client.name)}
                      </Text>
                    </View>
                  ))}
                </>
              ) : (
                <View className="flex-1 items-center justify-center py-2">
                  <Text className="text-white/80 text-sm text-center">
                    No clients yet
                  </Text>
                </View>
              )}

              {/* Add Client Button */}
              <Pressable
                onPress={moveToCreateClient}
                className="bg-white h-[33px] w-[33px] rounded-full justify-center items-center ml-auto"
              >
                <Text className="text-secondary text-lg font-bold">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom Right Card: Meetings */}
          <View className="bg-white w-full h-[48%] px-3 py-2 rounded-[10px]">
            <View className="flex-row justify-between">
              <Text className="font-semiBold text-primary text-[14px]">
                Meetings
              </Text>
              {clientWithMeeting && (
                <View className="flex-row justify-between">
                  <View className="h-[21px] w-[21px] rounded-full bg-[#F4CE9B] justify-center items-center">
                    <Text className="text-white font-semiBold text-[10px]">
                      {getInitials(clientWithMeeting)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            {clientWithMeeting ? (
              <View>
                <Text className="font-semiBold my-2 text-[12px]">
                  Fintech UI website review
                </Text>
                <Text className="text-[12px] font-regular">
                  2 Jan, 2023 5:30PM
                </Text>
              </View>
            ) : (
              <View className="flex-1 justify-center">
                <Text className="font-semiBold text-[13px] text-gray-600 text-center">
                  You have no scheduled meeting yet
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default MyStats;
