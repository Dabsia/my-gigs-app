import BackBtn from "@/components/BackBtn/BackBtn";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import {
  ChevronDown,
  Plus,
  X,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import Calendar from "@/components/Calender/Calender";
import { formatDate } from "@/helpers/formatDate";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";

export default function EditProject() {
  const router = useRouter();

  const { gigInfo, refreshOnGoBack } = useLocalSearchParams();
  // Parse and use the client data passed from the previous screen
  const gig = gigInfo ? JSON.parse(gigInfo as string) : null;
  console.log("Project Data:", gig);

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
    const formatMap = {
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
  const [milestones, setMilestones] = useState(
    gig?.milestones && gig.milestones.length > 0
      ? gig.milestones.map((milestone, index) => ({
          id: Date.now() + index,
          title: milestone.title || "",
          amount: milestone.amount?.toString() || "",
          dueDate: milestone.dueDate ? new Date(milestone.dueDate) : new Date(),
        }))
      : [{ id: Date.now(), title: "", amount: "", dueDate: new Date() }]
  );

  const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  // Edit state
  const [saving, setSaving] = useState(false);

  const projectFormats = ["Milestone", "full-project", "Hourly"];

  const handleEditProject = async () => {
    try {
      setSaving(true);

      // Get auth token
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in again.");
        router.replace("/auth/login");
        return;
      }

      if (!gig?._id) {
        Alert.alert("Error", "Project ID not found");
        setSaving(false);
        return;
      }

      // Convert format for backend (display format to backend format)
      const formatMap = {
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

      const response = await fetch(`${API_BASE_URL}/api/project/${gig._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      console.log("Update Response:", data);

      if (response.ok && data.success) {
        Alert.alert("Success", "Project updated successfully!");

        // If refreshOnGoBack flag is set, navigate back with fresh data
        if (refreshOnGoBack === "true") {
          console.log("Navigating back with fresh data...");
          router.replace({
            pathname: "/giginfo/giginformation",
            params: {
              gigInfo: JSON.stringify(data.data),
            },
          });
        } else {
          // Otherwise just go back
          router.back();
        }
      } else {
        let errorMessage = data.message || "Failed to update project";

        if (response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
          await AsyncStorage.clear();
          router.replace("/auth/login");
        } else if (response.status === 400) {
          // Show specific validation errors if available
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors
              .map((err) => err.message || err)
              .join("\n");
          } else if (data.error) {
            errorMessage = data.error;
          }
        } else if (response.status === 404) {
          errorMessage = "Project not found";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        Alert.alert("Update Failed", errorMessage);
      }
    } catch (error: any) {
      console.error("Save error:", error);

      let errorMessage = "Failed to update project";

      if (error.message) {
        if (error.message.includes("Network request failed")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Invalid response from server";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
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

  const onDateConfirm = (params) => {
    setShowDatePicker(false);
    if (params.date) {
      setDate(params.date);
    }
  };

  const onStartDateConfirm = (params) => {
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

  const removeMilestone = (id) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((milestone) => milestone.id !== id));
    } else {
      Alert.alert("Cannot Remove", "At least one milestone is required");
    }
  };

  const updateMilestone = (id, field, value) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const onMilestoneDateConfirm = (params) => {
    const milestoneId = showMilestoneDatePicker;
    setShowMilestoneDatePicker(null);

    if (params.date && milestoneId) {
      updateMilestone(milestoneId, "dueDate", params.date);
    }
  };

  const calculateMilestoneTotal = () => {
    return milestones.reduce((total, milestone) => {
      const amount = parseFloat(milestone.amount) || 0;
      return total + amount;
    }, 0);
  };

  const handleCancel = () => {
    router.back();
  };

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
              editable={!saving}
            />
          </View>

          {/* Client Display (Read-only) */}
          <View className="mb-6">
            <Text className="text-base font-semiBold text-gray-900 mb-2">
              Client
            </Text>
            <View className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white">
              <Text className="text-base font-regular text-gray-900">
                {gig?.clientInfo?.name || "No client assigned"}
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
              disabled={saving}
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
              disabled={saving}
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
                    editable={!saving}
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
                editable={!saving}
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
                disabled={saving}
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
                editable={!saving}
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
                    disabled={saving}
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
                          disabled={saving}
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
                        editable={!saving}
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
                          editable={!saving}
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
                        disabled={saving}
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
                editable={!saving}
              />
            </View>
          </View>

          {/* Edit Project Button */}
          {saving ? (
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
              disabled={saving}
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
                  disabled={saving}
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
