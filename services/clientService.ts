// services/clientService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";

export interface ClientData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface ClientResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address?: string;
    notes?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const clientService = {
  // Create a new client
  createClient: async (clientData: ClientData): Promise<ClientResponse> => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in. Please log in and try again.");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify(clientData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 409) {
        throw new Error("A client with this email already exists.");
      }
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }
      throw new Error(data.message || `Failed to create client (${response.status})`);
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to create client");
    }

    return data;
  },

  // Get all clients
  getClients: async (): Promise<{
    success: boolean;
    data: Array<{
      _id: string;
      name: string;
      email: string;
      company?: string;
      phone?: string;
      projectsCount?: number;
    }>;
  }> => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch clients (${response.status})`);
    }

    return data;
  },

  // Get single client by ID
  getClientById: async (clientId: string) => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch client (${response.status})`);
    }

    return data;
  },

  // Update client
  updateClient: async (clientId: string, clientData: Partial<ClientData>) => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify(clientData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to update client (${response.status})`);
    }

    return data;
  },

  // Delete client
  deleteClient: async (clientId: string) => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to delete client (${response.status})`);
    }

    return data;
  },
};