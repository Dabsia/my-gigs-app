import BackBtn from "@/components/BackBtn/BackBtn";
import Calendar from "@/components/Calender/Calender";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { formatDate } from "@/helpers/formatDate";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Milestone {
  id: number;
  title: string;
  amount: string;
  dueDate: Date;
}

interface ProjectData {
  _id?: string;
  title?: string;
  description?: string;
  budget?: number;
  hourlyRate?: number;
  format?: string;
  startingAmount?: number;
  dueDate?: string;
  startDate?: string;
  clientInfo?: {
    _id?: string;
    name?: string;
  };
  milestones?: any[];
  [key: string]: any;
}

export default function EditProject() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { gigInfo, refreshOnGoBack } = useLocalSearchParams();

  // Parse and use the client data passed from the previous screen
  const gig: ProjectData | null = gigInfo
    ? JSON.parse(gigInfo as string)
    : null;

  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  // If no data passed, initialize empty states
  const [projectName, setProjectName] = useState(gig?.title || "");
  const [description, setDescription] = useState(gig?.description || "");
  const [budget, setBudget] = useState(gig?.budget?.toString() || "");
  const [hourlyRate, setHourlyRate] = useState(
    gig?.hourlyRate?.toString() || ""
  );

  // Format conversion - handle both existing data and default
  const getProjectFormat = (format: string | undefined) => {
    if (!format) return "Milestone";

    // Convert from backend format to display format
    const formatMap: Record<string, string> = {
      milestone: "Milestone",
      "full-project": "full-project",
      hourly: "Hourly",
    };

    const normalizedFormat = format.toLowerCase().replace("_", "-");
    return formatMap[normalizedFormat] || "Milestone";
  };

  const [projectFormat, setProjectFormat] = useState(
    getProjectFormat(gig?.format)
  );

  const [startingAmount, setStartingAmount] = useState(
    gig?.startingAmount?.toString() || ""
  );

  // Dates
  const [date, setDate] = useState(
    gig?.dueDate ? new Date(gig.dueDate) : new Date()
  );
  const [startDate, setStartDate] = useState(
    gig?.startDate ? new Date(gig.startDate) : new Date()
  );

  // Milestone state - Initialize with existing milestones or default
  const [milestones, setMilestones] = useState<Milestone[]>(
    gig?.milestones && gig.milestones.length > 0
      ? gig.milestones.map((milestone, index) => ({
          id: Date.now() + index,
          title: milestone.title || "",
          amount: milestone.amount?.toString() || "",
          dueDate: milestone.dueDate ? new Date(milestone.dueDate) : new Date(),
        }))
      : [{ id: Date.now(), title: "", amount: "", dueDate: new Date() }]
  );

  const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState<
    number | null
  >(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const t = await getToken();
      setToken(t);
    };
    fetchToken();
  }, [getToken]);

  const projectFormats = ["Milestone", "full-project", "Hourly"];

  // ============================================================================
  // REACT QUERY MUTATION
  // ============================================================================

  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      if (!token) throw new Error("No auth token");
      if (!gig?._id) throw new Error("Project ID not found");

      const response = await fetch(`${API_BASE_URL}/api/project/${gig._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          await AsyncStorage.clear();
          router.replace("/");
          throw new Error("Session expired. Please log in again.");
        } else if (response.status === 404) {
          throw new Error("Project not found");
        } else if (response.status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            throw new Error(
              data.errors.map((err: any) => err.message || err).join("\n")
            );
          } else if (data.error) {
            throw new Error(data.error);
          }
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        }
        throw new Error(data.message || "Failed to update project");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to update project");
      }

      return data;
    },
    onSuccess: (data) => {
      Alert.alert("Success", "Project updated successfully!");

      // ============================================================================
      // INVALIDATE ALL RELATED QUERIES
      // ============================================================================

      // 1. Invalidate the specific project query
      queryClient.invalidateQueries({
        queryKey: ["project", gig?._id],
      });

      // 2. Invalidate all projects list queries (for dashboard, etc.)
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      // 3. Invalidate client-specific projects if this project has a client
      if (gig?.clientInfo?._id) {
        queryClient.invalidateQueries({
          queryKey: ["client-data", gig.clientInfo._id],
        });
        queryClient.invalidateQueries({
          queryKey: ["client-projects", gig.clientInfo._id],
        });
      }

      // 4. Invalidate any stats queries
      queryClient.invalidateQueries({
        queryKey: ["project-stats"],
      });

      // 5. Also invalidate by partial key matches (optional but thorough)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return key.includes("project") || key.includes("client");
        },
      });

      // Navigate back with fresh data if needed
      if (refreshOnGoBack === "true") {
        console.log("Navigating back with fresh data...");
        router.replace({
          pathname: "/giginfo/giginformation",
          params: {
            gigInfo: JSON.stringify(data.data),
          },
        });
      } else {
        router.back();
      }
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      Alert.alert("Update Failed", error.message);
    },
  });

  const handleEditProject = async () => {
    console.log("gigInfo", gig);

    if (!token) {
      router.replace("/");
      return;
    }

    if (!gig?._id) {
      Alert.alert("Error", "Project ID not found");
      return;
    }

    // Convert format for backend (display format to backend format)
    const formatMap: Record<string, string> = {
      Milestone: "milestone",
      "full-project": "full-project",
      Hourly: "hourly",
    };

    const backendFormat = formatMap[projectFormat] || "milestone";

    // Prepare project data for API
    const projectData: any = {
      title: projectName,
      description,
      budget: parseFloat(budget) || 0,
      hourlyRate: parseFloat(hourlyRate) || 0,
      format: backendFormat,
      startingAmount: parseFloat(startingAmount) || 0,
      dueDate: date.toISOString(),
      startDate: startDate.toISOString(),
    };

    // Add client info if exists
    if (gig?.clientInfo?._id) {
      projectData.clientId = gig.clientInfo._id;
    }

    // Add milestones only if format is Milestone
    if (projectFormat === "Milestone") {
      projectData.milestones = milestones
        .filter((m) => m.title.trim() && m.amount)
        .map((m) => ({
          title: m.title.trim(),
          amount: parseFloat(m.amount) || 0,
          dueDate: m.dueDate.toISOString(),
        }));

      // If no valid milestones, don't send empty array
      if (projectData.milestones.length === 0) {
        delete projectData.milestones;
      }
    } else {
      // Clear milestones if not milestone format
      projectData.milestones = [];
    }

    console.log("Updating project with data:", projectData);

    // Execute the mutation
    updateProjectMutation.mutate(projectData);
  };

  const handleFormatChange = (format: string) => {
    setProjectFormat(format);
    setShowFormatDropdown(false);

    // If switching away from Milestone format, clear milestones
    if (format !== "Milestone") {
      setMilestones([
        { id: Date.now(), title: "", amount: "", dueDate: new Date() },
      ]);
    }
  };

  const onDateConfirm = (params: any) => {
    setShowDatePicker(false);
    if (params.date) {
      setDate(params.date);
    }
  };

  const onStartDateConfirm = (params: any) => {
    setShowStartDatePicker(false);
    if (params.date) {
      setStartDate(params.date);
    }
  };

  // Milestone functions
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: Date.now() + milestones.length,
        title: "",
        amount: "",
        dueDate: new Date(),
      },
    ]);
  };

  const removeMilestone = (id: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((milestone) => milestone.id !== id));
    } else {
      Alert.alert("Cannot Remove", "At least one milestone is required");
    }
  };

  const updateMilestone = (
    id: number,
    field: keyof Milestone,
    value: string | Date
  ) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const onMilestoneDateConfirm = (params: any) => {
    const milestoneId = showMilestoneDatePicker;
    setShowMilestoneDatePicker(null);

    if (params.date && milestoneId) {
      updateMilestone(milestoneId, "dueDate", params.date);
    }
  };

  const calculateMilestoneTotal = () => {
    return milestones.reduce((total: number, milestone) => {
      const amount = parseFloat(milestone.amount) || 0;
      return total + amount;
    }, 0);
  };

  const handleCancel = () => {
    router.push("/giginfo/giginformation");
  };

  const isLoading = updateProjectMutation.isPending;

  return (
    <Layout>
      <View className="bg-[#F6F6F1] flex-1 h-full">
        <ScrollView
          contentContainerClassName="pb-9 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <BackBtn title="Back" onPress={handleCancel} />
          <Text className="text-[16px] mt-4 text-center font-semiBold text-gray-900 mb-2">
            Edit Project Information
          </Text>

          {/* Project Name */}
          <View className="mb-6 mt-6">
            <Text className="text-base font-semiBold text-gray-900 mb-2">
              Project Name
            </Text>
            <TextInput
              placeholder="e.g. Website Redesign"
              placeholderTextColor="#9CA3AF"
              value={projectName}
              onChangeText={setProjectName}
              className="w-full px-4 py-4 font-regular border border-gray-300 rounded-xl bg-white text-base text-gray-900"
              editable={!isLoading}
            />
          </View>

          {/* Client Display (Read-only) */}
          <View className="mb-6">
            <Text className="text-base font-semiBold text-gray-900 mb-2">
              Client
            </Text>
            <View className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white">
              <Text className="text-base font-regular text-gray-900">
                {gig?.client?.name || "No client assigned"}
              </Text>
            </View>
          </View>

          {/* Start Date */}
          <View className="mb-6">
            <Text className="text-base font-semiBold text-gray-900 mb-2">
              Start Date
            </Text>
            <TouchableOpacity
              className="flex-1 px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between active:bg-gray-50"
              onPress={() => setShowStartDatePicker(true)}
              disabled={isLoading}
            >
              <Text className="text-base font-regular text-gray-900">
                {formatDate(startDate)}
              </Text>
              <CalendarIcon size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Due Date */}
          <View className="mb-6">
            <Text className="text-base font-semiBold text-gray-900 mb-2">
              Due Date
            </Text>
            <TouchableOpacity
              className="flex-1 px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between active:bg-gray-50"
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text className="text-base font-regular text-gray-900">
                {formatDate(date)}
              </Text>
              <CalendarIcon size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* FINANCIALS Section */}
          <View className="mb-6">
            {/* Budget */}
            <View className="mb-6">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Budget
              </Text>
              <View className="flex-row items-center w-full">
                <View className="flex-row items-center w-full px-4 py-1 border border-gray-300 rounded-xl bg-white">
                  <Text className="text-base mr-2 font-regular text-gray-900">
                    USD :
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={budget}
                    onChangeText={setBudget}
                    className="flex-1 ml-2 text-base font-regular text-gray-900"
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Hourly Rate
              </Text>
              <TextInput
                placeholder="$ 0.00"
                placeholderTextColor="#9CA3AF"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                className="w-full px-4 py-4 font-regular border border-gray-300 rounded-xl bg-white text-base text-gray-900"
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            {/* Project Format Dropdown */}
            <View className="mb-6">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Project Format
              </Text>
              <TouchableOpacity
                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between active:bg-gray-50"
                onPress={() => setShowFormatDropdown(true)}
                disabled={isLoading}
              >
                <Text className="text-base font-regular text-gray-900">
                  {projectFormat}
                </Text>
                <ChevronDown size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Starting Amount */}
            <View className="mb-6">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Starting Amount
                <Text className="text-gray-500 font-regular"> OPTIONAL</Text>
              </Text>
              <TextInput
                placeholder="$ 0.00"
                placeholderTextColor="#9CA3AF"
                value={startingAmount}
                onChangeText={setStartingAmount}
                className="w-full px-4 py-4 font-regular border border-gray-300 rounded-xl bg-white text-base text-gray-900"
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            {/* MILESTONES SECTION - Only shows when format is "Milestone" */}
            {projectFormat === "Milestone" && (
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-base font-semiBold text-gray-900">
                    Milestones
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={addMilestone}
                    disabled={isLoading}
                  >
                    <Plus size={20} color="#3B82F6" />
                    <Text className="text-primary font-semiBold ml-1">
                      Add Milestone
                    </Text>
                  </TouchableOpacity>
                </View>

                {milestones.map((milestone, index) => (
                  <View
                    key={milestone.id}
                    className="mb-4 p-4 border border-gray-200 rounded-xl bg-white"
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-base font-semiBold text-gray-900">
                        Milestone {index + 1}
                      </Text>
                      {milestones.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeMilestone(milestone.id)}
                          className="p-1"
                          disabled={isLoading}
                        >
                          <X size={20} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Milestone Title */}
                    <View className="mb-4">
                      <Text className="text-sm font-semiBold text-gray-700 mb-2">
                        Title
                      </Text>
                      <TextInput
                        placeholder="e.g. Design Phase, Development Phase"
                        placeholderTextColor="#9CA3AF"
                        value={milestone.title}
                        onChangeText={(text) =>
                          updateMilestone(milestone.id, "title", text)
                        }
                        className="w-full px-4 py-3 font-regular border border-gray-300 rounded-lg bg-white text-base text-gray-900"
                        editable={!isLoading}
                      />
                    </View>

                    {/* Milestone Amount */}
                    <View className="mb-4">
                      <Text className="text-sm font-semiBold text-gray-700 mb-2">
                        Amount
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-base mr-2 font-regular text-gray-900">
                          USD :
                        </Text>
                        <TextInput
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          value={milestone.amount}
                          onChangeText={(text) =>
                            updateMilestone(milestone.id, "amount", text)
                          }
                          className="flex-1 px-4 py-3 font-regular border border-gray-300 rounded-lg bg-white text-base text-gray-900"
                          keyboardType="numeric"
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    {/* Milestone Due Date */}
                    <View className="mb-2">
                      <Text className="text-sm font-semiBold text-gray-700 mb-2">
                        Due Date
                      </Text>
                      <TouchableOpacity
                        className="flex-row items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white"
                        onPress={() => setShowMilestoneDatePicker(milestone.id)}
                        disabled={isLoading}
                      >
                        <Text className="text-base font-regular text-gray-900">
                          {formatDate(milestone.dueDate)}
                        </Text>
                        <CalendarIcon size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Milestone Total */}
                <View className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <Text className="text-base font-semiBold text-gray-900 mb-2">
                    Milestone Total
                  </Text>
                  <Text className="text-lg font-semiBold text-primary">
                    ${calculateMilestoneTotal().toFixed(2)}
                  </Text>
                  <Text className="text-sm font-regular text-gray-500 mt-1">
                    Sum of all milestone amounts
                  </Text>
                </View>
              </View>
            )}

            {/* Description */}
            <View className="mb-6">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Description
              </Text>
              <TextInput
                placeholder="Project details and deliverables..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                className="w-full px-4 py-4 border font-regular border-gray-300 rounded-xl bg-white text-base text-gray-900 min-h-[120px]"
                multiline
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Update Project Button */}
          {isLoading ? (
            <TouchableOpacity
              className="bg-primary py-4 flex-row rounded-lg items-center justify-center"
              disabled
            >
              <ActivityIndicator color="white" />
              <Text className="text-white ml-2 font-semiBold ">
                Updating Project...
              </Text>
            </TouchableOpacity>
          ) : (
            <PrimaryBtn
              text="Update Project Information"
              handlePress={handleEditProject}
              disabled={isLoading}
            />
          )}
        </ScrollView>
      </View>

      {/* Project Format Dropdown Modal */}
      <Modal
        visible={showFormatDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFormatDropdown(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowFormatDropdown(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-xl w-4/5 max-w-sm p-4">
              {projectFormats.map((format) => (
                <TouchableOpacity
                  key={format}
                  className="py-4 px-2 border-b border-gray-200 last:border-b-0 active:bg-gray-50"
                  onPress={() => handleFormatChange(format)}
                  disabled={isLoading}
                >
                  <Text className="text-base font-regular text-center text-gray-900">
                    {format}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Pickers */}
      <Calendar
        selectedDate={date}
        onSelectDate={setDate}
        isDateModalOpen={showDatePicker}
        onDateConfirm={onDateConfirm}
        setShowDatePicker={setShowDatePicker}
      />
      <Calendar
        selectedDate={startDate}
        onSelectDate={setStartDate}
        isDateModalOpen={showStartDatePicker}
        onDateConfirm={onStartDateConfirm}
        setShowDatePicker={setShowStartDatePicker}
      />

      {/* Milestone Date Picker */}
      <Calendar
        selectedDate={
          showMilestoneDatePicker
            ? milestones.find((m) => m.id === showMilestoneDatePicker)
                ?.dueDate || new Date()
            : new Date()
        }
        onSelectDate={(date) => {
          if (showMilestoneDatePicker) {
            updateMilestone(showMilestoneDatePicker, "dueDate", date);
          }
        }}
        isDateModalOpen={showMilestoneDatePicker !== null}
        onDateConfirm={onMilestoneDateConfirm}
        setShowDatePicker={() => setShowMilestoneDatePicker(null)}
      />
    </Layout>
  );
}
