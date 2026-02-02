import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { FileText, Trash2, Edit3, Search, X } from "lucide-react-native";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import { useRouter } from "expo-router";

const Drafts = () => {
  const router = useRouter();

  // State management
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Mock draft data
  const mockDrafts = [
    {
      id: "1",
      invoiceNumber: "DRAFT-001",
      clientName: "Acme Corporation",
      clientEmail: "billing@acme.com",
      amount: 1250.75,
      dueDate: "2023-12-15",
      createdAt: "2023-11-20T10:30:00Z",
      updatedAt: "2023-11-25T14:20:00Z",
      status: "draft",
      items: [
        { description: "Website Design", quantity: 1, price: 1000 },
        { description: "Domain Setup", quantity: 1, price: 250.75 },
      ],
      notes: "Need to add more services",
      progress: 0.6,
    },
    {
      id: "2",
      invoiceNumber: "DRAFT-002",
      clientName: "Global Tech Inc",
      clientEmail: "accounts@globaltech.com",
      amount: 3200.0,
      dueDate: "2023-12-20",
      createdAt: "2023-11-22T09:15:00Z",
      updatedAt: "2023-11-28T16:45:00Z",
      status: "draft",
      items: [
        { description: "Cloud Infrastructure", quantity: 1, price: 2000 },
        { description: "Maintenance", quantity: 3, price: 400 },
      ],
      notes: "Waiting for client approval on scope",
      progress: 0.8,
    },
    {
      id: "3",
      invoiceNumber: "DRAFT-003",
      clientName: "Startup Ventures",
      clientEmail: "finance@startupventures.com",
      amount: 850.5,
      dueDate: "2023-12-10",
      createdAt: "2023-11-25T11:00:00Z",
      updatedAt: "2023-11-25T11:00:00Z",
      status: "draft",
      items: [{ description: "Consultation Hours", quantity: 5, price: 170.1 }],
      notes: "",
      progress: 0.3,
    },
    {
      id: "4",
      invoiceNumber: "DRAFT-004",
      clientName: "Enterprise Solutions",
      clientEmail: "payments@enterprise.com",
      amount: 4500.0,
      dueDate: "2023-12-25",
      createdAt: "2023-11-18T14:20:00Z",
      updatedAt: "2023-11-30T10:10:00Z",
      status: "draft",
      items: [
        { description: "Software License", quantity: 1, price: 3000 },
        { description: "Implementation", quantity: 1, price: 1500 },
      ],
      notes: "Need to finalize contract details",
      progress: 0.9,
    },
  ];

  // Load drafts on component mount
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setTimeout(() => {
      setDrafts(mockDrafts);
      setLoading(false);
    }, 1000);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hr ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Filter drafts based on search query
  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle draft selection
  const toggleDraftSelection = (draftId) => {
    setSelectedDrafts((prev) => {
      if (prev.includes(draftId)) {
        return prev.filter((id) => id !== draftId);
      } else {
        return [...prev, draftId];
      }
    });
  };

  // Handle continue editing
  const handleContinueEditing = (draft) => {
    router.push({
      pathname: "/new/gigname",
      // params: { draft: JSON.stringify(draft) },
    });
  };

  // Handle delete draft
  const handleDeleteDraft = (draft) => {
    Alert.alert(
      "Delete Draft",
      `Are you sure you want to delete draft for ${draft.clientName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
            Alert.alert("Success", "Draft deleted successfully");
          },
        },
      ]
    );
  };

  // Handle delete multiple drafts
  const handleDeleteMultiple = () => {
    if (selectedDrafts.length === 0) return;

    Alert.alert(
      "Delete Drafts",
      `Are you sure you want to delete ${selectedDrafts.length} draft(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDrafts((prev) =>
              prev.filter((d) => !selectedDrafts.includes(d.id))
            );
            setSelectedDrafts([]);
            setSelectionMode(false);
            Alert.alert("Success", `${selectedDrafts.length} draft(s) deleted`);
          },
        },
      ]
    );
  };

  // Render each draft item
  const renderDraftItem = ({ item }) => {
    const isSelected = selectedDrafts.includes(item.id);

    return (
      <TouchableOpacity
        className={`bg-white rounded-[12px] p-4 mb-3 border ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
        onPress={() => {
          if (selectionMode) {
            toggleDraftSelection(item.id);
          } else {
            handleContinueEditing(item);
          }
        }}
        onLongPress={() => {
          setSelectionMode(true);
          toggleDraftSelection(item.id);
        }}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View className="flex-row">
          {/* File Icon */}
          <View className="bg-[#D5E8FC] items-center rounded-[8px] h-[50px] w-[50px] justify-center">
            <FileText size={22} color="#3B82F6" />
          </View>

          {/* Content */}
          <View className="flex-1 ml-4">
            <Text
              className="text-base font-semiBold text-gray-900"
              numberOfLines={1}
            >
              {item.clientName}
            </Text>
            <Text className="text-sm text-gray-600 font-regular mt-1">
              Last modified {formatRelativeTime(item.updatedAt)}
            </Text>

            {/* Progress Bar */}
            {/* <View className="mt-2">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-gray-600 font-regular">
                  {Math.round(item.progress * 100)}% complete
                </Text>
                <Text className="text-xs text-gray-600 font-regular">
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
            <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className={`h-full ${
                    item.progress >= 0.8
                      ? "bg-green-500"
                      : item.progress >= 0.5
                      ? "bg-blue-500"
                      : item.progress >= 0.3
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.progress * 100}%` }}
                />
              </View>
            </View> */}
          </View>

          {/* Selection Checkbox */}
          {selectionMode && (
            <View
              className={`w-5 h-5 rounded-full border-2 ml-2 ${
                isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
              }`}
            >
              {isSelected && (
                <View className="items-center justify-center flex-1">
                  <Text className="text-white text-xs font-bold">✓</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!selectionMode && (
          <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => handleContinueEditing(item)}
            >
              <Edit3 size={16} color="#3B82F6" />
              <Text className="text-blue-600 font-semiBold text-sm ml-1">
                Continue Editing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-1"
              onPress={() => handleDeleteDraft(item)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-20 px-8">
      <FileText size={80} color="#D1D5DB" />
      <Text className="text-2xl font-bold text-gray-500 text-center mt-6">
        No Drafts Found
      </Text>
      <Text className="text-lg text-gray-400 text-center mt-2 mb-6">
        {searchQuery
          ? "No drafts match your search"
          : "You don't have any saved drafts yet"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-lg text-gray-600 mt-4 font-regular">
            Loading your drafts...
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View className="flex-1">
        {/* Header */}
        <View className="pt-4 border-b border-gray-200 ">
          <View className="flex-row items-center  justify-between mb-4">
            <BackBtn title="Drafts" />

            {/* Selection Mode Actions */}
            {selectionMode && (
              <View className="flex-row">
                <TouchableOpacity
                  className="p-2 mr-2"
                  onPress={handleDeleteMultiple}
                  disabled={selectedDrafts.length === 0}
                >
                  <Trash2
                    size={20}
                    color={selectedDrafts.length === 0 ? "#9CA3AF" : "#EF4444"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2"
                  onPress={() => {
                    setSelectionMode(false);
                    setSelectedDrafts([]);
                  }}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Search Bar */}
        {!selectionMode && (
          <View className="py-3 border-b border-gray-200">
            <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 border border-secondary">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-900 font-regular"
                placeholder="Search drafts by client"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Drafts List */}
        <View className="flex-1 ">
          <FlatList
            data={filteredDrafts}
            renderItem={renderDraftItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 16 }}
            ListEmptyComponent={renderEmptyComponent}
          />
        </View>

        {/* Selection Mode Hint */}
        {!selectionMode && filteredDrafts.length > 0 && (
          <View className=" px-4 py-3 border-t border-blue-100">
            <Text className="text-sm text-blue-800 text-center font-regular">
              Long press on a draft to select multiple
            </Text>
          </View>
        )}
      </View>
    </Layout>
  );
};

export default Drafts;
