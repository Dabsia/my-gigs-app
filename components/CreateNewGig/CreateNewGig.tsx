// components/CreateNewGig/CreateNewGig.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

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
  clientData?: ClientData;
  onSuccess?: () => void;
}

const CreateNewGig = ({ location, clientData }: CreateNewGigProps) => {
  const router = useRouter();

  const handlePress = () => {
    console.log("CreateNewGig pressed:", { location, clientData });

    if (clientData) {
      // Get the client ID from either _id or id
      const clientId = clientData._id || clientData.id;
      const clientName = clientData.name || "";

      // Create params object - match what the receiving page expects
      const params: Record<string, string> = {
        clientId: clientId || "",
        clientName: clientName,
        // Pass the entire client data as JSON string
        client: JSON.stringify(clientData), // Use 'client' key if that's what the receiving page expects
      };

      router.push({
        pathname: `/${location}`,
        params: params,
      });
    } else {
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
