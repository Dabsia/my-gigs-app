import BackBtn from "@/components/BackBtn/BackBtn";
import Calendar from "@/components/Calender/Calender";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { formatDate } from "@/helpers/formatDate";
import { clientService } from "@/services/clientService";
import { projectService } from "@/services/projectService";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateProject() {
  const { client, clientId, clientName } = useLocalSearchParams();
  const router = useRouter();

  const { getToken } = useAuth();

  // Parse the client data if it was passed
  const parsedClient = client ? JSON.parse(client as string) : null;

  const [projectName, setProjectName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>(
    parsedClient?._id || parsedClient?.id || (clientId as string) || ""
  );
  const [selectedClientName, setSelectedClientName] = useState<string>(
    parsedClient?.name || (clientName as string) || ""
  );
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [projectFormat, setProjectFormat] = useState("Milestone");
  const [startingAmount, setStartingAmount] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [date, setDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());

  // Milestone state
  const [milestones, setMilestones] = useState([
    { id: Date.now(), title: "", amount: "", dueDate: new Date() },
  ]);
  const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState<
    number | null
  >(null);

  // New client form state
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const { height: screenHeight } = Dimensions.get("window");

  // Get query client for invalidating cache
  const queryClient = useQueryClient();

  // Fetch clients using React Query
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    error: clientsError,
    refetch: refetchClients,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      return clientService.getClients(token);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation for creating a new client
  const createClientMutation = useMutation({
    mutationFn: async (clientData) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      return clientService.createClient(clientData, token);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch clients query
        queryClient.invalidateQueries({ queryKey: ["clients"] });

        // Set the newly created client as selected
        setSelectedClientId(data.data._id);
        setSelectedClientName(data.data.name);

        // Reset form
        resetNewClientForm();
        setIsCreatingClient(false);
        setIsAddingNewClient(false);
        setShowClientDropdown(false);

        Alert.alert("Success", `Added new client: ${data.data.name}`);
      } else {
        Alert.alert("Error", data.message || "Failed to create client");
      }
    },
    onError: (error: any) => {
      setIsCreatingClient(false);
      Alert.alert("Error", error.message || "Failed to create client");
    },
  });

  // Mutation for creating a new project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      return projectService.createProject(projectData, token);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch projects query
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["client-data"] });

        // Also invalidate client projects if needed
        if (selectedClientId) {
          queryClient.invalidateQueries({
            queryKey: ["clientProjects", selectedClientId],
          });
        }

        Alert.alert("Success", "Project created successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to previous screen
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to create project");
      }
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create project");
    },
  });

  // Extract clients from the response
  const clients = clientsData?.success ? clientsData.data : [];

  // Auto-select the client if data was passed
  useEffect(() => {
    if (parsedClient || clientId) {
      // If we have parsed client data, use it
      if (parsedClient) {
        setSelectedClientId(parsedClient._id || parsedClient.id);
        setSelectedClientName(parsedClient.name || "");
      }
      // Otherwise use the individual parameters
      else if (clientId) {
        setSelectedClientId(clientId as string);
        setSelectedClientName(clientName as string);
      }
    }
  }, [parsedClient, clientId, clientName]);

  // Also check if the selected client exists in the fetched clients list
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const clientExists = clients.find((c: any) => c._id === selectedClientId);
      if (!clientExists) {
        console.log(
          "Selected client not found in clients list, clearing selection"
        );
      }
    }
  }, [clients, selectedClientId]);

  const calculateDynamicModalHeight = () => {
    const maxHeight = screenHeight * 0.7;
    const minHeight = 300;
    const clientItemHeight = 70;
    const headerHeight = 140;
    const emptyStateHeight = 300;

    if (clients.length === 0) {
      return Math.min(emptyStateHeight, maxHeight);
    }

    const calculatedHeight = Math.min(
      headerHeight + clients.length * clientItemHeight,
      maxHeight
    );

    return Math.max(calculatedHeight, minHeight);
  };

  const handleCreateProject = () => {
    // Validate required fields
    if (!projectName.trim()) {
      Alert.alert("Error", "Please enter project name");
      return;
    }

    if (!selectedClientId) {
      Alert.alert("Error", "Please select a client");
      return;
    }

    // Prepare project data
    const projectData: any = {
      title: projectName.trim(),
      clientId: selectedClientId,
    };

    // Add optional fields only if they have values
    if (description.trim()) projectData.description = description.trim();
    if (budget && !isNaN(parseFloat(budget)))
      projectData.budget = parseFloat(budget);
    if (hourlyRate && !isNaN(parseFloat(hourlyRate)))
      projectData.hourlyRate = parseFloat(hourlyRate);
    if (startingAmount && !isNaN(parseFloat(startingAmount)))
      projectData.startingAmount = parseFloat(startingAmount);

    // Add required date fields
    projectData.dueDate = date.toISOString();
    projectData.startDate = startDate.toISOString();

    // Add format (convert to backend expected format)
    projectData.format = projectFormat.toLowerCase().replace(/-/g, "_");

    // Add milestones if format is Milestone and there are valid ones
    if (projectFormat === "Milestone" && milestones.length > 0) {
      const validMilestones = milestones
        .filter(
          (m) => m.title.trim() && m.amount && !isNaN(parseFloat(m.amount))
        )
        .map((m) => ({
          title: m.title.trim(),
          amount: parseFloat(m.amount),
          dueDate: m.dueDate.toISOString(),
        }));

      if (validMilestones.length > 0) {
        projectData.milestones = validMilestones;
      }
    }

    // Call the mutation to create project
    createProjectMutation.mutate(projectData);
  };

  const handleAddNewClient = () => {
    // Validate required fields
    if (!newClientName.trim()) {
      Alert.alert("Error", "Please enter client name");
      return;
    }

    if (!newClientEmail.trim()) {
      Alert.alert("Error", "Please enter client email");
      return;
    }

    if (!isValidEmail(newClientEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsCreatingClient(true);

    // Prepare client data
    const clientData = {
      name: newClientName.trim(),
      email: newClientEmail.trim(),
      company: newClientCompany.trim() || undefined,
      phone: newClientPhone.trim() || undefined,
      address: newClientAddress.trim() || undefined,
    };

    // Call the mutation
    createClientMutation.mutate(clientData);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const resetNewClientForm = () => {
    setNewClientName("");
    setNewClientEmail("");
    setNewClientCompany("");
    setNewClientPhone("");
    setNewClientAddress("");
    setIsAddingNewClient(false);
  };

  const onDateConfirm = (params: { date: Date }) => {
    setShowDatePicker(false);
    if (params.date) {
      setDate(params.date);
    }
  };

  const onStartDateConfirm = (params: { date: Date }) => {
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

  const updateMilestone = (id: number, field: string, value: any) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const onMilestoneDateConfirm = (params: { date: Date }) => {
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

  const renderClientDropdown = () => {
    if (isAddingNewClient) {
      return (
        <View className="rounded-xl bg-white w-[370px] h-[500px] p-6">
          <Text className="text-lg font-semiBold text-gray-900 mb-6 text-center">
            Add New Client
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} className="">
            {/* Client Name */}
            <View className="mb-4">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Client Name *
              </Text>
              <TextInput
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
                value={newClientName}
                onChangeText={setNewClientName}
                className="w-full bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                autoFocus
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Email Address *
              </Text>
              <TextInput
                placeholder="client@example.com"
                placeholderTextColor="#9CA3AF"
                value={newClientEmail}
                onChangeText={setNewClientEmail}
                className="w-full bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Company Name */}
            <View className="mb-4">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Company Name
              </Text>
              <TextInput
                placeholder="Enter company name"
                placeholderTextColor="#9CA3AF"
                value={newClientCompany}
                onChangeText={setNewClientCompany}
                className="w-full bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
              />
            </View>

            {/* Phone Number */}
            <View className="mb-6">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Phone Number
              </Text>
              <TextInput
                placeholder="(123) 456-7890"
                placeholderTextColor="#9CA3AF"
                value={newClientPhone}
                onChangeText={setNewClientPhone}
                className="w-full bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-8">
              <Text className="text-gray-700 text-base font-semiBold mb-2">
                Client Address
              </Text>
              <TextInput
                multiline
                placeholder="Enter client address"
                placeholderTextColor="#6B7280"
                value={newClientAddress}
                onChangeText={setNewClientAddress}
                className="w-full bg-white border border-secondary font-regular rounded-lg text-black px-5 py-4 text-base min-h-[120px]"
                textAlignVertical="top"
              />
            </View>

            {/* Buttons */}
            <View className="flex justify-between mt-2">
              <TouchableOpacity
                className="px-4 py-3 border border-gray-300 rounded-lg mb-3"
                onPress={resetNewClientForm}
                disabled={isCreatingClient}
              >
                <Text className="text-base font-regular text-gray-900 text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-3 bg-primary rounded-lg"
                onPress={handleAddNewClient}
                disabled={isCreatingClient}
              >
                {isCreatingClient ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-semiBold text-white text-center">
                    Add Client
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    const modalHeight = calculateDynamicModalHeight();
    const hasClients = clients.length > 0;
    const showScroll = clients.length > 5;

    return (
      <View
        className="bg-white rounded-xl w-[350px]"
        style={{
          maxHeight: screenHeight * 0.7,
          height: modalHeight,
        }}
      >
        <Text className="text-lg font-semiBold text-gray-900 py-4 text-center border-b border-gray-200">
          Select Client
        </Text>

        {isLoadingClients ? (
          <View className="flex-1 items-center justify-center p-6">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="mt-4 text-gray-600">Loading clients...</Text>
          </View>
        ) : clientsError ? (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-red-500 text-center mb-4">
              Failed to load clients
            </Text>
            <TouchableOpacity
              onPress={() => refetchClients()}
              className="px-4 py-2 bg-red-100 rounded-lg"
            >
              <Text className="text-red-700">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !hasClients ? (
          <View className="flex-1 items-center justify-center p-6">
            <View className="items-center justify-center mb-6">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Users size={40} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-semiBold text-gray-900 mb-2">
                No Clients Yet
              </Text>
              <Text className="text-base font-regular text-gray-500 text-center px-4">
                Add your first client to get started
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center px-6 py-3 bg-primary rounded-lg"
              onPress={() => setIsAddingNewClient(true)}
            >
              <Plus size={20} color="white" />
              <Text className="text-base font-semiBold text-white ml-2">
                Add First Client
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1">
            {showScroll ? (
              <ScrollView
                showsVerticalScrollIndicator={true}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {clients.map((client: any) => (
                  <TouchableOpacity
                    key={client._id}
                    className={`py-3 px-4 border-b border-gray-100 active:bg-gray-50 ${
                      selectedClientId === client._id ? "bg-blue-50" : ""
                    }`}
                    onPress={() => {
                      setSelectedClientId(client._id);
                      setSelectedClientName(client.name);
                      setShowClientDropdown(false);
                    }}
                  >
                    <View className="">
                      <View className="flex-row">
                        <Text className="text-base font-semiBold text-gray-900">
                          {client.name}
                        </Text>
                        {selectedClientId === client._id && (
                          <Text className="ml-2 text-blue-500">✓</Text>
                        )}
                      </View>

                      <Text className="text-sm font-regular text-gray-500 mt-1">
                        {client.email}
                      </Text>
                      {client.company && (
                        <Text className="text-sm font-regular text-gray-500">
                          {client.company}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="flex-1">
                {clients.map((client: any) => (
                  <TouchableOpacity
                    key={client._id}
                    className={`py-3 px-4 border-b border-gray-100 active:bg-gray-50 ${
                      selectedClientId === client._id ? "bg-blue-50" : ""
                    }`}
                    onPress={() => {
                      setSelectedClientId(client._id);
                      setSelectedClientName(client.name);
                      setShowClientDropdown(false);
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-base font-semiBold text-gray-900">
                        {client.name}
                      </Text>
                      {selectedClientId === client._id && (
                        <Text className="ml-2 text-blue-500">✓</Text>
                      )}
                    </View>
                    <Text className="text-sm font-regular text-gray-500 mt-1">
                      {client.email}
                    </Text>
                    {client.company && (
                      <Text className="text-sm font-regular text-gray-500">
                        {client.company}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              className="flex-row items-center justify-center py-3 px-4 border-t border-gray-200 mt-2"
              onPress={() => setIsAddingNewClient(true)}
            >
              <Plus size={20} color="#3B82F6" />
              <Text className="text-base font-semiBold text-primary ml-2">
                Add New Client
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const projectFormats = ["Milestone", "full-project", "Hourly"];

  return (
    <Layout>
      <View className="bg-[#F6F6F1] flex-1 h-full">
        <ScrollView
          contentContainerClassName="pb-9 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <BackBtn title="Back" />

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
            />
          </View>

          {/* Client Dropdown */}
          <View className="mb-6">
            <Text className="text-base font-semiBold text-gray-900 mb-2">
              Client
            </Text>
            <TouchableOpacity
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between active:bg-gray-50"
              onPress={() => setShowClientDropdown(true)}
            >
              <Text
                className={`text-base font-regular ${
                  selectedClientName ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {selectedClientName || "Select or add new client"}
              </Text>
              <ChevronDown size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Start Date */}
          <View className="mb-6">
            <Text className="text-base font-semiBold text-gray-900 mb-2">
              Start Date
            </Text>
            <TouchableOpacity
              className="flex-1 px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between active:bg-gray-50"
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text className="text-base font-regular text-gray-900">
                {formatDate(startDate)}
              </Text>
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
            >
              <Text className="text-base font-regular text-gray-900">
                {formatDate(date)}
              </Text>
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
              />
            </View>

            {/* Project Format */}
            <View className="mb-6">
              <Text className="text-base font-semiBold text-gray-900 mb-2">
                Project Format
              </Text>
              <TouchableOpacity
                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between active:bg-gray-50"
                onPress={() => setShowFormatDropdown(true)}
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
              />
            </View>
          </View>

          <PrimaryBtn
            text={
              createProjectMutation.isPending ? "Creating..." : "Create Project"
            }
            handlePress={handleCreateProject}
            disabled={createProjectMutation.isPending}
          />
        </ScrollView>
      </View>

      {/* Client Dropdown Modal */}
      <Modal
        visible={showClientDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowClientDropdown(false);
          resetNewClientForm();
        }}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => {
            setShowClientDropdown(false);
            resetNewClientForm();
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {renderClientDropdown()}
          </Pressable>
        </Pressable>
      </Modal>

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
                  onPress={() => {
                    setProjectFormat(format);
                    setShowFormatDropdown(false);

                    // Reset milestones if not milestone format
                    if (format !== "Milestone") {
                      setMilestones([
                        {
                          id: Date.now(),
                          title: "",
                          amount: "",
                          dueDate: new Date(),
                        },
                      ]);
                    }
                  }}
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
        onSelectDate={(date: Date) => {
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
