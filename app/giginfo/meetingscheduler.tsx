import BackBtn from "@/components/BackBtn/BackBtn";
import Calendar from "@/components/Calender/Calender";
import Layout from "@/components/Layout/Layout";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { formatDate } from "@/helpers/formatDate";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TimePickerModal } from "react-native-paper-dates";

export default function MeetingScheduler() {
  const { getToken } = useAuth();

  const [clientEmail, setClientEmail] = useState("sasoh50538@wfsocks.com");
  const [clientName, setClientName] = useState("Michael Jones");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState({ hours: 9, minutes: 30 });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState("30");
  const [topic, setTopic] = useState("");
  const [agenda, setAgenda] = useState("");
  const [additionalParticipants, setAdditionalParticipants] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const durations = ["15", "30", "45", "60"];

  const formatTime = (time) => {
    const hours = time.hours % 12 || 12;
    const minutes = time.minutes.toString().padStart(2, "0");
    const period = time.hours >= 12 ? "PM" : "AM";
    return `${hours}:${minutes} ${period}`;
  };

  const onDateConfirm = (params) => {
    setShowDatePicker(false);
    if (params.date) setDate(params.date);
  };

  const onTimeConfirm = ({ hours, minutes }) => {
    setShowTimePicker(false);
    setTime({ hours, minutes });
  };

  const handleScheduleMeeting = async () => {
    // Validation
    if (!clientEmail?.includes("@")) {
      Alert.alert("Error", "Valid client email required");
      return;
    }
    if (!topic) {
      Alert.alert("Error", "Meeting topic required");
      return;
    }

    setIsCreating(true);

    try {
      const authToken = await getToken();

      const meetingDateTime = new Date(date);
      meetingDateTime.setHours(time.hours, time.minutes, 0, 0);

      const meetingData = {
        clientEmail: clientEmail.trim(),
        clientName: clientName.trim(),
        startTime: meetingDateTime.toISOString(),
        duration: parseInt(duration),
        topic: topic.trim(),
        description: agenda.trim(),
        additionalParticipants: additionalParticipants
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.includes("@")),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch(`${API_BASE_URL}/api/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(meetingData),
      });

      const result = await response.json();

      if (!response.ok) throw result;

      // Success! Meeting is saved in your DB with Google Meet link
      Alert.alert(
        "✅ Meeting Created!",
        `Meeting scheduled for ${formatDate(meetingDateTime)} at ${formatTime(
          time
        )}`,
        [
          {
            text: "Open Google Meet",
            onPress: () => {
              if (result.data?.googleMeetLink) {
                Linking.openURL(result.data.googleMeetLink);
              }
            },
          },
          {
            text: "View All Meetings",
            onPress: () => {
              // Navigate to meetings list screen
            },
          },
        ]
      );

      // Reset form
      setTopic("");
      setAgenda("");
      setAdditionalParticipants("");
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to create meeting. Make sure your backend is running and Google is connected.";
      Alert.alert("❌ Error", message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <View className="bg-[#F6F6F1] flex-1 h-full">
        <ScrollView contentContainerClassName="pb-9 pt-4">
          <BackBtn title="Schedule Meeting" />

          {/* Client Info */}
          <View className="mb-6">
            <Text className="text-base font-semiBold mb-2">Client Email *</Text>
            <TextInput
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white"
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Date & Time */}
          <View className="mb-6">
            <Text className="text-base font-semiBold mb-2">Date & Time *</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 px-4 py-4 border border-gray-300 rounded-xl bg-white"
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 px-4 py-4 border border-gray-300 rounded-xl bg-white"
                onPress={() => setShowTimePicker(true)}
              >
                <Text>{formatTime(time)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Duration */}
          <View className="mb-6">
            <Text className="text-base font-semiBold mb-2">Duration *</Text>
            <View className="flex-row justify-between gap-2">
              {durations.map((dur) => (
                <Pressable
                  key={dur}
                  className={`px-4 py-3 w-[23%] rounded-lg border ${
                    duration === dur
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white"
                  }`}
                  onPress={() => setDuration(dur)}
                >
                  <Text
                    className={`text-center ${
                      duration === dur ? "text-white" : ""
                    }`}
                  >
                    {dur}m
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Topic */}
          <View className="mb-6">
            <Text className="text-base font-semiBold mb-2">
              Meeting Topic *
            </Text>
            <TextInput
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white"
              value={topic}
              onChangeText={setTopic}
            />
          </View>

          {/* Agenda */}
          <View className="mb-6">
            <Text className="text-base font-semiBold mb-2">Agenda</Text>
            <TextInput
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white min-h-[100px]"
              value={agenda}
              onChangeText={setAgenda}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Additional Participants */}
          <View className="mb-6">
            <Text className="text-base font-semiBold mb-2">
              Additional Participants
            </Text>
            <TextInput
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white"
              placeholder="email1@example.com, email2@example.com"
              value={additionalParticipants}
              onChangeText={setAdditionalParticipants}
              multiline
            />
          </View>

          <PrimaryBtn
            text={isCreating ? "Creating..." : "Schedule Meeting"}
            handlePress={handleScheduleMeeting}
            disabled={isCreating}
          />
        </ScrollView>

        <Calendar
          selectedDate={date}
          onSelectDate={setDate}
          isDateModalOpen={showDatePicker}
          onDateConfirm={onDateConfirm}
          setShowDatePicker={setShowDatePicker}
        />

        <TimePickerModal
          visible={showTimePicker}
          onDismiss={() => setShowTimePicker(false)}
          onConfirm={onTimeConfirm}
          hours={time.hours}
          minutes={time.minutes}
        />
      </View>
    </Layout>
  );
}
