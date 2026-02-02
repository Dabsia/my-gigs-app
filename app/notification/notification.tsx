import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  RefreshControl,
} from "react-native";
import {
  Bell,
  Briefcase,
  Archive,
  CheckCheck,
  UserPlus,
  DollarSign,
  MessageCircle,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
} from "lucide-react-native";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Notifications = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState("all"); // 'all' or 'unread'

  // Fetch notifications function
  const fetchNotifications = async () => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load notifications");
    }

    return data;
  };

  // Fetch notification counts
  const fetchNotificationCounts = async () => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/counts`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load notification counts");
    }

    return data;
  };

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const authToken = await AsyncStorage.getItem("auth_token");
      if (!authToken) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark as read");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both notifications and counts queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCounts"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const authToken = await AsyncStorage.getItem("auth_token");
      if (!authToken) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark all as read");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both notifications and counts queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCounts"] });
    },
  });

  // Fetch notifications using React Query
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
    isRefetching: isRefetchingNotifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Fetch notification counts using React Query
  const {
    data: countsData,
    isLoading: isLoadingCounts,
    error: countsError,
    refetch: refetchCounts,
  } = useQuery({
    queryKey: ["notificationCounts"],
    queryFn: fetchNotificationCounts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Get notifications from data
  const notifications = notificationsData?.success
    ? notificationsData.data
    : [];
  const totalCount = notificationsData?.total || 0;
  const unreadCount = countsData?.success ? countsData.data?.unread || 0 : 0;

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "project_created":
        return Briefcase;
      case "project_updated":
        return AlertCircle;
      case "project_archived":
        return Archive;
      case "milestone_added":
      case "milestone_updated":
      case "milestone_completed":
        return CheckCheck;
      case "client_assigned":
        return UserPlus;
      case "payment_received":
      case "invoice_paid":
        return DollarSign;
      case "message":
        return MessageCircle;
      case "invoice_created":
      case "invoice_sent":
        return FileText;
      case "task_assigned":
      case "task_completed":
        return CheckCircle;
      case "client_created":
        return Users;
      case "due_date_reminder":
        return Calendar;
      default:
        return Bell;
    }
  };

  // Get icon color based on notification type
  const getIconColor = (type) => {
    switch (type) {
      case "project_created":
        return "#10B981"; // green
      case "project_updated":
        return "#F59E0B"; // amber
      case "project_archived":
        return "#6B7280"; // gray
      case "milestone_added":
      case "milestone_updated":
        return "#3B82F6"; // blue
      case "milestone_completed":
        return "#10B981"; // green
      case "client_assigned":
        return "#EC4899"; // pink
      case "payment_received":
      case "invoice_paid":
        return "#10B981"; // green
      case "message":
        return "#3B82F6"; // blue
      case "invoice_created":
      case "invoice_sent":
        return "#8B5CF6"; // purple
      case "task_assigned":
        return "#3B82F6"; // blue
      case "task_completed":
        return "#10B981"; // green
      case "client_created":
        return "#EC4899"; // pink
      case "due_date_reminder":
        return "#F59E0B"; // amber
      default:
        return "#6B7280"; // gray
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "1d ago";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Filter notifications based on tab
  const filteredNotifications =
    filterTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const todayNotifications = [];
    const yesterdayNotifications = [];
    const thisWeekNotifications = [];
    const olderNotifications = [];

    filteredNotifications.forEach((notification) => {
      const notifDate = new Date(notification.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        todayNotifications.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        yesterdayNotifications.push(notification);
      } else if (notifDate > lastWeek) {
        thisWeekNotifications.push(notification);
      } else {
        olderNotifications.push(notification);
      }
    });

    const sections = [];

    if (todayNotifications.length > 0) {
      sections.push({
        title: "Today",
        data: todayNotifications,
      });
    }

    if (yesterdayNotifications.length > 0) {
      sections.push({
        title: "Yesterday",
        data: yesterdayNotifications,
      });
    }

    if (thisWeekNotifications.length > 0) {
      sections.push({
        title: "This Week",
        data: thisWeekNotifications,
      });
    }

    if (olderNotifications.length > 0) {
      sections.push({
        title: "Older",
        data: olderNotifications,
      });
    }

    return sections;
  }, [filteredNotifications]);

  // Handle notification press
  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }

    // Navigate based on actionUrl if available
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchNotifications();
    refetchCounts();
  };

  // Render notification item
  const renderNotificationItem = ({ item }) => {
    const IconComponent = getNotificationIcon(item.type);
    const iconColor = getIconColor(item.type);

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        disabled={markAsReadMutation.isPending}
        className={`bg-white rounded-[12px] p-4 mb-3 border border-gray-200 ${
          !item.read ? "bg-blue-50 border-blue-200" : ""
        }`}
      >
        <View className="flex-row items-start">
          {/* Icon */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <IconComponent size={20} color={iconColor} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text
                className={`text-base font-semiBold flex-1 mr-2 ${
                  !item.read ? "text-gray-900" : "text-gray-700"
                }`}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <Text className="text-xs text-gray-500 font-regular">
                {item.timeAgo || formatTimestamp(item.createdAt)}
              </Text>
            </View>

            <Text className="text-sm text-gray-600 font-regular mt-1">
              {item.message}
            </Text>

            {/* Metadata */}
            {item.data?.metadata && (
              <View className="mt-2 flex-row flex-wrap">
                {item.data.metadata.projectTitle && (
                  <View className="bg-gray-100 rounded-lg px-2 py-1 mr-2 mb-1">
                    <Text className="text-xs text-gray-700">
                      {item.data.metadata.projectTitle}
                    </Text>
                  </View>
                )}
                {item.data.metadata.clientName && (
                  <View className="bg-blue-100 rounded-lg px-2 py-1 mr-2 mb-1">
                    <Text className="text-xs text-blue-700">
                      {item.data.metadata.clientName}
                    </Text>
                  </View>
                )}
                {item.data.amount && (
                  <View className="bg-green-100 rounded-lg px-2 py-1 mb-1">
                    <Text className="text-xs text-green-700">
                      ${item.data.amount.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Unread indicator */}
          {!item.read && (
            <View className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-2" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section }) => (
    <View className="mb-3 mt-4">
      <Text className="text-sm font-semiBold text-gray-700">
        {section.title}
      </Text>
    </View>
  );

  // Render loading state
  if (isLoadingNotifications || isLoadingCounts) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-lg text-gray-600 mt-4 font-regular">
            Loading notifications...
          </Text>
        </View>
      </Layout>
    );
  }

  // Render error state
  if (notificationsError || countsError) {
    const errorMessage = notificationsError?.message || countsError?.message;

    return (
      <Layout>
        <View className="flex-1 p-4">
          <BackBtn title="Notifications" />

          <View className="flex-1 justify-center items-center">
            <View className="bg-red-50 p-6 rounded-xl w-full max-w-md">
              <Text className="text-red-800 font-bold text-lg text-center mb-2">
                Failed to Load Notifications
              </Text>
              <Text className="text-red-600 text-center mb-4">
                {errorMessage || "An error occurred"}
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                className="bg-red-100 py-3 rounded-lg"
              >
                <Text className="text-red-700 font-medium text-center">
                  {isRefetchingNotifications ? "Retrying..." : "Try Again"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Layout>
    );
  }

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20 px-8">
      <Bell size={80} color="#D1D5DB" />
      <Text className="text-2xl font-textBold text-gray-500 text-center mt-6">
        {filterTab === "unread"
          ? "No unread notifications"
          : "No notifications yet"}
      </Text>
      <Text className="text-lg text-gray-400 font-regular text-center mt-2">
        {filterTab === "unread"
          ? "You're all caught up!"
          : "Your notifications will appear here."}
      </Text>
    </View>
  );

  return (
    <Layout>
      <View className="flex-1">
        {/* Header */}
        <View className="pt-4 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <BackBtn title="Notifications" />

            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Text className="text-blue-500 font-semiBold text-base">
                    Mark all as read
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row px-4 py-3 border-b border-gray-200 bg-white">
          <TouchableOpacity
            onPress={() => setFilterTab("all")}
            className={`flex-1 py-3 px-4 rounded-lg mr-2 ${
              filterTab === "all" ? "bg-gray-100" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center font-semiBold text-base ${
                filterTab === "all" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterTab("unread")}
            className={`flex-1 py-3 px-4 rounded-lg ${
              filterTab === "unread" ? "bg-gray-100" : "bg-transparent"
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Text
                className={`text-center font-semiBold text-base ${
                  filterTab === "unread" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Unread
              </Text>
              {unreadCount > 0 && (
                <View className="bg-blue-500 rounded-full px-2 py-1 ml-2 min-w-6">
                  <Text className="text-white text-xs font-semiBold text-center">
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View className="flex-1">
          <SectionList
            sections={groupedNotifications}
            renderItem={renderNotificationItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isRefetchingNotifications}
                onRefresh={handleRefresh}
                colors={["#3B82F6"]}
                tintColor="#3B82F6"
              />
            }
          />
        </View>
      </View>
    </Layout>
  );
};

export default Notifications;
