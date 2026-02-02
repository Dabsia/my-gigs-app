// services/projectService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/utils/config";

const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem("auth_token");
  if (!token) throw new Error("You are not logged in");
  return token;
};

export const projectService = {
  createProject: async (projectData:any) => {
    const authToken = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/project`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to create project (${response.status})`
      );
    }

    return data;
  },

  // You can add other project-related methods here
  getProjects: async () => {
    const authToken = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to fetch projects (${response.status})`
      );
    }

    return data;
  },

  deleteProject: async (projectId: string) => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) throw new Error("You are not logged in");
  
    const response = await fetch(
      `${API_BASE_URL}/api/project/${projectId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message || `Failed to delete project (${response.status})`
      );
    }
  
    return data;
  }
};

// Service function to fetch client projects
export const fetchClientProjects = async (clientId: string) => {
    const authToken = await AsyncStorage.getItem("auth_token");
    if (!authToken) {
      throw new Error("You are not logged in");
    }
  
    // Use the new endpoint
    const response = await fetch(`${API_BASE_URL}/api/projects/client/${clientId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data.message || `Failed to fetch client projects (${response.status})`
      );
    }
  
    return data;
  };

  