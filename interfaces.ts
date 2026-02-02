export interface ClientInfo {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string
  }
  
 export interface BoardSettings {
    progressPercentage: number;
    notes: string;
  }
  
  export interface ProjectInterface {
    _id: string;
    userId: string;
    clientId: string | null;
    clientInfo: ClientInfo;
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