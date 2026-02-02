// hooks/useUserProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";
import { UserData } from "@/interfaces";

// Keys for React Query
export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
};

/**
 * Hook to fetch current user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async (): Promise<UserData> => {
      const response = await API_BASE_URL("/users/me");

      if (response.success && response.data) {
        // Store in AsyncStorage for offline access
        await AsyncStorage.setItem("user_data", JSON.stringify(response.data));
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch user profile");
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    // Optional: Initial data from AsyncStorage for better UX
    initialData: async () => {
      try {
        const cached = await AsyncStorage.getItem("user_data");
        return cached ? JSON.parse(cached) : undefined;
      } catch {
        return undefined;
      }
    },
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: Partial<UserData>) => {
      const response = await apiRequest("/users/profile", "PATCH", updateData);

      if (!response.success) {
        throw new Error(response.message || "Failed to update profile");
      }

      return response.data;
    },
    onMutate: async (updateData) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<UserData>(
        userKeys.profile()
      );

      // Optimistically update the cache
      if (previousUser) {
        queryClient.setQueryData<UserData>(userKeys.profile(), (old) => ({
          ...old!,
          ...updateData,
          updatedAt: new Date().toISOString(),
        }));
      }

      return { previousUser };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.profile(), context.previousUser);
      }
    },
    onSuccess: async (data) => {
      // Update AsyncStorage with fresh data
      try {
        await AsyncStorage.setItem("user_data", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to update AsyncStorage:", error);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

/**
 * Hook to get user data with optimistic updates
 */
export const useUser = () => {
  const { data: user, isLoading, error, refetch } = useUserProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  return {
    user,
    isLoading,
    error,
    refetch,
    updateProfile,
    isUpdating,
  };
};
