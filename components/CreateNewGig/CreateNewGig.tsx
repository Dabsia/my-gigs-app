// components/CreateNewGig/CreateNewGig.tsx
import { View, Text, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

// Define a more flexible interface
interface ClientData {
  id?: string;
  _id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
  hasOverdue?: boolean;
  initials?: string;
  // Allow any additional properties
  [key: string]: any;
}

interface CreateNewGigProps {
  location: string;
  clientData?: ClientData; // Optional client data
}

const CreateNewGig = ({ location, clientData }: CreateNewGigProps) => {
  const router = useRouter();

  const handlePress = () => {
    console.log("CreateNewGig pressed:", { location, clientData });

    if (clientData) {
      // Get the client ID from either _id or id
      const clientId = clientData._id || clientData.id;
      const clientName = clientData.name || "";

      console.log("Client ID to send:", clientId);
      console.log("Full client data:", clientData);

      // Create params object - match what the receiving page expects
      const params: Record<string, string> = {
        clientId: clientId || "",
        clientName: clientName,
        // Pass the entire client data as JSON string
        client: JSON.stringify(clientData), // Use 'client' key if that's what the receiving page expects
      };

      console.log("Navigation params:", params);

      router.push({
        pathname: `/${location}`,
        params: params,
      });
    } else {
      console.log("No client data, navigating without params");
      router.push(`/${location}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="absolute bg-primary h-[60px] justify-center items-center w-[60px] shadow-md rounded-full bottom-8 right-8 "
    >
      <Text className="text-[24px] text-white ">+</Text>
    </Pressable>
  );
};

export default CreateNewGig;
