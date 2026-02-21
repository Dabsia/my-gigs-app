import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const Logout = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Go to root-level signout screen first; it then replaces to "/" so we land on landing page, not (tabs)/index.
      setTimeout(() => {
        router.replace("/signout");
      }, 0);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="flex-row items-center mt-10 mb-16"
    >
      <LogOut size={22} color="#E23B3B" />
      <Text className="text-red-500 text-lg font-semiBold ml-3">Logout</Text>
    </TouchableOpacity>
  );
};

export default Logout;
