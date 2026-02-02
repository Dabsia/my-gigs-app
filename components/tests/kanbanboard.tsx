// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Dimensions,
//   Modal,
//   TextInput,
//   Alert,
//   Pressable,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { AntDesign } from "@expo/vector-icons";
// import Layout from "@/components/Layout/Layout";
// import BackBtn from "@/components/BackBtn/BackBtn";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const COLUMN_WIDTH = SCREEN_WIDTH * 0.85;

// type Priority = "low" | "medium" | "high";

// interface TeamMember {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   role?: string;
// }

// interface Task {
//   id: string;
//   title: string;
//   project: string;
//   dueDate: string;
//   priority: Priority;
//   assignedTo?: string;
//   message?: string;
// }

// interface Column {
//   id: string;
//   title: string;
//   count: number;
//   tasks: Task[];
// }

// const Board: React.FC = () => {
//   const router = useRouter();

//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
//     {
//       id: "1",
//       name: "You",
//       email: "you@company.com",
//       role: "Project Manager",
//     },
//     {
//       id: "2",
//       name: "Sarah Wilson",
//       email: "sarah.wilson@company.com",
//       role: "UI/UX Designer",
//     },
//     {
//       id: "3",
//       name: "Mike Chen",
//       email: "mike.chen@company.com",
//       role: "Frontend Developer",
//     },
//     {
//       id: "4",
//       name: "Emily Rodriguez",
//       email: "emily.rodriguez@company.com",
//       role: "Backend Developer",
//     },
//     {
//       id: "5",
//       name: "Alex Thompson",
//       email: "alex.thompson@company.com",
//       role: "QA Engineer",
//     },
//   ]);

//   const [columns, setColumns] = useState<Column[]>([
//     {
//       id: "todo",
//       title: "To Do",
//       count: 3,
//       tasks: [
//         {
//           id: "1",
//           title: "Design Login Screen Mockup",
//           project: "Zenith App",
//           dueDate: "Oct 26",
//           priority: "high",
//           assignedTo: "2",
//           message:
//             "Please focus on mobile-first design and ensure the login flow is intuitive for first-time users.",
//         },
//         {
//           id: "2",
//           title: "Develop API Endpoints",
//           project: "Zenith App",
//           dueDate: "Nov 5",
//           priority: "medium",
//           assignedTo: "4",
//           message:
//             "Need authentication endpoints and user profile management. Use JWT tokens for security.",
//         },
//         {
//           id: "3",
//           title: "User Testing Session",
//           project: "Wave CRM",
//           dueDate: "Nov 10",
//           priority: "low",
//           message:
//             "Schedule with 5-7 users and prepare feedback forms. Focus on usability testing.",
//         },
//       ],
//     },
//     {
//       id: "inProgress",
//       title: "In Progress",
//       count: 2,
//       tasks: [
//         {
//           id: "4",
//           title: "Mobile App Navigation",
//           project: "Zenith App",
//           dueDate: "Oct 28",
//           priority: "high",
//           assignedTo: "3",
//           message:
//             "Implement bottom tab navigation with smooth transitions. Ensure accessibility compliance.",
//         },
//         {
//           id: "5",
//           title: "Database Optimization",
//           project: "Wave CRM",
//           dueDate: "Nov 2",
//           priority: "medium",
//           assignedTo: "4",
//           message:
//             "Optimize query performance and add proper indexing. Monitor query execution times.",
//         },
//       ],
//     },
//     {
//       id: "review",
//       title: "Review",
//       count: 1,
//       tasks: [
//         {
//           id: "6",
//           title: "Code Review - Auth Module",
//           project: "Zenith App",
//           dueDate: "Oct 25",
//           priority: "medium",
//           assignedTo: "5",
//           message:
//             "Review security implementation and error handling. Check for potential vulnerabilities.",
//         },
//       ],
//     },
//     {
//       id: "done",
//       title: "Done",
//       count: 5,
//       tasks: [
//         {
//           id: "7",
//           title: "Project Setup",
//           project: "Zenith App",
//           dueDate: "Oct 20",
//           priority: "low",
//           assignedTo: "1",
//           message:
//             "Initial project structure with React Native, TypeScript, and basic navigation setup.",
//         },
//         {
//           id: "8",
//           title: "UI Kit Implementation",
//           project: "Zenith App",
//           dueDate: "Oct 22",
//           priority: "medium",
//           assignedTo: "3",
//           message:
//             "Design system components including buttons, inputs, and typography scales.",
//         },
//       ],
//     },
//   ]);

//   const [editBoardModalVisible, setEditBoardModalVisible] = useState(false);
//   const [deleteBoardModalVisible, setDeleteBoardModalVisible] = useState(false);
//   const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
//   const [moveTaskModalVisible, setMoveTaskModalVisible] = useState(false);
//   const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
//   const [assignMemberModalVisible, setAssignMemberModalVisible] =
//     useState(false);
//   const [viewTaskModalVisible, setViewTaskModalVisible] = useState(false);

//   const [editingColumn, setEditingColumn] = useState<Column | null>(null);
//   const [editingTask, setEditingTask] = useState<{
//     task: Task;
//     columnId: string;
//   } | null>(null);
//   const [viewingTask, setViewingTask] = useState<{
//     task: Task;
//     columnId: string;
//   } | null>(null);
//   const [taskToMove, setTaskToMove] = useState<{
//     task: Task;
//     fromColumnId: string;
//   } | null>(null);
//   const [taskToAssign, setTaskToAssign] = useState<{
//     task: Task;
//     columnId: string;
//   } | null>(null);
//   const [selectedColumnForTask, setSelectedColumnForTask] = useState<
//     string | null
//   >(null);

//   const [newColumnName, setNewColumnName] = useState("");
//   const [taskTitle, setTaskTitle] = useState("");
//   const [taskProject, setTaskProject] = useState("");
//   const [taskDueDate, setTaskDueDate] = useState("");
//   const [taskPriority, setTaskPriority] = useState<Priority>("medium");
//   const [taskAssignedTo, setTaskAssignedTo] = useState<string>("");
//   const [taskMessage, setTaskMessage] = useState<string>("");

//   const getPriorityDotColor = (priority: Priority): string => {
//     switch (priority) {
//       case "high":
//         return "#EF4444";
//       case "medium":
//         return "#F59E0B";
//       case "low":
//         return "#10B981";
//       default:
//         return "#6B7280";
//     }
//   };

//   const getPriorityText = (priority: Priority): string => {
//     switch (priority) {
//       case "high":
//         return "High Priority";
//       case "medium":
//         return "Medium Priority";
//       case "low":
//         return "Low Priority";
//       default:
//         return "Priority";
//     }
//   };

//   const getTeamMemberById = (id: string): TeamMember | undefined => {
//     return teamMembers.find((member) => member.id === id);
//   };

//   const getAssignedMemberName = (task: Task): string => {
//     if (!task.assignedTo) return "Unassigned";
//     const member = getTeamMemberById(task.assignedTo);
//     return member ? member.name : "Unassigned";
//   };

//   const getAssignedMemberInitials = (task: Task): string => {
//     if (!task.assignedTo) return "?";
//     const member = getTeamMemberById(task.assignedTo);
//     if (!member) return "?";

//     return member.name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getAssignedMemberColor = (task: Task): string => {
//     if (!task.assignedTo) return "#6B7280";

//     const colors = [
//       "#EF4444",
//       "#F59E0B",
//       "#10B981",
//       "#3B82F6",
//       "#8B5CF6",
//       "#EC4899",
//       "#06B6D4",
//       "#84CC16",
//     ];
//     const memberIndex = teamMembers.findIndex(
//       (member) => member.id === task.assignedTo
//     );
//     return colors[memberIndex % colors.length];
//   };

//   const updateColumnCounts = (cols: Column[]) => {
//     return cols.map((col) => ({
//       ...col,
//       count: col.tasks.length,
//     }));
//   };

//   const moveTask = (
//     taskId: string,
//     fromColumnId: string,
//     toColumnId: string
//   ) => {
//     if (fromColumnId === toColumnId) return;

//     setColumns((prevColumns) => {
//       const newColumns = [...prevColumns];
//       const fromColumnIndex = newColumns.findIndex(
//         (col) => col.id === fromColumnId
//       );
//       const toColumnIndex = newColumns.findIndex(
//         (col) => col.id === toColumnId
//       );

//       if (fromColumnIndex === -1 || toColumnIndex === -1) return prevColumns;

//       const taskIndex = newColumns[fromColumnIndex].tasks.findIndex(
//         (task) => task.id === taskId
//       );
//       if (taskIndex === -1) return prevColumns;

//       const [task] = newColumns[fromColumnIndex].tasks.splice(taskIndex, 1);
//       newColumns[toColumnIndex].tasks.push(task);

//       return updateColumnCounts(newColumns);
//     });
//   };

//   const handleViewTask = (task: Task, columnId: string) => {
//     setViewingTask({ task, columnId });
//     setViewTaskModalVisible(true);
//   };

//   const handleAssignMember = (task: Task, columnId: string) => {
//     setTaskToAssign({ task, columnId });
//     setTaskAssignedTo(task.assignedTo || "");
//     setAssignMemberModalVisible(true);
//   };

//   const confirmAssignMember = (memberId: string) => {
//     if (!taskToAssign) return;

//     setColumns((prevColumns) =>
//       prevColumns.map((col) =>
//         col.id === taskToAssign.columnId
//           ? {
//               ...col,
//               tasks: col.tasks.map((t) =>
//                 t.id === taskToAssign.task.id
//                   ? { ...t, assignedTo: memberId }
//                   : t
//               ),
//             }
//           : col
//       )
//     );

//     setAssignMemberModalVisible(false);
//     setTaskToAssign(null);
//     setTaskAssignedTo("");
//   };

//   const removeAssignment = () => {
//     if (!taskToAssign) return;

//     setColumns((prevColumns) =>
//       prevColumns.map((col) =>
//         col.id === taskToAssign.columnId
//           ? {
//               ...col,
//               tasks: col.tasks.map((t) =>
//                 t.id === taskToAssign.task.id
//                   ? { ...t, assignedTo: undefined }
//                   : t
//               ),
//             }
//           : col
//       )
//     );

//     setAssignMemberModalVisible(false);
//     setTaskToAssign(null);
//     setTaskAssignedTo("");
//   };

//   const handleEditBoard = (column: Column) => {
//     setEditingColumn(column);
//     setNewColumnName(column.title);
//     setEditBoardModalVisible(true);
//   };

//   const handleSaveBoardEdit = () => {
//     if (!editingColumn || !newColumnName.trim()) return;

//     setColumns((prevColumns) =>
//       prevColumns.map((col) =>
//         col.id === editingColumn.id
//           ? { ...col, title: newColumnName.trim() }
//           : col
//       )
//     );

//     setEditBoardModalVisible(false);
//     setEditingColumn(null);
//     setNewColumnName("");
//   };

//   const handleDeleteBoard = (column: Column) => {
//     if (column.tasks.length > 0) {
//       Alert.alert(
//         "Cannot Delete Board",
//         "Please move all tasks to another board before deleting this board.",
//         [{ text: "OK", style: "default" }]
//       );
//       return;
//     }

//     if (columns.length <= 2) {
//       Alert.alert("Cannot Delete Board", "You must have at least 2 boards.", [
//         { text: "OK", style: "default" },
//       ]);
//       return;
//     }

//     setEditingColumn(column);
//     setDeleteBoardModalVisible(true);
//   };

//   const confirmDeleteBoard = () => {
//     if (!editingColumn) return;

//     setColumns((prevColumns) =>
//       prevColumns.filter((col) => col.id !== editingColumn.id)
//     );

//     setDeleteBoardModalVisible(false);
//     setEditingColumn(null);
//   };

//   const handleEditTask = (task: Task, columnId: string) => {
//     setEditingTask({ task, columnId });
//     setTaskTitle(task.title);
//     setTaskProject(task.project);
//     setTaskDueDate(task.dueDate);
//     setTaskPriority(task.priority);
//     setTaskAssignedTo(task.assignedTo || "");
//     setTaskMessage(task.message || "");
//     setEditTaskModalVisible(true);
//   };

//   const handleSaveTaskEdit = () => {
//     if (!editingTask || !taskTitle.trim()) return;

//     setColumns((prevColumns) =>
//       prevColumns.map((col) =>
//         col.id === editingTask.columnId
//           ? {
//               ...col,
//               tasks: col.tasks.map((t) =>
//                 t.id === editingTask.task.id
//                   ? {
//                       ...t,
//                       title: taskTitle.trim(),
//                       project: taskProject.trim(),
//                       dueDate: taskDueDate.trim(),
//                       priority: taskPriority,
//                       assignedTo: taskAssignedTo || undefined,
//                       message: taskMessage.trim() || undefined,
//                     }
//                   : t
//               ),
//             }
//           : col
//       )
//     );

//     setEditTaskModalVisible(false);
//     setEditingTask(null);
//     resetTaskForm();
//   };

//   const handleMoveTask = (task: Task, fromColumnId: string) => {
//     setTaskToMove({ task, fromColumnId });
//     setMoveTaskModalVisible(true);
//   };

//   const confirmMoveTask = (toColumnId: string) => {
//     if (!taskToMove) return;
//     moveTask(taskToMove.task.id, taskToMove.fromColumnId, toColumnId);
//     setMoveTaskModalVisible(false);
//     setTaskToMove(null);
//   };

//   const handleAddTask = (columnId: string) => {
//     setSelectedColumnForTask(columnId);
//     resetTaskForm();
//     setAddTaskModalVisible(true);
//   };

//   const handleSaveNewTask = () => {
//     if (!selectedColumnForTask || !taskTitle.trim()) return;

//     const newTask: Task = {
//       id: Date.now().toString(),
//       title: taskTitle.trim(),
//       project: taskProject.trim() || "General",
//       dueDate: taskDueDate.trim() || "No date",
//       priority: taskPriority,
//       assignedTo: taskAssignedTo || undefined,
//       message: taskMessage.trim() || undefined,
//     };

//     setColumns((prevColumns) =>
//       updateColumnCounts(
//         prevColumns.map((col) =>
//           col.id === selectedColumnForTask
//             ? { ...col, tasks: [...col.tasks, newTask] }
//             : col
//         )
//       )
//     );

//     setAddTaskModalVisible(false);
//     setSelectedColumnForTask(null);
//     resetTaskForm();
//   };

//   const handleDeleteTask = (taskId: string, columnId: string) => {
//     Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: () => {
//           setColumns((prevColumns) =>
//             updateColumnCounts(
//               prevColumns.map((col) =>
//                 col.id === columnId
//                   ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
//                   : col
//               )
//             )
//           );
//         },
//       },
//     ]);
//   };

//   const resetTaskForm = () => {
//     setTaskTitle("");
//     setTaskProject("");
//     setTaskDueDate("");
//     setTaskPriority("medium");
//     setTaskAssignedTo("");
//     setTaskMessage("");
//   };

//   const renderTaskCard = (task: Task, columnId: string) => {
//     const dotColor = getPriorityDotColor(task.priority);
//     const priorityText = getPriorityText(task.priority);
//     const assignedColor = getAssignedMemberColor(task);
//     const assignedInitials = getAssignedMemberInitials(task);
//     const assignedName = getAssignedMemberName(task);

//     return (
//       <TouchableOpacity
//         key={task.id}
//         onPress={() => handleViewTask(task, columnId)}
//         onLongPress={() => handleMoveTask(task, columnId)}
//         activeOpacity={0.7}
//         className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
//       >
//         <View className="flex-row items-center justify-between mb-3">
//           <View className="flex-row items-center flex-1">
//             <View
//               className="w-2 h-2 rounded-full mr-2"
//               style={{ backgroundColor: dotColor }}
//             />
//             <Text className="text-sm font-regular text-gray-700">
//               {priorityText}
//             </Text>
//           </View>
//           <View className="flex-row items-center">
//             <TouchableOpacity
//               onPress={(e) => {
//                 e.stopPropagation();
//                 handleAssignMember(task, columnId);
//               }}
//               className="p-2 mr-1"
//             >
//               <Ionicons name="person-outline" size={16} color="#6B7280" />
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={(e) => {
//                 e.stopPropagation();
//                 handleEditTask(task, columnId);
//               }}
//               className="p-2 mr-1"
//             >
//               <Ionicons name="create-outline" size={16} color="#6B7280" />
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={(e) => {
//                 e.stopPropagation();
//                 handleDeleteTask(task.id, columnId);
//               }}
//               className="p-2"
//             >
//               <Ionicons name="trash-outline" size={16} color="#EF4444" />
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View className="flex-1">
//           <Text
//             numberOfLines={2}
//             ellipsizeMode="tail"
//             className="text-lg font-semiBold text-gray-900 mb-2"
//           >
//             {task.title}
//           </Text>
//           {task.message && (
//             <Text
//               numberOfLines={2}
//               ellipsizeMode="tail"
//               className="text-sm font-regular text-gray-600 mb-3"
//             >
//               {task.message}
//             </Text>
//           )}
//         </View>
//         <View className="space-y-2">
//           <View className="flex-row items-center justify-between">
//             <Text className="text-sm font-regular text-blue-600">
//               Due: {task.dueDate}
//             </Text>
//             <View className="flex-row items-center">
//               <View
//                 className="w-6 h-6 rounded-full items-center justify-center mr-2"
//                 style={{ backgroundColor: assignedColor }}
//               >
//                 <Text className="text-white text-xs font-semiBold">
//                   {assignedInitials}
//                 </Text>
//               </View>
//               <Text className="text-xs font-regular text-gray-600">
//                 {assignedName}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderColumn = (column: Column) => {
//     return (
//       <View key={column.id} style={{ width: COLUMN_WIDTH }} className="mr-4">
//         <View className="mb-4 p-3 rounded-lg">
//           <View className="flex-row items-center justify-between mb-1">
//             <View className="flex-1">
//               <Text className="text-lg font-textBold text-gray-900">
//                 {column.title}
//               </Text>
//               <Text className="text-sm font-regular text-gray-600">
//                 {column.count} tasks
//               </Text>
//             </View>
//             <View className="flex-row items-center">
//               <TouchableOpacity
//                 onPress={() => handleEditBoard(column)}
//                 className="p-2 mr-1"
//               >
//                 <Ionicons name="create-outline" size={18} color="#6B7280" />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => handleDeleteBoard(column)}
//                 className="p-2"
//               >
//                 <Ionicons name="trash-outline" size={18} color="#EF4444" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           className="flex-1"
//           contentContainerStyle={{ paddingBottom: 20 }}
//           nestedScrollEnabled={true}
//         >
//           {column.tasks.map((task) => renderTaskCard(task, column.id))}
//           {column.tasks.length === 0 && (
//             <View className="bg-gray-50 rounded-xl p-8 items-center justify-center min-h-32 border-2 border-dashed border-gray-300">
//               <Ionicons name="document-outline" size={32} color="#9CA3AF" />
//               <Text className="text-gray-500 font-textBold mt-2 text-center">
//                 No tasks yet
//               </Text>
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   return (
//     <Layout>
//       <View className="flex-1">
//         <View className="py-4 border-b border-gray-200">
//           <View className="flex-row items-center">
//             <BackBtn title="WP Ecommerce Site" />
//           </View>
//         </View>

//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           className="flex-1"
//           contentContainerStyle={{
//             paddingVertical: 20,
//           }}
//           bounces={true}
//           scrollEnabled={true}
//         >
//           {columns.map((column) => renderColumn(column))}
//         </ScrollView>

//         <TouchableOpacity
//           className="absolute bottom-6 right-6 w-16 h-16 bg-blue-500 rounded-full items-center justify-center shadow-lg"
//           onPress={() => {
//             if (columns.length > 0) {
//               handleAddTask(columns[0].id);
//             }
//           }}
//           style={{
//             shadowColor: "#3B82F6",
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: 0.3,
//             shadowRadius: 8,
//             elevation: 8,
//           }}
//         >
//           <Ionicons name="add" size={28} color="white" />
//         </TouchableOpacity>
//       </View>

//       {/* View Task Details Modal */}
//       <Modal
//         visible={viewTaskModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setViewTaskModalVisible(false);
//           setViewingTask(null);
//         }}
//       >
//         <View className="flex-1 justify-center items-center bg-black/60">
//           <View className="w-full max-w-md bg-gray-800 rounded-2xl p-6 mx-4">
//             <View className="flex-row justify-between items-center mb-6">
//               <Text className="text-2xl font-semiBold text-white">
//                 Task Details
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   setViewTaskModalVisible(false);
//                   setViewingTask(null);
//                 }}
//                 className="w-8 h-8 justify-center items-center rounded-full bg-gray-700"
//               >
//                 <Ionicons name="close" size={20} color="white" />
//               </TouchableOpacity>
//             </View>

//             {viewingTask && (
//               <View className="space-y-4">
//                 <View>
//                   <Text className="text-sm font-semiBold text-gray-300 mb-1">
//                     Title
//                   </Text>
//                   <Text className="text-lg font-semiBold text-white">
//                     {viewingTask.task.title}
//                   </Text>
//                 </View>

//                 <View className="flex-row justify-between">
//                   <View>
//                     <Text className="text-sm font-semiBold text-gray-300 mb-1">
//                       Project
//                     </Text>
//                     <Text className="text-white">
//                       {viewingTask.task.project}
//                     </Text>
//                   </View>
//                   <View>
//                     <Text className="text-sm font-semiBold text-gray-300 mb-1">
//                       Due Date
//                     </Text>
//                     <Text className="text-white">
//                       {viewingTask.task.dueDate}
//                     </Text>
//                   </View>
//                 </View>

//                 <View className="flex-row justify-between">
//                   <View>
//                     <Text className="text-sm font-semiBold text-gray-300 mb-1">
//                       Priority
//                     </Text>
//                     <View className="flex-row items-center">
//                       <View
//                         className="w-2 h-2 rounded-full mr-2"
//                         style={{
//                           backgroundColor: getPriorityDotColor(
//                             viewingTask.task.priority
//                           ),
//                         }}
//                       />
//                       <Text className="text-white capitalize">
//                         {viewingTask.task.priority}
//                       </Text>
//                     </View>
//                   </View>
//                   <View>
//                     <Text className="text-sm font-semiBold text-gray-300 mb-1">
//                       Assigned To
//                     </Text>
//                     <View className="flex-row items-center">
//                       <View
//                         className="w-6 h-6 rounded-full items-center justify-center mr-2"
//                         style={{
//                           backgroundColor: getAssignedMemberColor(
//                             viewingTask.task
//                           ),
//                         }}
//                       >
//                         <Text className="text-white text-xs font-semiBold">
//                           {getAssignedMemberInitials(viewingTask.task)}
//                         </Text>
//                       </View>
//                       <Text className="text-white">
//                         {getAssignedMemberName(viewingTask.task)}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>

//                 {viewingTask.task.message && (
//                   <View>
//                     <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                       Message
//                     </Text>
//                     <View className="bg-gray-700 rounded-lg p-4">
//                       <Text className="text-white font-regular leading-5">
//                         {viewingTask.task.message}
//                       </Text>
//                     </View>
//                   </View>
//                 )}

//                 <View className="flex-row gap-3 pt-4">
//                   <TouchableOpacity
//                     className="flex-1 bg-gray-700 py-3 rounded-lg items-center"
//                     onPress={() => {
//                       setViewTaskModalVisible(false);
//                       setViewingTask(null);
//                     }}
//                   >
//                     <Text className="text-white font-semiBold">Close</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
//                     onPress={() => {
//                       if (viewingTask) {
//                         handleEditTask(viewingTask.task, viewingTask.columnId);
//                         setViewTaskModalVisible(false);
//                         setViewingTask(null);
//                       }
//                     }}
//                   >
//                     <Text className="text-white font-semiBold">Edit Task</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Edit Board Modal */}
//       <Modal
//         visible={editBoardModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setEditBoardModalVisible(false);
//           setEditingColumn(null);
//           setNewColumnName("");
//         }}
//       >
//         <View className="flex-1 justify-center items-center bg-black/60">
//           <View className="w-full max-w-md bg-gray-800 rounded-2xl p-6 mx-4">
//             <View className="flex-row justify-between items-center mb-6">
//               <Text className="text-2xl font-bold text-white">Edit Board</Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   setEditBoardModalVisible(false);
//                   setEditingColumn(null);
//                   setNewColumnName("");
//                 }}
//                 className="w-8 h-8 justify-center items-center rounded-full bg-gray-700"
//               >
//                 <Ionicons name="close" size={20} color="white" />
//               </TouchableOpacity>
//             </View>
//             <View className="mb-6">
//               <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                 Board Name
//               </Text>
//               <TextInput
//                 className="border border-gray-600 rounded-lg p-4 text-white bg-gray-700"
//                 placeholder="Enter board name..."
//                 placeholderTextColor="#9CA3AF"
//                 value={newColumnName}
//                 onChangeText={setNewColumnName}
//                 autoFocus={true}
//               />
//             </View>
//             <View className="flex-row gap-3">
//               <TouchableOpacity
//                 className="flex-1 bg-gray-700 py-4 rounded-lg items-center"
//                 onPress={() => {
//                   setEditBoardModalVisible(false);
//                   setEditingColumn(null);
//                   setNewColumnName("");
//                 }}
//               >
//                 <Text className="text-white font-semiBold">Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="flex-1 bg-blue-500 py-4 rounded-lg items-center"
//                 onPress={handleSaveBoardEdit}
//                 disabled={!newColumnName.trim()}
//               >
//                 <Text className="text-white font-semiBold">Save</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Delete Board Modal */}
//       <Modal
//         visible={deleteBoardModalVisible}
//         animationType="fade"
//         transparent={true}
//         onRequestClose={() => {
//           setDeleteBoardModalVisible(false);
//           setEditingColumn(null);
//         }}
//       >
//         <View className="flex-1 justify-center items-center bg-black/60">
//           <View className="w-full max-w-md bg-gray-800 rounded-2xl p-6 mx-4">
//             <View className="mb-6">
//               <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-4 self-center">
//                 <Ionicons name="trash" size={32} color="#EF4444" />
//               </View>
//               <Text className="text-2xl font-bold text-white text-center mb-2">
//                 Delete Board?
//               </Text>
//               <Text className="text-gray-400 text-center">
//                 Are you sure you want to delete "{editingColumn?.title}"? This
//                 action cannot be undone.
//               </Text>
//             </View>
//             <View className="flex-row gap-3">
//               <TouchableOpacity
//                 className="flex-1 bg-gray-700 py-4 rounded-lg items-center"
//                 onPress={() => {
//                   setDeleteBoardModalVisible(false);
//                   setEditingColumn(null);
//                 }}
//               >
//                 <Text className="text-white font-semiBold">Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="flex-1 bg-red-500 py-4 rounded-lg items-center"
//                 onPress={confirmDeleteBoard}
//               >
//                 <Text className="text-white font-semiBold">Delete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Edit Task Modal */}
//       <Modal
//         visible={editTaskModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setEditTaskModalVisible(false);
//           setEditingTask(null);
//           resetTaskForm();
//         }}
//       >
//         <View className="flex-1 justify-center items-center bg-black/60">
//           <View className="w-full max-w-md bg-gray-800 rounded-2xl p-6 mx-4 max-h-[90%]">
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View className="flex-row justify-between items-center mb-6">
//                 <Text className="text-2xl font-semiBold text-white">
//                   Edit Task
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setEditTaskModalVisible(false);
//                     setEditingTask(null);
//                     resetTaskForm();
//                   }}
//                   className="w-8 h-8 justify-center items-center rounded-full bg-gray-700"
//                 >
//                   <Ionicons name="close" size={20} color="white" />
//                 </TouchableOpacity>
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Task Title *
//                 </Text>
//                 <TextInput
//                   className="border border-gray-600 font-regular rounded-lg p-4 text-white bg-gray-700"
//                   placeholder="Enter task title..."
//                   placeholderTextColor="#9CA3AF"
//                   value={taskTitle}
//                   onChangeText={setTaskTitle}
//                 />
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Due Date
//                 </Text>
//                 <TextInput
//                   className="border border-gray-600 font-regular rounded-lg p-4 text-white bg-gray-700"
//                   placeholder="e.g., Oct 26"
//                   placeholderTextColor="#9CA3AF"
//                   value={taskDueDate}
//                   onChangeText={setTaskDueDate}
//                 />
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Message to Assignee
//                 </Text>
//                 <TextInput
//                   className="border border-gray-600 font-regular rounded-lg p-4 text-white bg-gray-700 min-h-[100px]"
//                   placeholder="Add instructions, context, or details for the person assigned to this task..."
//                   placeholderTextColor="#9CA3AF"
//                   value={taskMessage}
//                   onChangeText={setTaskMessage}
//                   multiline
//                   textAlignVertical="top"
//                   numberOfLines={4}
//                 />
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Assign To
//                 </Text>
//                 <View className="flex-row flex-wrap gap-2">
//                   <TouchableOpacity
//                     className={`px-4 py-2 rounded-lg ${
//                       taskAssignedTo === "" ? "bg-blue-500" : "bg-gray-700"
//                     }`}
//                     onPress={() => setTaskAssignedTo("")}
//                   >
//                     <Text className="text-white font-semiBold">Unassigned</Text>
//                   </TouchableOpacity>
//                   {teamMembers.map((member) => (
//                     <TouchableOpacity
//                       key={member.id}
//                       className={`px-4 py-2 rounded-lg ${
//                         taskAssignedTo === member.id
//                           ? "bg-blue-500"
//                           : "bg-gray-700"
//                       }`}
//                       onPress={() => setTaskAssignedTo(member.id)}
//                     >
//                       <Text className="text-white font-semiBold">
//                         {member.name}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>

//               <View className="mb-6">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Priority
//                 </Text>
//                 <View className="flex-row gap-2">
//                   {(["low", "medium", "high"] as Priority[]).map((priority) => (
//                     <TouchableOpacity
//                       key={priority}
//                       className={`flex-1 py-3 rounded-lg items-center ${
//                         taskPriority === priority
//                           ? priority === "high"
//                             ? "bg-red-500"
//                             : priority === "medium"
//                             ? "bg-amber-500"
//                             : "bg-green-500"
//                           : "bg-gray-700"
//                       }`}
//                       onPress={() => setTaskPriority(priority)}
//                     >
//                       <Text className="text-white font-semiBold capitalize">
//                         {priority}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>

//               <View className="flex-row gap-3">
//                 <TouchableOpacity
//                   className="flex-1 bg-gray-700 py-4 rounded-lg items-center"
//                   onPress={() => {
//                     setEditTaskModalVisible(false);
//                     setEditingTask(null);
//                     resetTaskForm();
//                   }}
//                 >
//                   <Text className="text-white font-semiBold">Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   className="flex-1 bg-blue-500 py-4 rounded-lg items-center"
//                   onPress={handleSaveTaskEdit}
//                   disabled={!taskTitle.trim()}
//                 >
//                   <Text className="text-white font-semiBold">Save</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* Move Task Modal */}
//       <Modal
//         visible={moveTaskModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setMoveTaskModalVisible(false);
//           setTaskToMove(null);
//         }}
//       >
//         <View className="flex-1 justify-center items-center bg-black/60">
//           <View className="w-full max-w-md bg-gray-800 rounded-2xl p-6 mx-4">
//             <View className="flex-row justify-between items-center mb-6">
//               <Text className="text-2xl font-textBold text-white">
//                 Move Task
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   setMoveTaskModalVisible(false);
//                   setTaskToMove(null);
//                 }}
//                 className="w-8 h-8 justify-center items-center rounded-full bg-gray-700"
//               >
//                 <Ionicons name="close" size={20} color="white" />
//               </TouchableOpacity>
//             </View>

//             {taskToMove && (
//               <>
//                 <Text
//                   numberOfLines={1}
//                   ellipsizeMode="tail"
//                   className="text-lg font-semiBold text-white mb-2"
//                 >
//                   {taskToMove.task.title}
//                 </Text>
//                 <Text className="text-gray-400 font-regular mb-6">
//                   Move this task to:
//                 </Text>

//                 <View className="space-y-3">
//                   {columns
//                     .filter((col) => col.id !== taskToMove.fromColumnId)
//                     .map((column) => (
//                       <Pressable
//                         key={column.id}
//                         onPress={() => confirmMoveTask(column.id)}
//                         className="bg-blue-500/20 mb-3 border-2 border-blue-500 rounded-lg p-4"
//                       >
//                         <Text className="text-blue-400 font-semiBold text-center">
//                           {column.title}
//                         </Text>
//                       </Pressable>
//                     ))}
//                 </View>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Assign Member Modal */}
//       <Modal
//         visible={assignMemberModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setAssignMemberModalVisible(false);
//           setTaskToAssign(null);
//           setTaskAssignedTo("");
//         }}
//       >
//         <View className="flex-1 justify-center items-center bg-black/60">
//           <View className="w-full max-w-md bg-gray-800 rounded-2xl p-6 mx-4">
//             <View className="flex-row justify-between items-center mb-6">
//               <Text className="text-2xl font-semiBold text-white">
//                 Assign Task
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   setAssignMemberModalVisible(false);
//                   setTaskToAssign(null);
//                   setTaskAssignedTo("");
//                 }}
//                 className="w-8 h-8 justify-center items-center rounded-full bg-gray-700"
//               >
//                 <Ionicons name="close" size={20} color="white" />
//               </TouchableOpacity>
//             </View>

//             {taskToAssign && (
//               <>
//                 <Text
//                   numberOfLines={2}
//                   ellipsizeMode="tail"
//                   className="text-lg font-semiBold text-white mb-6 text-center"
//                 >
//                   {taskToAssign.task.title}
//                 </Text>

//                 <Text className="text-gray-400 font-regular mb-4">
//                   Assign to:
//                 </Text>

//                 <View className="space-y-3 mb-6">
//                   <TouchableOpacity
//                     onPress={removeAssignment}
//                     className="bg-gray-700 rounded-lg p-4 flex-row items-center"
//                   >
//                     <View className="w-8 h-8 rounded-full bg-gray-600 items-center justify-center mr-3">
//                       <Text className="text-white text-sm font-semiBold">
//                         ?
//                       </Text>
//                     </View>
//                     <Text className="text-white font-semiBold">Unassigned</Text>
//                   </TouchableOpacity>

//                   {teamMembers.map((member) => (
//                     <TouchableOpacity
//                       key={member.id}
//                       onPress={() => confirmAssignMember(member.id)}
//                       className="bg-gray-700 rounded-lg p-4 flex-row items-center"
//                     >
//                       <View
//                         className="w-8 h-8 rounded-full items-center justify-center mr-3"
//                         style={{
//                           backgroundColor: getAssignedMemberColor({
//                             assignedTo: member.id,
//                           } as Task),
//                         }}
//                       >
//                         <Text className="text-white text-sm font-semiBold">
//                           {member.name
//                             .split(" ")
//                             .map((w) => w[0])
//                             .join("")
//                             .toUpperCase()
//                             .slice(0, 2)}
//                         </Text>
//                       </View>
//                       <View className="flex-1">
//                         <Text className="text-white font-semiBold">
//                           {member.name}
//                         </Text>
//                         <Text className="text-gray-400 text-xs">
//                           {member.role}
//                         </Text>
//                       </View>
//                       {taskToAssign.task.assignedTo === member.id && (
//                         <Ionicons name="checkmark" size={20} color="#10B981" />
//                       )}
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Add Task Modal */}
//       <Modal
//         visible={addTaskModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setAddTaskModalVisible(false);
//           setSelectedColumnForTask(null);
//           resetTaskForm();
//         }}
//       >
//         <View className="flex-1 justify-center items-center bg-black/60">
//           <View className="w-full max-w-md bg-gray-800 rounded-2xl p-6 mx-4 max-h-[90%]">
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View className="flex-row justify-between items-center mb-6">
//                 <Text className="text-2xl font-semiBold text-white">
//                   Add Task
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setAddTaskModalVisible(false);
//                     setSelectedColumnForTask(null);
//                     resetTaskForm();
//                   }}
//                   className="w-8 h-8 justify-center items-center rounded-full bg-gray-700"
//                 >
//                   <Ionicons name="close" size={20} color="white" />
//                 </TouchableOpacity>
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Task Title *
//                 </Text>
//                 <TextInput
//                   className="border border-gray-600 font-regular rounded-lg p-4 text-white bg-gray-700"
//                   placeholder="Enter task title..."
//                   placeholderTextColor="#9CA3AF"
//                   value={taskTitle}
//                   onChangeText={setTaskTitle}
//                   autoFocus={true}
//                 />
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Due Date
//                 </Text>
//                 <TextInput
//                   className="border border-gray-600 font-regular rounded-lg p-4 text-white bg-gray-700"
//                   placeholder="e.g., Oct 26"
//                   placeholderTextColor="#9CA3AF"
//                   value={taskDueDate}
//                   onChangeText={setTaskDueDate}
//                 />
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Message to Assignee
//                 </Text>
//                 <TextInput
//                   className="border border-gray-600 font-regular rounded-lg p-4 text-white bg-gray-700 min-h-[100px]"
//                   placeholder="Add instructions, context, or details for the person assigned to this task..."
//                   placeholderTextColor="#9CA3AF"
//                   value={taskMessage}
//                   onChangeText={setTaskMessage}
//                   multiline
//                   textAlignVertical="top"
//                   numberOfLines={4}
//                 />
//               </View>

//               <View className="mb-4">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Assign To
//                 </Text>
//                 <View className="flex-row flex-wrap gap-2">
//                   <TouchableOpacity
//                     className={`px-4 py-2 rounded-lg ${
//                       taskAssignedTo === "" ? "bg-blue-500" : "bg-gray-700"
//                     }`}
//                     onPress={() => setTaskAssignedTo("")}
//                   >
//                     <Text className="text-white font-semiBold">Unassigned</Text>
//                   </TouchableOpacity>
//                   {teamMembers.map((member) => (
//                     <TouchableOpacity
//                       key={member.id}
//                       className={`px-4 py-2 rounded-lg ${
//                         taskAssignedTo === member.id
//                           ? "bg-blue-500"
//                           : "bg-gray-700"
//                       }`}
//                       onPress={() => setTaskAssignedTo(member.id)}
//                     >
//                       <Text className="text-white font-semiBold">
//                         {member.name}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>

//               <View className="mb-6">
//                 <Text className="text-sm font-semiBold text-gray-300 mb-2">
//                   Priority
//                 </Text>
//                 <View className="flex-row gap-2">
//                   {(["low", "medium", "high"] as Priority[]).map((priority) => (
//                     <TouchableOpacity
//                       key={priority}
//                       className={`flex-1 py-3 rounded-lg items-center ${
//                         taskPriority === priority
//                           ? priority === "high"
//                             ? "bg-red-500"
//                             : priority === "medium"
//                             ? "bg-amber-500"
//                             : "bg-green-500"
//                           : "bg-gray-700"
//                       }`}
//                       onPress={() => setTaskPriority(priority)}
//                     >
//                       <Text className="text-white font-semiBold capitalize">
//                         {priority}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>

//               <View className="flex-row gap-3">
//                 <TouchableOpacity
//                   className="flex-1 bg-gray-700 py-4 rounded-lg items-center"
//                   onPress={() => {
//                     setAddTaskModalVisible(false);
//                     setSelectedColumnForTask(null);
//                     resetTaskForm();
//                   }}
//                 >
//                   <Text className="text-white font-semiBold">Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   className="flex-1 bg-blue-500 py-4 rounded-lg items-center"
//                   onPress={handleSaveNewTask}
//                   disabled={!taskTitle.trim()}
//                 >
//                   <Text className="text-white font-semiBold">Add Task</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </Layout>
//   );
// };

// export default Board;
