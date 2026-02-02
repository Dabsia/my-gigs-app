import { useState, useEffect } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import PrimaryBtn from "../PrimaryBtn/PrimaryBtn";

const Calendar = ({
  selectedDate,
  onSelectDate,
  isDateModalOpen,
  onDateConfirm,
  setShowDatePicker,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const days = [];

  // Empty slots before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const isSameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // Check if a date is in the past (before today)
  const isPastDate = (date) => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate < today;
  };

  // Check if a date is today
  const isToday = (date) => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate.getTime() === today.getTime();
  };

  return (
    <Modal
      visible={isDateModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        onDateConfirm();
      }}
    >
      <View className="bg-white h-full justify-between flex  border border-gray-300 p-4">
        {/* Month Header */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}
            >
              <Text className="text-[30px] font-semiBold">‹</Text>
            </TouchableOpacity>

            <Text className="text-base font-semiBold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>

            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}
            >
              <Text className="text-[30px] font-semiBold">›</Text>
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View className="flex-row justify-between mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <Text
                key={d}
                className="w-8 text-center text-xs font-regular text-gray-500"
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View className="flex-row flex-wrap">
            {days.map((day, index) => {
              const selected = isSameDay(day, selectedDate);
              const pastDate = isPastDate(day);
              const today = isToday(day);

              return (
                <TouchableOpacity
                  key={index}
                  disabled={!day || pastDate}
                  onPress={() => day && onSelectDate(day)}
                  className={`w-[14.28%] h-10 flex items-center justify-center mb-2 ${
                    selected ? "bg-secondary rounded-full" : ""
                  } ${pastDate ? "opacity-40" : ""}`}
                >
                  {day && (
                    <>
                      <Text
                        className={`text-sm ${
                          selected
                            ? "text-white font-semiBold"
                            : pastDate
                            ? "text-gray-400 font-regular"
                            : "text-gray-900 font-regular"
                        } ${
                          today && !selected
                            ? "text-blue-500 font-semiBold"
                            : ""
                        }`}
                      >
                        {day.getDate()}
                      </Text>
                      {today && !selected && (
                        <View className="w-1 h-1 bg-blue-500 rounded-full mt-0.5" />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View>
          <PrimaryBtn text="Close" handlePress={setShowDatePicker} />
        </View>
      </View>
    </Modal>
  );
};

export default Calendar;
