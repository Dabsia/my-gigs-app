// import BackBtn from "@/components/BackBtn/BackBtn";
// import Calendar from "@/components/Calender/Calender";
// import Layout from "@/components/Layout/Layout";
// import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
// import { formatDate } from "@/helpers/formatDate";
// import React, { useState } from "react";
// import {
//   Alert,
//   Linking,
//   Pressable,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { TimePickerModal } from "react-native-paper-dates";

// export default function MeetingScheduler() {
//   // Your email - replace with your actual email
//   const myEmail = "dabojohnson98@gmail.com"; // Fixed: added @gmail.com
//   const myName = "Daboikiabo Johnson";

//   const [selectedClient, setSelectedClient] = useState("Michael Jones");
//   const [clientEmail, setClientEmail] = useState("sasoh50538@wfsocks.com");
//   const [date, setDate] = useState(new Date());
//   const [time, setTime] = useState({ hours: 9, minutes: 30 });
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [duration, setDuration] = useState("30m");
//   const [topic, setTopic] = useState("");
//   const [agenda, setAgenda] = useState("");
//   const [additionalParticipants, setAdditionalParticipants] = useState("");
//   const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
//   // const [showTeamMembers, setShowTeamMembers] = useState(false);
//   const [selectAllTeamMembers, setSelectAllTeamMembers] = useState(false);

//   // const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);

//   // Team members array including yourself
//   const [teamMembers, setTeamMembers] = useState([
//     {
//       id: 1,
//       name: myName,
//       email: myEmail,
//       selected: true,
//       isOrganizer: true,
//     },
//     {
//       id: 2,
//       name: "Sarah Wilson",
//       email: "sarah.wilson@company.com",
//       selected: false,
//       isOrganizer: false,
//     },
//     {
//       id: 3,
//       name: "Mike Chen",
//       email: "depex90214@rantoro.com",
//       selected: false,
//       isOrganizer: false,
//     },
//     {
//       id: 4,
//       name: "Emily Rodriguez",
//       email: "emily.rodriguez@company.com",
//       selected: false,
//       isOrganizer: false,
//     },
//     {
//       id: 5,
//       name: "Alex Thompson",
//       email: "alex.thompson@company.com",
//       selected: false,
//       isOrganizer: false,
//     },
//     {
//       id: 6,
//       name: "Jessica Lee",
//       email: "jessica.lee@company.com",
//       selected: false,
//       isOrganizer: false,
//     },
//     {
//       id: 7,
//       name: "David Kim",
//       email: "david.kim@company.com",
//       selected: false,
//       isOrganizer: false,
//     },
//   ]);

//   const durations = ["15m", "30m", "45m", "60m"];

//   const formatTime = (time) => {
//     const hours = time.hours % 12 || 12;
//     const minutes = time.minutes.toString().padStart(2, "0");
//     const period = time.hours >= 12 ? "PM" : "AM";
//     return `${hours}:${minutes} ${period}`;
//   };

//   const getDurationInMinutes = () => {
//     return parseInt(duration.replace("m", ""));
//   };

//   const onDateConfirm = (params) => {
//     setShowDatePicker(false);
//     if (params.date) {
//       setDate(params.date);
//     }
//   };

//   const onTimeConfirm = ({ hours, minutes }) => {
//     setShowTimePicker(false);
//     setTime({ hours, minutes });
//   };

//   // Toggle individual team member selection (except organizer)
//   const toggleTeamMember = (id) => {
//     const updatedTeamMembers = teamMembers.map((member) =>
//       member.id === id && !member.isOrganizer
//         ? { ...member, selected: !member.selected }
//         : member
//     );
//     setTeamMembers(updatedTeamMembers);

//     const nonOrganizerMembers = updatedTeamMembers.filter(
//       (member) => !member.isOrganizer
//     );
//     const allSelected = nonOrganizerMembers.every((member) => member.selected);
//     setSelectAllTeamMembers(allSelected);

//     updateAdditionalParticipants(updatedTeamMembers);
//   };

//   // Toggle select all team members (excluding organizer)
//   const toggleSelectAll = () => {
//     const newSelectAllState = !selectAllTeamMembers;
//     setSelectAllTeamMembers(newSelectAllState);

//     const updatedTeamMembers = teamMembers.map((member) => ({
//       ...member,
//       selected: member.isOrganizer ? true : newSelectAllState,
//     }));
//     setTeamMembers(updatedTeamMembers);

//     updateAdditionalParticipants(updatedTeamMembers);
//   };

//   // Update additional participants text based on selected team members
//   const updateAdditionalParticipants = (members) => {
//     const selectedEmails = members
//       .filter((member) => member.selected && !member.isOrganizer)
//       .map((member) => member.email);

//     setAdditionalParticipants(selectedEmails.join(", "));
//   };

//   // Handle manual input in additional participants
//   const handleAdditionalParticipantsChange = (text) => {
//     setAdditionalParticipants(text);

//     const updatedTeamMembers = teamMembers.map((member) => ({
//       ...member,
//       selected: member.isOrganizer ? true : false,
//     }));
//     setTeamMembers(updatedTeamMembers);
//     setSelectAllTeamMembers(false);
//   };

//   const createGoogleCalendarEvent = () => {
//     // Combine selected date and time
//     const meetingDateTime = new Date(date);
//     meetingDateTime.setHours(time.hours, time.minutes, 0, 0);

//     // Create end date/time based on duration
//     const endDateTime = new Date(meetingDateTime);
//     endDateTime.setMinutes(
//       meetingDateTime.getMinutes() + getDurationInMinutes()
//     );

//     // Format for Google Calendar (RFC3339)
//     const formatForGoogle = (date) => {
//       return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
//     };

//     const startTime = formatForGoogle(meetingDateTime);
//     const endTime = formatForGoogle(endDateTime);

//     // Get all participant emails
//     const allParticipants = [clientEmail, myEmail];

//     // Add selected team members
//     const selectedTeamEmails = teamMembers
//       .filter((member) => member.selected && !member.isOrganizer)
//       .map((member) => member.email);

//     allParticipants.push(...selectedTeamEmails);

//     // Add manually entered additional participants
//     if (additionalParticipants) {
//       const additionalEmails = additionalParticipants
//         .split(",")
//         .map((email) => email.trim())
//         .filter((email) => email.length > 0 && email.includes("@"));
//       allParticipants.push(...additionalEmails);
//     }

//     // Remove duplicates
//     const uniqueParticipants = [...new Set(allParticipants)];

//     // Create detailed description
//     const description = `Meeting with ${selectedClient}
// ${agenda ? `\nAgenda: ${agenda}` : ""}

// Client: ${selectedClient}
// Organizer: ${myName}
// Scheduled via Meeting Scheduler App

// Please make sure to add a Google Meet conference when saving this event.`;

//     // Create Google Calendar URL with better parameters
//     const baseUrl = "https://calendar.google.com/calendar/render";

//     const params = new URLSearchParams({
//       action: "TEMPLATE",
//       text: topic || `Meeting with ${selectedClient}`,
//       details: description,
//       dates: `${startTime}/${endTime}`,
//       add: uniqueParticipants.join(","), // Add all participants at once
//       src: myEmail, // Set yourself as the source/organizer
//       trp: "true",
//       location: "Google Meet", // Suggest Google Meet
//       sf: "true",
//       output: "xml",
//     });

//     const calendarUrl = `${baseUrl}?${params.toString()}`;

//     return {
//       calendarUrl,
//       participants: uniqueParticipants,
//       meetingDateTime,
//       endDateTime,
//     };
//   };

//   const handleScheduleMeeting = async () => {
//     if (!selectedClient) {
//       Alert.alert("Error", "Please select a client");
//       return;
//     }
//     if (!topic) {
//       Alert.alert("Error", "Please enter a meeting topic");
//       return;
//     }

//     setIsCreatingMeeting(true);

//     try {
//       const { calendarUrl, participants, meetingDateTime, endDateTime } =
//         createGoogleCalendarEvent();

//       const canOpen = await Linking.canOpenURL(calendarUrl);

//       if (canOpen) {
//         Alert.alert(
//           "Schedule Meeting",
//           `Meeting Details:\n\n📅 ${formatDate(
//             meetingDateTime
//           )}\n⏰ ${formatTime(
//             time
//           )}\n⏳ ${duration}\n\nParticipants:\n• ${clientEmail} (Client)\n• ${myEmail} (You)${
//             participants.length > 2
//               ? `\n• ${participants.length - 2} other participant(s)`
//               : ""
//           }\n\nNext: Google Calendar will open. Please:\n1. Add Google Meet conference\n2. Review details\n3. Click "Save"`,
//           [
//             {
//               text: "Cancel",
//               style: "cancel",
//               onPress: () => setIsCreatingMeeting(false),
//             },
//             {
//               text: "Open Calendar",
//               onPress: async () => {
//                 try {
//                   await Linking.openURL(calendarUrl);

//                   // Show follow-up instructions
//                   setTimeout(() => {
//                     Alert.alert(
//                       "✅ Calendar Opened",
//                       `Please complete these steps in Google Calendar:\n\n1. Click "Add Google Meet video conferencing"\n2. Review all meeting details\n3. Click "SAVE" to send invitations\n4. Choose "Send" to notify participants\n\nMeeting will be sent to:\n${participants.join(
//                         "\n"
//                       )}`,
//                       [{ text: "Got it" }]
//                       // U can add a fuctioinn for meetinng created and send to the backkend so it add its and displays on meetinng dashboard
//                     );
//                   }, 2000);
//                 } catch (error) {
//                   Alert.alert("Error", "Could not open Google Calendar");
//                 }
//                 setIsCreatingMeeting(false);
//               },
//             },
//           ]
//         );
//       } else {
//         Alert.alert("Error", "Cannot open Google Calendar on this device");
//         setIsCreatingMeeting(false);
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to create meeting. Please try again.");
//       console.error("Meeting creation error:", error);
//       setIsCreatingMeeting(false);
//     }
//   };

//   return (
//     <Layout>
//       <View className="bg-[#F6F6F1] flex-1 h-full">
//         <ScrollView
//           contentContainerClassName="pb-9 pt-4"
//           showsVerticalScrollIndicator={false}
//         >
//           <BackBtn title="WP Ecommerce Site" />

//           {/* Client Selection */}
//           <View className="mb-6 mt-3">
//             <Text className="text-base font-semiBold text-gray-900 mb-2">
//               Client *
//             </Text>
//             <View className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between">
//               <View className="flex-1">
//                 <Text className="text-base font-regular text-gray-900">
//                   {selectedClient}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Date & Time Selection */}
//           <View className="mb-6">
//             <Text className="text-base font-semiBold text-gray-900 mb-2">
//               Date & Time *
//             </Text>
//             <View className="flex-row gap-3 mb-3">
//               <TouchableOpacity
//                 className="flex-1 px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between"
//                 onPress={() => setShowDatePicker(true)}
//               >
//                 <Text className="text-base font-regular text-gray-900">
//                   {formatDate(date)}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 className="flex-1 px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between"
//                 onPress={() => setShowTimePicker(true)}
//               >
//                 <Text className="text-base font-regular text-gray-900">
//                   {formatTime(time)}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Duration Selection */}
//           <View className="mb-6">
//             <Text className="text-base font-semiBold text-gray-900 mb-2">
//               Duration *
//             </Text>
//             <View className="flex-row justify-between gap-2">
//               {durations.map((dur) => (
//                 <Pressable
//                   key={dur}
//                   className={`px-4 py-3 w-[23%] flex justify-center items-center rounded-lg border ${
//                     duration === dur
//                       ? "bg-secondary border-secondary"
//                       : "bg-white border-gray-300"
//                   }`}
//                   onPress={() => setDuration(dur)}
//                 >
//                   <Text
//                     className={
//                       duration === dur
//                         ? "text-white font-semiBold "
//                         : "text-gray-700 font-regular"
//                     }
//                   >
//                     {dur}
//                   </Text>
//                 </Pressable>
//               ))}
//             </View>
//           </View>

//           {/* Meeting Topic */}
//           <View className="mb-6">
//             <Text className="text-base font-semiBold text-gray-900 mb-2">
//               Meeting Topic *
//             </Text>
//             <TextInput
//               className="w-full px-4 py-4 font-regular border border-gray-300 rounded-xl bg-white text-base text-gray-900"
//               placeholder="e.g. Q4 Project Kickoff"
//               placeholderTextColor="#9CA3AF"
//               value={topic}
//               onChangeText={setTopic}
//             />
//           </View>

//           {/* Agenda */}
//           <View className="mb-6">
//             <Text className="text-base font-semiBold text-gray-900 mb-2">
//               Agenda (Optional)
//             </Text>
//             <TextInput
//               className="w-full px-4 py-4 border font-regular border-gray-300 rounded-xl bg-white text-base text-gray-900 min-h-[120px]"
//               placeholder="Share meeting agenda..."
//               placeholderTextColor="#9CA3AF"
//               value={agenda}
//               onChangeText={setAgenda}
//               multiline
//               textAlignVertical="top"
//             />
//           </View>

//           {/* Team Members Dropdown */}
//           {/* <View className="mb-4">
//             <Text className="text-base font-semiBold text-gray-900 mb-2">
//               Team Members
//             </Text>

//             <Pressable
//               onPress={toggleSelectAll}
//               className="flex-row items-center mb-3"
//             >
//               <Checkbox
//                 status={selectAllTeamMembers ? "checked" : "unchecked"}
//                 onPress={toggleSelectAll}
//                 color="#3B82F6"
//               />

//               <Text className="text-base font-regular text-gray-900 ml-2">
//                 Select All Team Members
//               </Text>
//             </Pressable>

//             <TouchableOpacity
//               className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white flex-row items-center justify-between"
//               onPress={() => setShowTeamMembers(!showTeamMembers)}
//             >
//               <Text className="text-base font-regular text-gray-900">
//                 {teamMembers.filter(
//                   (member) => member.selected && !member.isOrganizer
//                 ).length > 0
//                   ? `${
//                       teamMembers.filter(
//                         (member) => member.selected && !member.isOrganizer
//                       ).length
//                     } team members selected`
//                   : "Select team members"}
//               </Text>
//               <Text className="text-lg text-gray-500">
//                 {showTeamMembers ? "▲" : "▼"}
//               </Text>
//             </TouchableOpacity>

//             {showTeamMembers && (
//               <View className="mt-2 border border-gray-300 rounded-xl bg-white max-h-64 overflow-hidden">
//                 <ScrollView
//                   alwaysBounceVertical
//                   showsVerticalScrollIndicator={true}
//                   nestedScrollEnabled={true}
//                   style={{ maxHeight: 256 }}
//                 >
//                   {teamMembers.map((member) => (
//                     <TouchableOpacity
//                       key={member.id}
//                       className={`flex-row items-center px-4 py-3 border-b border-gray-100 last:border-b-0 ${
//                         member.isOrganizer ? "bg-gray-50" : ""
//                       }`}
//                       onPress={() =>
//                         !member.isOrganizer && toggleTeamMember(member.id)
//                       }
//                       disabled={member.isOrganizer}
//                     >
//                       <Checkbox
//                         status={member.selected ? "checked" : "unchecked"}
//                         onPress={() =>
//                           !member.isOrganizer && toggleTeamMember(member.id)
//                         }
//                         color="#3B82F6"
//                         disabled={member.isOrganizer}
//                       />
//                       <View className="ml-3 flex-1">
//                         <Text
//                           className={`text-base font-regular ${
//                             member.isOrganizer
//                               ? "text-gray-900 font-semiBold"
//                               : "text-gray-900"
//                           }`}
//                         >
//                           {member.name} {member.isOrganizer && "(You)"}
//                         </Text>
//                         <Text className="text-sm font-regular text-gray-500">
//                           {member.email}
//                         </Text>
//                       </View>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//             )}
//           </View> */}

//           {/* Additional Participants */}
//           <View className="mb-6">
//             <Text className="text-base font-semiBold text-gray-900 mb-2">
//               Additional Participants (Comma Separated)
//               {additionalParticipants &&
//                 `(${
//                   additionalParticipants.split(",").filter((p) => p.trim())
//                     .length
//                 })`}
//             </Text>
//             <TextInput
//               className="w-full px-4 py-4 border font-regular border-gray-300 rounded-xl bg-white text-base text-gray-900"
//               placeholder="manager@company.com"
//               placeholderTextColor="#9CA3AF"
//               value={additionalParticipants}
//               onChangeText={handleAdditionalParticipantsChange}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               multiline
//             />
//           </View>

//           <PrimaryBtn
//             text={
//               isCreatingMeeting ? "Creating Invitation..." : `Schedule Meeting`
//             }
//             handlePress={handleScheduleMeeting}
//           />
//         </ScrollView>
//         <Calendar
//           selectedDate={date}
//           onSelectDate={setDate}
//           isDateModalOpen={showDatePicker}
//           onDateConfirm={onDateConfirm}
//           setShowDatePicker={setShowDatePicker}
//         />

//         {/* Time Picker Modal */}
//         <TimePickerModal
//           locale="en"
//           visible={showTimePicker}
//           onDismiss={() => setShowTimePicker(false)}
//           onConfirm={onTimeConfirm}
//           hours={time.hours}
//           minutes={time.minutes}
//           use24HourClock={false}
//         />
//       </View>
//     </Layout>
//   );
// }