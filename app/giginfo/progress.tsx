import BackBtn from "@/components/BackBtn/BackBtn";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { API_BASE_URL } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pause, Play, Square } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Progress = () => {
  const router = useRouter();
  const { gigInfo } = useLocalSearchParams();
  const gig = gigInfo ? JSON.parse(gigInfo as string) : null;

  const [selectedStatus, setSelectedStatus] = useState(
    gig?.status || "not_started"
  );
  const [progressPercentage, setProgressPercentage] = useState(
    gig?.progressPercentage || 0
  );
  const [notes, setNotes] = useState(gig?.notes || "");
  const [timerStatus, setTimerStatus] = useState<"idle" | "running" | "paused">(
    "idle"
  );
  const [trackedTime, setTrackedTime] = useState(0); // Current session time in seconds
  const [amountPaid, setAmountPaid] = useState(
    gig?.amountPaid?.toString() || "0"
  );
  const [previousStatus, setPreviousStatus] = useState(
    gig?.status || "not_started"
  );
  const [saving, setSaving] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeSummary, setTimeSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(
    gig?.totalTimeSpent || 0
  ); // Total time spent in minutes

  // Refs for timer
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const savedDurationRef = useRef<number>(0); // Duration before current session in minutes

  // Project details from gig
  const totalProjectAmount = gig?.budget || 0;
  const projectId = gig?._id;

  // Map status options to match your backend
  const statusOptions = ["not_started", "in_progress", "on_hold", "completed"];

  const statusDisplayNames = {
    not_started: "Not Started",
    in_progress: "In Progress",
    on_hold: "On Hold",
    completed: "Completed",
  };

  // Fetch current timer and time summary on component mount
  useEffect(() => {
    if (projectId) {
      fetchCurrentTimer();
      fetchTimeSummary();
    }

    return () => {
      stopLocalTimer();
    };
  }, [projectId]);

  // Timer effect for counting
  useEffect(() => {
    if (timerStatus === "running") {
      startLocalTimer();
    } else {
      stopLocalTimer();
    }
  }, [timerStatus]);

  // Fetch time summary
  const fetchTimeSummary = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token || !projectId) return;

      setSummaryLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/time/summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTimeSummary(data.data);
          // Update total time spent from the summary
          if (data.data.project?.totalTimeSpent) {
            setTotalTimeSpent(data.data.project.totalTimeSpent);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching time summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchCurrentTimer = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token || !projectId) return;

      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/time/current`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const timerData = data.data;
          setCurrentTimer(timerData);

          if (timerData.entry) {
            if (timerData.entry.status === "running") {
              // Timer is running
              const startTime = new Date(timerData.entry.startTime);
              startTimeRef.current = startTime;

              // Get saved duration from backend (in minutes)
              const savedMinutes = timerData.currentDuration || 0;
              savedDurationRef.current = savedMinutes;

              // Calculate elapsed seconds since the timer started/resumed
              const now = new Date();
              const elapsedSeconds = Math.floor(
                (now.getTime() - startTime.getTime()) / 1000
              );

              // Total time in seconds = saved minutes converted to seconds + elapsed seconds
              const totalSeconds = savedMinutes * 60 + elapsedSeconds;

              setTrackedTime(totalSeconds);
              setTimerStatus("running");
            } else if (timerData.entry.status === "paused") {
              // Timer is paused
              setTimerStatus("paused");
              const savedMinutes = timerData.currentDuration || 0;
              savedDurationRef.current = savedMinutes;
              // Convert minutes to seconds for display
              setTrackedTime(savedMinutes * 60);
              startTimeRef.current = null;
            }
          } else {
            // No active timer
            setTimerStatus("idle");
            setTrackedTime(0);
            savedDurationRef.current = 0;
            startTimeRef.current = null;
          }
        }
      } else {
        setTimerStatus("idle");
        setTrackedTime(0);
        savedDurationRef.current = 0;
        startTimeRef.current = null;
      }
    } catch (error) {
      console.error("Error fetching timer:", error);
      setTimerStatus("idle");
      setTrackedTime(0);
      savedDurationRef.current = 0;
      startTimeRef.current = null;
    }
  };

  const startLocalTimer = () => {
    stopLocalTimer(); // Clear any existing timer

    intervalRef.current = setInterval(() => {
      setTrackedTime((prev) => {
        // If we have a start time, calculate total time correctly
        if (startTimeRef.current) {
          const now = new Date();
          const elapsedSeconds = Math.floor(
            (now.getTime() - startTimeRef.current.getTime()) / 1000
          );
          // savedDurationRef.current is in minutes, convert to seconds
          return savedDurationRef.current * 60 + elapsedSeconds;
        }
        // For paused timer or fresh start, just return current value
        return prev;
      });
    }, 1000);
  };

  const stopLocalTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle status changes
  const handleStatusChange = (newStatus: string) => {
    if (
      previousStatus === "completed" &&
      newStatus === "in_progress" &&
      progressPercentage === 100
    ) {
      setProgressPercentage(75);
    }

    if (newStatus === "completed") {
      setProgressPercentage(100);
    }

    if (newStatus === "not_started") {
      setProgressPercentage(0);
    }

    // Stop timer if status changes to completed or on_hold
    if (
      (newStatus === "completed" || newStatus === "on_hold") &&
      timerStatus !== "idle"
    ) {
      handleStopTimer();
    }

    setPreviousStatus(selectedStatus);
    setSelectedStatus(newStatus);
  };

  const handleStartTimer = async () => {
    if (!projectId) {
      Alert.alert("Error", "Project ID not found");
      return;
    }

    if (selectedStatus === "completed" || selectedStatus === "on_hold") {
      Alert.alert(
        "Cannot Start Timer",
        selectedStatus === "completed"
          ? "The project is marked as completed. Please change the status to continue tracking time."
          : "The project is on hold. Please change the status to 'In Progress' to track time."
      );
      return;
    }

    if (selectedStatus === "not_started") {
      setPreviousStatus(selectedStatus);
      setSelectedStatus("in_progress");
    }

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        router.replace("/auth/login");
        return;
      }

      if (timerStatus === "paused") {
        await resumeTimeTracking();
      } else {
        await startTimeTracking();
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      Alert.alert("Error", "Failed to start timer");
    }
  };

  const startTimeTracking = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/time/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: "Working on project",
            billable: true,
            tags: [],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Reset refs for fresh start
          savedDurationRef.current = 0; // In minutes
          startTimeRef.current = new Date(data.data.startTime);

          // Start fresh session
          setTrackedTime(0);
          setTimerStatus("running");

          // Fetch updated timer data
          await fetchCurrentTimer();
          await fetchTimeSummary();

          Alert.alert("Success", "Timer started");
        }
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to start timer");
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      throw error;
    }
  };

  const handlePauseTimer = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/time/pause`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Use the durationSoFar from backend (in minutes)
          if (data.data && data.data.durationSoFar !== undefined) {
            savedDurationRef.current = data.data.durationSoFar;
            // Convert minutes to seconds for display
            setTrackedTime(data.data.durationSoFar * 60);
          } else {
            // Fallback: convert current tracked time from seconds to minutes
            savedDurationRef.current = Math.floor(trackedTime / 60);
          }

          startTimeRef.current = null;

          // Stop local timer and update status
          stopLocalTimer();
          setTimerStatus("paused");

          // Fetch updated data
          await fetchTimeSummary();

          Alert.alert("Success", "Timer paused");
        }
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to pause timer");
      }
    } catch (error) {
      console.error("Error pausing timer:", error);
      Alert.alert("Error", "Failed to pause timer");
    }
  };

  const resumeTimeTracking = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/time/resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // IMPORTANT: Fetch the updated timer data which will have the new startTime
          // and the saved duration from before the pause
          await fetchCurrentTimer();

          // Update status - fetchCurrentTimer should already set it to "running"
          // and startLocalTimer should be called by the useEffect

          await fetchTimeSummary();

          Alert.alert("Success", "Timer resumed");
        }
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to resume timer");
      }
    } catch (error) {
      console.error("Error resuming timer:", error);
      throw error;
    }
  };

  const handleStopTimer = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/time/stop`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Stop local timer
          stopLocalTimer();
          setTimerStatus("idle");

          // Reset refs
          savedDurationRef.current = 0;
          startTimeRef.current = null;
          setTrackedTime(0);

          // Clear current timer
          setCurrentTimer(null);

          // IMMEDIATELY fetch updated time summary
          await fetchTimeSummary();

          Alert.alert("Success", "Timer stopped");
        }
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to stop timer");
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      Alert.alert("Error", "Failed to stop timer");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatSecondsToMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return formatMinutes(minutes);
  };

  const calculatePaymentPercentage = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (totalProjectAmount === 0) return 0;
    return Math.min((paid / totalProjectAmount) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleSaveUpdate = async () => {
    try {
      setSaving(true);

      // Stop timer if running
      if (timerStatus === "running") {
        await handleStopTimer();
      }

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        router.replace("/auth/login");
        return;
      }

      if (!projectId) {
        Alert.alert("Error", "Project ID not found");
        setSaving(false);
        return;
      }

      const updateData: any = {
        status: selectedStatus,
        progressPercentage: progressPercentage,
        notes: notes.trim(),
        amountPaid: parseFloat(amountPaid) || 0,
      };

      if (gig?.format === "milestone") {
        updateData.milestones = gig.milestones || [];
      }

      const response = await fetch(`${API_BASE_URL}/api/project/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          `Progress updated successfully!\nTotal time spent: ${formatMinutes(
            totalTimeSpent
          )}\nAmount paid: ${formatCurrency(parseFloat(amountPaid) || 0)}`
        );

        router.replace({
          pathname: "/giginfo/personalgiginfo",
          params: {
            gigInfo: JSON.stringify(data.data),
          },
        });
      } else {
        let errorMessage = data.message || "Failed to update project";

        if (response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
          await AsyncStorage.clear();
          router.replace("/auth/login");
        } else if (response.status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors
              .map((err: any) => err.message || err)
              .join("\n");
          } else if (data.error) {
            errorMessage = data.error;
          }
        }

        Alert.alert("Update Failed", errorMessage);
      }
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePercentageChange = (percentage: number) => {
    setProgressPercentage(percentage);
  };

  const isTimerDisabled =
    selectedStatus === "completed" || selectedStatus === "on_hold";

  if (!gig) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center bg-[#F6F6F1]">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-700">Loading project...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-4">
          <BackBtn title="Update Project Status" />
        </View>

        {/* Project Info */}
        <View className="py-6 bg-[#F9FAFC] rounded-lg border border-secondary p-4 mt-5">
          <Text className="text-lg font-semiBold text-gray-900 mb-1">
            Project: {gig.title || "Untitled Project"}
          </Text>
          <Text className="text-base font-regular text-gray-600">
            Client: {gig.client?.name || gig.clientInfo?.name || "No client"}
          </Text>
          <Text className="text-base font-regular text-gray-600 mt-1">
            Budget: {formatCurrency(gig.budget || 0)}
          </Text>
          <Text className="text-base font-regular text-gray-600 mt-1">
            Total Time: {formatMinutes(totalTimeSpent)}
          </Text>
        </View>

        {/* Status Section */}
        <View className="py-6 border-b border-gray-100">
          <Text className="text-lg font-semiBold text-gray-900 mb-4">
            Status
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => handleStatusChange(status)}
                className={`px-4 py-4 flex-1 basis-[48%] w-[23%] flex justify-center items-center rounded-lg border ${
                  selectedStatus === status
                    ? "bg-secondary border-secondary"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`font-semiBold ${
                    selectedStatus === status ? "text-white" : "text-gray-600"
                  }`}
                >
                  {statusDisplayNames[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Tracking Section */}
        <View className="py-6 border-b border-gray-100">
          <Text className="text-lg font-semiBold text-gray-900 mb-4">
            Track Time
          </Text>

          {/* Timer Display */}
          <View className="items-center mb-6">
            <Text className="text-5xl font-textBold text-secondary mb-2">
              {formatTime(trackedTime)}
            </Text>
            <Text className="text-base font-regular text-gray-600">
              Current Session: {formatSecondsToMinutes(trackedTime)}
            </Text>
            {currentTimer?.entry && (
              <Text className="text-sm font-regular text-gray-500 mt-2">
                {timerStatus === "running"
                  ? "Running"
                  : timerStatus === "paused"
                  ? "Paused"
                  : "Stopped"}{" "}
                since{" "}
                {new Date(currentTimer.entry.startTime).toLocaleTimeString()}
              </Text>
            )}
          </View>

          {/* Timer Controls */}
          <View className="flex-row gap-3">
            {/* Start/Resume Button */}
            <TouchableOpacity
              onPress={handleStartTimer}
              className={`flex-1 py-4 rounded-lg border-2 flex-row items-center justify-center gap-2 ${
                isTimerDisabled
                  ? "bg-gray-300 border-gray-300"
                  : timerStatus === "running"
                  ? "hidden"
                  : "bg-secondary border-secondary"
              }`}
              disabled={isTimerDisabled || timerStatus === "running"}
            >
              <Play size={20} color={isTimerDisabled ? "#6B7280" : "white"} />
              <Text
                className={`font-semiBold text-center text-base ${
                  isTimerDisabled ? "text-gray-500" : "text-white"
                }`}
              >
                {timerStatus === "paused" ? "Resume" : "Start"}
              </Text>
            </TouchableOpacity>

            {/* Pause Button */}
            <TouchableOpacity
              onPress={handlePauseTimer}
              className={`flex-1 py-4 rounded-lg border-2 flex-row items-center justify-center gap-2 ${
                timerStatus === "running"
                  ? "bg-yellow-500 border-yellow-500"
                  : "hidden"
              }`}
              disabled={timerStatus !== "running"}
            >
              <Pause size={20} color="white" />
              <Text className="font-semiBold text-center text-base text-white">
                Pause
              </Text>
            </TouchableOpacity>

            {/* Stop Button */}
            <TouchableOpacity
              onPress={handleStopTimer}
              className={`flex-1 py-4 rounded-lg border-2 flex-row items-center justify-center gap-2 ${
                timerStatus !== "idle"
                  ? "bg-red-500 border-red-500"
                  : "bg-gray-200 border-gray-300"
              }`}
              disabled={timerStatus === "idle"}
            >
              <Square
                size={20}
                color={timerStatus !== "idle" ? "white" : "#9CA3AF"}
              />
              <Text
                className={`font-semiBold text-center text-base ${
                  timerStatus !== "idle" ? "text-white" : "text-gray-500"
                }`}
              >
                Stop
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timer Status */}
          <View className="mt-4">
            <Text className="text-sm font-regular text-gray-600">
              Timer Status:{" "}
              <Text
                className={`font-semiBold ${
                  timerStatus === "running"
                    ? "text-green-600"
                    : timerStatus === "paused"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {timerStatus === "running"
                  ? "Running"
                  : timerStatus === "paused"
                  ? "Paused"
                  : "Not Started"}
              </Text>
            </Text>
          </View>
        </View>

        {/* Payment Tracking Section */}
        <View className="py-6 border-b border-gray-100">
          <Text className="text-lg font-semiBold text-gray-900 mb-4">
            Payment Status
          </Text>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-sm font-regular text-gray-700 mb-2">
              Amount Paid So Far
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <Text className="text-lg font-semiBold text-gray-600 mr-2">
                $
              </Text>
              <TextInput
                className="flex-1 py-4 text-gray-900 font-regular text-base"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={amountPaid}
                onChangeText={setAmountPaid}
                keyboardType="decimal-pad"
                editable={!saving}
              />
            </View>
          </View>

          {/* Payment Summary */}
          <View className="bg-[#F9FAFC] rounded-lg border border-gray-200 p-4 mb-4">
            <View className="flex-row justify-between mb-3">
              <Text className="text-sm font-regular text-gray-600">
                Amount Paid
              </Text>
              <Text className="text-sm font-semiBold text-gray-900">
                {formatCurrency(parseFloat(amountPaid) || 0)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-sm font-regular text-gray-600">
                Total Budget
              </Text>
              <Text className="text-sm font-semiBold text-gray-900">
                {formatCurrency(totalProjectAmount)}
              </Text>
            </View>
            <View className="border-t border-gray-300 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-sm font-semiBold text-gray-900">
                  Remaining
                </Text>
                <Text className="text-sm font-semiBold text-secondary">
                  {formatCurrency(
                    totalProjectAmount - (parseFloat(amountPaid) || 0)
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Progress Bar */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-regular text-gray-700">
                Payment Progress
              </Text>
              <Text className="text-sm font-semiBold text-secondary">
                {calculatePaymentPercentage().toFixed(0)}%
              </Text>
            </View>
            <View className="w-full bg-gray-200 rounded-full h-2">
              <View
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${calculatePaymentPercentage()}%` }}
              />
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View className="py-4 border-b border-gray-100">
          <Text className="text-lg font-semiBold text-gray-900 mb-4">
            Project Progress
          </Text>

          {/* Percentage Display */}
          <View className="items-center mb-6">
            <Text className="text-5xl font-textBold text-secondary mb-2">
              {progressPercentage}%
            </Text>
            <Text className="text-base font-regular text-gray-600">
              Percentage
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <View
              className="bg-secondary h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>

          {/* Percentage Quick Select */}
          <View className="flex-row justify-between">
            {[0, 25, 50, 75, 100].map((percentage) => (
              <TouchableOpacity
                key={percentage}
                onPress={() => handlePercentageChange(percentage)}
                className={`px-4 py-4 border-secondary border rounded-lg ${
                  progressPercentage === percentage
                    ? "bg-secondary"
                    : "bg-white"
                }`}
                disabled={saving}
              >
                <Text
                  className={`font-semiBold ${
                    progressPercentage === percentage
                      ? "text-white"
                      : "text-secondary"
                  }`}
                >
                  {percentage}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Section */}
        <View className="py-6">
          <Text className="text-lg font-semiBold text-gray-900 mb-4">
            Notes
          </Text>
          <TextInput
            className="bg-gray-50 rounded-xl p-4 border border-gray-200 font-regular text-gray-900 min-h-[120px]"
            placeholder="Enter detailed notes about your progress..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            numberOfLines={6}
            editable={!saving}
          />
        </View>

        {/* Save Button */}
        {saving ? (
          <View className="py-4 flex-row rounded-lg items-center justify-center bg-gray-400">
            <ActivityIndicator color="white" />
            <Text className="text-white ml-2">Saving...</Text>
          </View>
        ) : (
          <PrimaryBtn
            handlePress={handleSaveUpdate}
            text="Save Update"
            disabled={saving}
          />
        )}
      </ScrollView>
    </Layout>
  );
};

export default Progress;
