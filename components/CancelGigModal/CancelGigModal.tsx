import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Pressable, Text, View } from "react-native";

const CancelGigModal = ({ closeModal }: { closeModal: () => void }) => {
  return (
    <View className="  w-full pb-4 p-4">
      <Text className="font-semiBold text-primary text-[20px]">
        Choose an option
      </Text>
      <View>
        <Pressable className="mt-8 border-b-2 border-[#d9d9d9] pb-6">
          <Text className="font-semiBold text-secondary text-[16px] mb-2">
            Save as draft
          </Text>
          <View className="flex-row w-full justify-between">
            <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%] ">
              You would be able to later access (view or edit) this gig details
            </Text>
            <AntDesign name="right" size={22} color="#cdcdcd" />
          </View>
        </Pressable>
        <Pressable className="mt-8 ">
          <Text className="font-semiBold text-secondary text-[16px] mb-2">
            Dicard
          </Text>
          <View className="flex-row w-full justify-between">
            <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%] ">
              Details would be gone forever, you won’t be able to access it
            </Text>
            <AntDesign name="right" size={22} color="#cdcdcd" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default CancelGigModal;
