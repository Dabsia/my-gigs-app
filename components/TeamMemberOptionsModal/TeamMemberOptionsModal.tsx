import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const TeamMemberOptionsModal = ({ closeModal }: { closeModal: () => void }) => {
  const deleteProject = () => {
    closeModal();
  };
  const router = useRouter();
  const navigateToEdit = () => {
    router.push("/giginfo/editteam");
    closeModal();
  };
  return (
    <View className="w-full pb-4 px-4">
      <Text className="font-semiBold text-primary text-[20px]">
        Choose an option
      </Text>
      <View>
        <Pressable
          onPress={navigateToEdit}
          className="mt-8 border-b-2 border-[#d9d9d9] pb-6"
        >
          <Text className="font-semiBold text-secondary text-[16px] mb-2">
            Edit Team Member
          </Text>
          <View className="flex-row w-full justify-between">
            <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%] ">
              Tap here to update the team member’s role, name or email.
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={deleteProject} className="mt-8 ">
          <Text className="font-semiBold text-error text-[16px] mb-2">
            Remove Team Member
          </Text>
          <View className="flex-row w-full justify-between">
            <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%] ">
              This will permanently remove the team member from this project
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default TeamMemberOptionsModal;
