import { API_BASE_URL } from "@/utils/config";

export interface ProjectData {
  title: string;
  clientId?: string;
  description?: string;
  budget?: number;
  hourlyRate?: number;
  startingAmount?: number;
  dueDate: string;
  startDate: string;
  format: string;
  milestones?: Array<{
    title: string;
    amount: number;
    dueDate: string;
  }>;
}

export const projectService = {
  createProject: async (projectData: ProjectData, token: string) => {
    if (!token) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/project`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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

  getProjects: async (token: string) => {
    if (!token) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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

  deleteProject: async (projectId: string, token: string) => {
    if (!token) {
      throw new Error("You are not logged in");
    }
  
    const response = await fetch(
      `${API_BASE_URL}/api/project/${projectId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
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
export const fetchClientProjects = async (clientId: string, token: string) => {
  if (!token) {
    throw new Error("You are not logged in");
  }

  const response = await fetch(`${API_BASE_URL}/api/projects/client/${clientId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
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