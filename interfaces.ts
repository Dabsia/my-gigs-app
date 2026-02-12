export interface ClientInfo {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string
    id: string;
}
  
export interface BoardSettings {
    progressPercentage: number;
    notes: string;
}
  
export interface ProjectInterface {
    _id: string;
    userId: string;
    clientId: string | null;
    client: ClientInfo;
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    startDate: string;
    dueDate: string;
    budget: number;
    hourlyRate: number;
    format: 'milestone' | 'hourly' | 'fixed';
    milestones: Array<any>;
    totalAmount: number;
    amountPaid: number;
    totalTimeSpent: number;
    billableTime: number;
    nonBillableTime: number;
    boardSettings: BoardSettings;
    tags: string[];
    teamMembers: Array<any>;
    activityLog: Array<any>;
    createdAt: string;
    updatedAt?: string;
    progressPercentage: string
    
    // For display purposes (mapped from API)
    id: string; // Same as _id
    name: string; // Same as title
    date: string; // Formatted date
    percent: number; // From boardSettings.progressPercentage
    gigType?: string; // Based on format
}

export interface UserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
    // Add other user fields as needed
}

export interface ClientData {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  color?: string;
}

export interface ClientsProps {
  _id: string;
  color: string;
  name: string;
}

export interface ProjectData {
  _id: string;
  title: string;
  dueDate: string;
  status: string;
  client?: {
    name: string;
    company?: string;
  };
}