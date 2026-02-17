import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

const DeleteProjectModal = ({
  closeModal,
  gig,
}: {
  closeModal: () => void;
  gig: any;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  console.log(gig._id);

  const { mutate: deleteProject, isPending } = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const response = await fetch(`${API_BASE_URL}/api/project/${gig._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all project-related queries
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["client-projects"] });
      queryClient.invalidateQueries({ queryKey: ["gigs"] });
      queryClient.invalidateQueries({ queryKey: ["client-data"] });

      closeModal();
      router.back();
    },
    onError: (error: Error) => {
      console.error("Delete project error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to delete project. Please try again."
      );
    },
  });

  const handleDeleteProject = () => {
    deleteProject();
  };

  const navigateToEdit = () => {
    closeModal();
    router.back();
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
          disabled={isPending}
        >
          <Text className="font-semiBold text-secondary text-[16px] mb-2">
            No, Keep Project
          </Text>
          <View className="flex-row w-full justify-between">
            <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%]">
              Tap here to keep the project and prevent it from being deleted.
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleDeleteProject}
          className="mt-8"
          disabled={isPending}
        >
          {isPending ? (
            <View className="items-center">
              <ActivityIndicator size="small" color="#EF4444" />
              <Text className="font-semiBold text-error text-[16px] mt-2">
                Deleting...
              </Text>
            </View>
          ) : (
            <>
              <Text className="font-semiBold text-error text-[16px] mb-2">
                Yes, Delete Project
              </Text>
              <View className="flex-row w-full justify-between">
                <Text className="text-[14px] text-[#03010A8C] font-aeonikRegular w-[80%]">
                  This action will permanently delete the project and all
                  associated data.
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default DeleteProjectModal;
