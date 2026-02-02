import { projectService } from "@/services/projectService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const DeleteProjectModal = ({
  closeModal,
  gig,
}: {
  closeModal: () => void;
  gig: any;
}) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  console.log(gig, "gigs");

  const { mutate: deleteProjectMutation } = useMutation({
    mutationFn: () => projectService.deleteProject(gig._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["client-projects"] });

      closeModal();
      router.back();
    },
  });

  const deleteProject = () => {
    deleteProjectMutation();
    // console.log(gig, "gigs");
  };

  const navigateToEdit = () => {
    closeModal();
  };
  return (
    <View className="w-full pb-6 px-4">
      <Text className="font-semiBold text-primary text-[20px]">
        Choose an option
      </Text>
      <View>
        <Pressable
          onPress={navigateToEdit}
          className="mt-8 border-b-2 border-[#d9d9d9] pb-6"
        >
          <Text className="font-semiBold text-secondary text-[16px] mb-2">
            No, Keep Project
          </Text>
          <View className="flex-row w-full justify-between">
            <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%] ">
              Tap here to keep the project and prevent it from being deleted.
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={deleteProject} className="mt-8">
          <Text className="font-semiBold text-error text-[16px] mb-2">
            Yes, Delete Project
          </Text>
          <View className="flex-row w-full justify-between">
            <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%]">
              This action will permanently delete the project and all associated
              data.
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default DeleteProjectModal;
