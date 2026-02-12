import BackBtn from "@/components/BackBtn/BackBtn";
import Calendar from "@/components/Calender/Calender"; // Assuming you have this component
import Layout from "@/components/Layout/Layout";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.85;

type Priority = "low" | "medium" | "high";
type Status = "todo" | "in_progress" | "review" | "done";

// Update Task interface
interface Task {
  _id: string;
  id?: string;
  title: string;
  projectId: string;
  dueDate: string; // Formatted for display
  dueDateISO: string; // Original ISO string
  priority: Priority;
  description?: string;
  tags?: string[];
  status: Status;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface Column {
  id: Status;
  title: string;
  count: number;
  tasks: Task[];
  color?: string;
  wipLimit?: number | null;
}

interface ProjectData {
  _id: string;
  name: string;
  description?: string;
}

interface TaskStats {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  total: number;
}

interface ApiBoardResponse {
  success: boolean;
  data: {
    board: {
      todo: Task[];
      in_progress: Task[];
      review: Task[];
      done: Task[];
    };
    stats: TaskStats;
    boardSettings: {
      columns: {
        todo: { name: string; color: string; wipLimit: number | null };
        in_progress: { name: string; color: string; wipLimit: number | null };
        review: { name: string; color: string; wipLimit: number | null };
        done: { name: string; color: string; wipLimit: number | null };
      };
    };
    totalTasks: number;
  };
}

const Board: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { gigInfo } = useLocalSearchParams();
  const gig = gigInfo ? JSON.parse(gigInfo as string) : null;

  const projectData = gig;
  const projectId = gig?._id;

  const { getToken } = useAuth(); // ✅ hook at top level
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const t = await getToken();
      setToken(t);
    };
    fetchToken();
  }, [getToken]);

  // State for columns - will be populated from API
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", count: 0, tasks: [], color: "#4299E1" },
    {
      id: "in_progress",
      title: "In Progress",
      count: 0,
      tasks: [],
      color: "#ED8936",
    },
    { id: "review", title: "Review", count: 0, tasks: [], color: "#9F7AEA" },
    { id: "done", title: "Done", count: 0, tasks: [], color: "#48BB78" },
  ]);

  // Modal states
  const [editBoardModalVisible, setEditBoardModalVisible] = useState(false);
  const [deleteBoardModalVisible, setDeleteBoardModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
  const [moveTaskModalVisible, setMoveTaskModalVisible] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [viewTaskModalVisible, setViewTaskModalVisible] = useState(false);

  // Editing states
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [editingTask, setEditingTask] = useState<{
    task: Task;
    columnId: string;
  } | null>(null);
  const [viewingTask, setViewingTask] = useState<{
    task: Task;
    columnId: string;
  } | null>(null);
  const [taskToMove, setTaskToMove] = useState<{
    task: Task;
    fromColumnId: string;
  } | null>(null);
  const [selectedColumnForTask, setSelectedColumnForTask] = useState<
    string | null
  >(null);

  // Calendar state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Form states
  const [newColumnName, setNewColumnName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTags, setTaskTags] = useState("");

  // Fetch project tasks - UPDATED to match your API response structure
  const fetchProjectTasks = async (): Promise<ApiBoardResponse> => {
    console.log(`Fetching board for project: ${projectId}`);

    const response = await fetch(
      `${API_BASE_URL}/api/project/${projectId}/tasks`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    const data: ApiBoardResponse = await response.json();

    console.log("API Response received:", {
      success: data.success,
      hasBoard: !!data.data?.board,
      totalTasks: data.data?.totalTasks,
    });

    if (!data.success) {
      throw new Error(data.data?.message || "Failed to fetch board data");
    }

    return data;
  };

  // Format date from ISO string to readable format
  const formatDueDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "No date";
    }
  };

  // Format date to ISO string for API
  const formatDateToISO = (date: Date): string => {
    return date.toISOString();
  };

  // Format date for display in input field
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Transform API tasks to our Task interface
  const transformApiTask = (apiTask: any): Task => {
    return {
      _id: apiTask._id,
      id: apiTask._id,
      title: apiTask.title,
      projectId: apiTask.projectId,
      dueDate: formatDueDate(apiTask.dueDate), // Display date
      dueDateISO: apiTask.dueDate, // Store original ISO for editing
      priority: apiTask.priority,
      description: apiTask.description,
      tags: apiTask.tags || [],
      status: apiTask.status,
      position: apiTask.position,
      createdAt: apiTask.createdAt,
      updatedAt: apiTask.updatedAt,
    };
  };

  // React Query hooks
  const {
    data: boardData,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
    isRefetching: isRefetchingTasks,
  } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: fetchProjectTasks,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!projectId,
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Query error:", error);
    },
  });

  // Update columns when board data changes
  useEffect(() => {
    if (boardData?.success && boardData.data) {
      const { board, boardSettings, stats } = boardData.data;

      console.log("Updating columns with board data:", {
        todoCount: board.todo?.length || 0,
        inProgressCount: board.in_progress?.length || 0,
        reviewCount: board.review?.length || 0,
        doneCount: board.done?.length || 0,
      });

      const updatedColumns: Column[] = [
        {
          id: "todo",
          title: boardSettings.columns.todo.name,
          count: stats.todo,
          tasks: (board.todo || []).map(transformApiTask),
          color: boardSettings.columns.todo.color,
          wipLimit: boardSettings.columns.todo.wipLimit,
        },
        {
          id: "in_progress",
          title: boardSettings.columns.in_progress.name,
          count: stats.in_progress,
          tasks: (board.in_progress || []).map(transformApiTask),
          color: boardSettings.columns.in_progress.color,
          wipLimit: boardSettings.columns.in_progress.wipLimit,
        },
        {
          id: "review",
          title: boardSettings.columns.review.name,
          count: stats.review,
          tasks: (board.review || []).map(transformApiTask),
          color: boardSettings.columns.review.color,
          wipLimit: boardSettings.columns.review.wipLimit,
        },
        {
          id: "done",
          title: boardSettings.columns.done.name,
          count: stats.done,
          tasks: (board.done || []).map(transformApiTask),
          color: boardSettings.columns.done.color,
          wipLimit: boardSettings.columns.done.wipLimit,
        },
      ];

      console.log(
        "Updated columns:",
        updatedColumns.map((col) => ({
          title: col.title,
          count: col.count,
          tasksCount: col.tasks.length,
        }))
      );

      setColumns(updatedColumns);
    } else {
      console.log("No board data available yet");
    }
  }, [boardData]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (
      taskData: Omit<
        Task,
        "_id" | "id" | "createdAt" | "updatedAt" | "position"
      >
    ) => {
      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            tags: taskData.tags,
            status: taskData.status,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      Alert.alert("Success", "Task created successfully");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to create task");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<Task>;
    }) => {
      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: updates.title,
            description: updates.description,
            dueDate: updates.dueDate,
            priority: updates.priority,
            tags: updates.tags,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      Alert.alert("Success", "Task updated successfully");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to update task");
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      newStatus,
    }: {
      taskId: string;
      newStatus: Status;
    }) => {
      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/tasks/${taskId}/move`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to move task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to move task");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(
        `${API_BASE_URL}/api/project/${projectId}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      Alert.alert("Success", "Task deleted successfully");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to delete task");
    },
  });

  // UI Helper Functions
  const getPriorityDotColor = (priority: Priority): string => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getPriorityText = (priority: Priority): string => {
    switch (priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      case "low":
        return "Low Priority";
      default:
        return "Priority";
    }
  };

  const getPriorityButtonColor = (
    priority: Priority,
    isSelected: boolean
  ): string => {
    if (!isSelected) return "border-secondary border";
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Event Handlers
  const handleViewTask = (task: Task, columnId: string) => {
    setViewingTask({ task, columnId });
    setViewTaskModalVisible(true);
  };

  const handleEditBoard = (column: Column) => {
    setEditingColumn(column);
    setNewColumnName(column.title);
    setEditBoardModalVisible(true);
  };

  const handleSaveBoardEdit = () => {
    if (!editingColumn || !newColumnName.trim()) return;

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === editingColumn.id
          ? { ...col, title: newColumnName.trim() }
          : col
      )
    );

    setEditBoardModalVisible(false);
    setEditingColumn(null);
    setNewColumnName("");
  };

  const handleDeleteBoard = (column: Column) => {
    if (column.tasks.length > 0) {
      Alert.alert(
        "Cannot Delete Board",
        "Please move all tasks to another board before deleting this board.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (columns.length <= 2) {
      Alert.alert("Cannot Delete Board", "You must have at least 2 boards.", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    setEditingColumn(column);
    setDeleteBoardModalVisible(true);
  };

  const confirmDeleteBoard = () => {
    if (!editingColumn) return;

    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.id !== editingColumn.id)
    );

    setDeleteBoardModalVisible(false);
    setEditingColumn(null);
  };

  const handleEditTask = (task: Task, columnId: string) => {
    setEditingTask({ task, columnId });
    setTaskTitle(task.title);
    setTaskProject(projectData?.name || "");

    // Parse the ISO date instead of the formatted date
    try {
      if (task.dueDate !== "No date") {
        // Use the original ISO date if available, or parse from display
        const isoDate = (task as any).dueDateISO || task.dueDate;
        const parsedDate = new Date(isoDate);

        if (!isNaN(parsedDate.getTime())) {
          // Ensure the date is not in the past by comparing with today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (parsedDate < today) {
            // If due date is in the past, set to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDate(tomorrow);
            setTaskDueDate(formatDateForDisplay(tomorrow));
          } else {
            setSelectedDate(parsedDate);
            setTaskDueDate(formatDateForDisplay(parsedDate));
          }
        } else {
          // Default to tomorrow if parsing fails
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setSelectedDate(tomorrow);
          setTaskDueDate(formatDateForDisplay(tomorrow));
        }
      } else {
        // Default to tomorrow if no date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow);
        setTaskDueDate(formatDateForDisplay(tomorrow));
      }
    } catch (error) {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
      setTaskDueDate(formatDateForDisplay(tomorrow));
    }

    setTaskPriority(task.priority);
    setTaskDescription(task.description || "");
    setTaskTags(task.tags?.join(", ") || "");
    setEditTaskModalVisible(true);
  };

  const handleSaveTaskEdit = () => {
    if (!editingTask || !taskTitle.trim()) return;

    // Use the selected date from calendar
    const isoDate = formatDateToISO(selectedDate);

    updateTaskMutation.mutate({
      taskId: editingTask.task._id,
      updates: {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        dueDate: isoDate,
        priority: taskPriority,
        tags: taskTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      },
    });

    setEditTaskModalVisible(false);
    setEditingTask(null);
    resetTaskForm();
  };

  const handleMoveTask = (task: Task, fromColumnId: string) => {
    setTaskToMove({ task, fromColumnId });
    setMoveTaskModalVisible(true);
  };

  const confirmMoveTask = (toColumnId: string) => {
    if (!taskToMove) return;

    moveTaskMutation.mutate({
      taskId: taskToMove.task._id,
      newStatus: toColumnId as Status,
    });

    setMoveTaskModalVisible(false);
    setTaskToMove(null);
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumnForTask(columnId);
    resetTaskForm();
    setAddTaskModalVisible(true);
  };

  const handleSaveNewTask = () => {
    if (!selectedColumnForTask || !taskTitle.trim()) return;

    // Use the selected date from calendar
    const isoDate = formatDateToISO(selectedDate);

    const newTask: Omit<
      Task,
      "_id" | "id" | "createdAt" | "updatedAt" | "position"
    > = {
      title: taskTitle.trim(),
      projectId: projectId!,
      dueDate: isoDate,
      priority: taskPriority,
      description: taskDescription.trim() || undefined,
      tags: taskTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      status: selectedColumnForTask as Status,
    };

    createTaskMutation.mutate(newTask);

    setAddTaskModalVisible(false);
    setSelectedColumnForTask(null);
    resetTaskForm();
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTaskMutation.mutate(taskId);
        },
      },
    ]);
  };

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskProject("");
    setTaskDueDate("");
    setSelectedDate(new Date());
    setTaskPriority("medium");
    setTaskDescription("");
    setTaskTags("");
  };

  // Calendar Handlers
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setTaskDueDate(formatDateForDisplay(date));
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  // Loading and error states
  if (tasksLoading && !boardData) {
    return (
      <Layout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Loading board...</Text>
        </View>
      </Layout>
    );
  }

  if (tasksError) {
    return (
      <Layout>
        <View className="flex-1 items-center justify-center p-6">
          <View className="p-4 bg-red-50 rounded-lg border border-red-100 w-full max-w-sm">
            <Text className="text-red-800 font-semiBold text-center mb-2">
              Error Loading Board
            </Text>
            <Text className="text-red-600 text-center mb-4">
              {tasksError.message || "Failed to load tasks"}
            </Text>
            <TouchableOpacity
              onPress={() => refetchTasks()}
              className="bg-red-100 py-3 rounded-lg"
              disabled={isRefetchingTasks}
            >
              {isRefetchingTasks ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#DC2626" />
                  <Text className="text-red-700 ml-2 font-medium">
                    Retrying...
                  </Text>
                </View>
              ) : (
                <Text className="text-red-700 font-medium text-center">
                  Try Again
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Layout>
    );
  }

  // Task Card Renderer
  const renderTaskCard = (task: Task, columnId: string) => {
    const dotColor = getPriorityDotColor(task.priority);
    const priorityText = getPriorityText(task.priority);

    return (
      <TouchableOpacity
        key={task._id}
        onPress={() => handleViewTask(task, columnId)}
        onLongPress={() => handleMoveTask(task, columnId)}
        activeOpacity={0.7}
        className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: dotColor }}
            />
            <Text className="text-sm font-regular text-gray-700">
              {priorityText}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleEditTask(task, columnId);
              }}
              className="p-2 mr-1"
            >
              <Ionicons name="create-outline" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteTask(task._id, columnId);
              }}
              className="p-2"
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-lg font-semiBold text-gray-900 mb-2"
          >
            {task.title}
          </Text>
          {task.description && (
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              className="text-sm font-regular text-gray-600 mb-3"
            >
              {task.description}
            </Text>
          )}
        </View>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-regular text-blue-600">
              Due: {task.dueDate}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Column Renderer
  const renderColumn = (column: Column) => {
    return (
      <View key={column.id} style={{ width: COLUMN_WIDTH }} className="mr-4">
        <View className="mb-4 p-3 rounded-lg">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-1">
              <Text className="text-lg font-textBold text-gray-900">
                {column.title}
              </Text>
              <Text className="text-sm font-regular text-gray-600">
                {column.tasks.length} tasks
              </Text>
            </View>
            {/* <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => handleEditBoard(column)}
                className="p-2 mr-1"
              >
                <Ionicons name="create-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteBoard(column)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View> */}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingTasks}
              onRefresh={() => {
                refetchTasks();
              }}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        >
          {column.tasks.map((task) => renderTaskCard(task, column.id))}
          {column.tasks.length === 0 && (
            <View className="bg-gray-50 rounded-xl p-8 items-center justify-center min-h-32 border-2 border-dashed border-gray-300">
              <Ionicons name="document-outline" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 font-textBold mt-2 text-center">
                No tasks yet
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <Layout>
      <View className="flex-1">
        <View className="py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <BackBtn title={projectData?.name || "Project Board"} />
          </View>
        </View>
        <Text className="text-gray-600 mt-2 font-regular mb-6 text-center">
          Hold any card to move it between boards
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{
            paddingVertical: 0,
          }}
          bounces={true}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingTasks}
              onRefresh={() => {
                refetchTasks();
              }}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        >
          {columns.map((column) => renderColumn(column))}
        </ScrollView>

        <TouchableOpacity
          className="absolute bottom-6 right-6 w-16 h-16 bg-blue-500 rounded-full items-center justify-center shadow-lg"
          onPress={() => {
            if (columns.length > 0) {
              handleAddTask(columns[0].id);
            }
          }}
          style={{
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar Component */}
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
        isDateModalOpen={showDatePicker}
        onDateConfirm={handleDateConfirm}
        setShowDatePicker={() => setShowDatePicker(false)}
      />

      {/* View Task Details Modal */}
      <Modal
        visible={viewTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setViewTaskModalVisible(false);
          setViewingTask(null);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-semiBold text-gray-900">
                Task Details
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setViewTaskModalVisible(false);
                  setViewingTask(null);
                }}
                className="w-8 h-8 justify-center items-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {viewingTask && (
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-semiBold text-gray-600 mb-1">
                    Title
                  </Text>
                  <Text className="text-lg font-semiBold text-gray-900">
                    {viewingTask.task.title}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-sm font-semiBold text-gray-600 mb-1">
                      Project
                    </Text>
                    <Text className="text-gray-900">
                      {projectData?.name || "Current Project"}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semiBold text-gray-600 mb-1">
                      Due Date
                    </Text>
                    <Text className="text-gray-900">
                      {viewingTask.task.dueDate}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-sm font-semiBold text-gray-600 mb-1">
                      Priority
                    </Text>
                    <View className="flex-row items-center">
                      <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor: getPriorityDotColor(
                            viewingTask.task.priority
                          ),
                        }}
                      />
                      <Text className="text-gray-900 capitalize">
                        {viewingTask.task.priority}
                      </Text>
                    </View>
                  </View>
                </View>

                {viewingTask.task.description && (
                  <View>
                    <Text className="text-sm font-semiBold text-gray-600 mb-2">
                      Description
                    </Text>
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-700 font-regular leading-5">
                        {viewingTask.task.description}
                      </Text>
                    </View>
                  </View>
                )}

                {viewingTask.task.tags && viewingTask.task.tags.length > 0 && (
                  <View>
                    <Text className="text-sm font-semiBold text-gray-600 mb-2">
                      Tags
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {viewingTask.task.tags.map((tag, index) => (
                        <View
                          key={index}
                          className="bg-blue-100 px-3 py-1 rounded-full"
                        >
                          <Text className="text-blue-800 text-sm font-regular">
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View className="flex-row gap-3 pt-4">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
                    onPress={() => {
                      setViewTaskModalVisible(false);
                      setViewingTask(null);
                    }}
                  >
                    <Text className="text-gray-700 font-semiBold">Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
                    onPress={() => {
                      if (viewingTask) {
                        handleEditTask(viewingTask.task, viewingTask.columnId);
                        setViewTaskModalVisible(false);
                        setViewingTask(null);
                      }
                    }}
                  >
                    <Text className="text-white font-semiBold">Edit Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Board Modal */}
      <Modal
        visible={editBoardModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setEditBoardModalVisible(false);
          setEditingColumn(null);
          setNewColumnName("");
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Edit Board
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditBoardModalVisible(false);
                  setEditingColumn(null);
                  setNewColumnName("");
                }}
                className="w-8 h-8 justify-center items-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="mb-6">
              <Text className="text-sm font-semiBold text-gray-600 mb-2">
                Board Name
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-4 text-gray-900 bg-white"
                placeholder="Enter board name..."
                placeholderTextColor="#9CA3AF"
                value={newColumnName}
                onChangeText={setNewColumnName}
                autoFocus={true}
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-4 rounded-lg items-center"
                onPress={() => {
                  setEditBoardModalVisible(false);
                  setEditingColumn(null);
                  setNewColumnName("");
                }}
              >
                <Text className="text-gray-700 font-semiBold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-500 py-4 rounded-lg items-center"
                onPress={handleSaveBoardEdit}
                disabled={!newColumnName.trim()}
              >
                <Text className="text-white font-semiBold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Board Modal */}
      <Modal
        visible={deleteBoardModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setDeleteBoardModalVisible(false);
          setEditingColumn(null);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <View className="mb-6">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4 self-center">
                <Ionicons name="trash" size={32} color="#EF4444" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                Delete Board?
              </Text>
              <Text className="text-gray-600 text-center">
                Are you sure you want to delete "{editingColumn?.title}"? This
                action cannot be undone.
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-4 rounded-lg items-center"
                onPress={() => {
                  setDeleteBoardModalVisible(false);
                  setEditingColumn(null);
                }}
              >
                <Text className="text-gray-700 font-semiBold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 py-4 rounded-lg items-center"
                onPress={confirmDeleteBoard}
              >
                <Text className="text-white font-semiBold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={editTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setEditTaskModalVisible(false);
          setEditingTask(null);
          resetTaskForm();
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="w-full max-w-md bg-white rounded-2xl p-6 mx-4 max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-semiBold text-gray-900">
                  Edit Task
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditTaskModalVisible(false);
                    setEditingTask(null);
                    resetTaskForm();
                  }}
                  className="w-8 h-8 justify-center items-center rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Task Title *
                </Text>
                <TextInput
                  className="border border-secondary font-regular rounded-lg p-4 text-gray-900 bg-white"
                  placeholder="Enter task title..."
                  placeholderTextColor="#9CA3AF"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />
              </View>

              {/* Due Date Field with Calendar Button */}
              <View className="mb-4">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Due Date
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    className="flex-1 border border-secondary font-regular rounded-lg p-4 text-gray-900 bg-white"
                    placeholder="Select due date..."
                    placeholderTextColor="#9CA3AF"
                    value={taskDueDate}
                    editable={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="ml-2 p-4 bg-blue-100 rounded-lg"
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Description
                </Text>
                <TextInput
                  className="border border-secondary font-regular rounded-lg p-4 text-gray-900 bg-white min-h-[100px]"
                  placeholder="Add task description..."
                  placeholderTextColor="#9CA3AF"
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Priority
                </Text>
                <View className="flex-row gap-2">
                  {(["low", "medium", "high"] as Priority[]).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      className={`flex-1 py-3 rounded-lg items-center ${getPriorityButtonColor(
                        priority,
                        taskPriority === priority
                      )}`}
                      onPress={() => setTaskPriority(priority)}
                    >
                      <Text
                        className={`font-semiBold capitalize ${
                          taskPriority === priority
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-4 rounded-lg items-center"
                  onPress={() => {
                    setEditTaskModalVisible(false);
                    setEditingTask(null);
                    resetTaskForm();
                  }}
                >
                  <Text className="text-gray-700 font-semiBold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-blue-500 py-4 rounded-lg items-center"
                  onPress={handleSaveTaskEdit}
                  disabled={!taskTitle.trim() || updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semiBold">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={addTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setAddTaskModalVisible(false);
          setSelectedColumnForTask(null);
          resetTaskForm();
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="w-full max-w-md bg-white rounded-2xl p-6 mx-4 max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-semiBold text-gray-900">
                  Add Task
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setAddTaskModalVisible(false);
                    setSelectedColumnForTask(null);
                    resetTaskForm();
                  }}
                  className="w-8 h-8 justify-center items-center rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Task Title *
                </Text>
                <TextInput
                  className="border border-gray-300 font-regular rounded-lg p-4 text-gray-900 bg-white"
                  placeholder="Enter task title..."
                  placeholderTextColor="#9CA3AF"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  autoFocus={true}
                />
              </View>

              {/* Due Date Field with Calendar Button for Add Task */}
              <View className="mb-4">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Due Date
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    className="flex-1 border border-gray-300 font-regular rounded-lg p-4 text-gray-900 bg-white"
                    placeholder="Select due date..."
                    placeholderTextColor="#9CA3AF"
                    value={taskDueDate}
                    editable={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="ml-2 p-4 bg-blue-100 rounded-lg"
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Description
                </Text>
                <TextInput
                  className="border border-gray-300 font-regular rounded-lg p-4 text-gray-900 bg-white min-h-[100px]"
                  placeholder="Add task description..."
                  placeholderTextColor="#9CA3AF"
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semiBold text-gray-600 mb-2">
                  Priority
                </Text>
                <View className="flex-row gap-2">
                  {(["low", "medium", "high"] as Priority[]).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      className={`flex-1 py-3 rounded-lg items-center ${getPriorityButtonColor(
                        priority,
                        taskPriority === priority
                      )}`}
                      onPress={() => setTaskPriority(priority)}
                    >
                      <Text
                        className={`font-semiBold capitalize ${
                          taskPriority === priority
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-4 rounded-lg items-center"
                  onPress={() => {
                    setAddTaskModalVisible(false);
                    setSelectedColumnForTask(null);
                    resetTaskForm();
                  }}
                >
                  <Text className="text-gray-700 font-semiBold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-blue-500 py-4 rounded-lg items-center"
                  onPress={handleSaveNewTask}
                  disabled={!taskTitle.trim() || createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semiBold">Add Task</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Move Task Modal */}
      <Modal
        visible={moveTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setMoveTaskModalVisible(false);
          setTaskToMove(null);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="w-full max-w-md bg-white rounded-2xl p-6 mx-4">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-textBold text-gray-900">
                Move Task
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setMoveTaskModalVisible(false);
                  setTaskToMove(null);
                }}
                className="w-8 h-8 justify-center items-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {taskToMove && (
              <>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-lg font-semiBold text-gray-900 mb-2"
                >
                  {taskToMove.task.title}
                </Text>
                <Text className="text-gray-600 font-regular mb-6">
                  Move this task to:
                </Text>

                <View className="space-y-3">
                  {columns
                    .filter((col) => col.id !== taskToMove.fromColumnId)
                    .map((column) => (
                      <Pressable
                        key={column.id}
                        onPress={() => confirmMoveTask(column.id)}
                        className="bg-blue-50 border-2 mb-3 border-blue-500 rounded-lg p-4"
                      >
                        <Text className="text-blue-600 font-semiBold text-center">
                          {column.title}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

export default Board;
