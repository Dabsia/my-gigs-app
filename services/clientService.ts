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
  // All methods accept token as parameter
  createClient: async (clientData: ClientData, token: string): Promise<ClientResponse> => {
    if (!token) throw new Error("You are not logged in.");

    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      throw new Error("Invalid response from server.");
    }

    if (!response.ok) {
      throw new Error(data?.message || `Failed to create client (${response.status})`);
    }

    if (!data.success) {
      throw new Error(data?.message || "Failed to create client");
    }

    return data;
  },

  getClients: async (token: string) => {
    if (!token) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch clients (${response.status})`);
    }

    return data;
  },

  getClientById: async (clientId: string, token: string) => {
    if (!token) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch client (${response.status})`);
    }

    return data;
  },

  updateClient: async (clientId: string, clientData: Partial<ClientData>, token: string) => {
    if (!token) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to update client (${response.status})`);
    }

    return data;
  },

  deleteClient: async (clientId: string, token: string) => {
    if (!token) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to delete client (${response.status})`);
    }

    return data;
  },
};