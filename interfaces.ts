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
    address?: string;
    profession?:string;
    phoneNumber?:string
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

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "review" | "done";

// Update Task interface
export interface Task {
  _id: string;
  id?: string;
  title: string;
  projectId: string;
  dueDate: string; // Formatted for display
  dueDateISO: string; // Original ISO string
  priority: Priority;
  description?: string;
  tags?: string[];
  status: Status;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: Status;
  title: string;
  count: number;
  tasks: Task[];
  color?: string;
  wipLimit?: number | null;
}

export interface ProjectData {
  _id: string;
  name: string;
  description?: string;
}

export interface TaskStats {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  total: number;
}

export interface ApiBoardResponse {
  success: boolean;
  data: {
    board: {
      todo: Task[];
      in_progress: Task[];
      review: Task[];
      done: Task[];
    };
    stats: TaskStats;
    boardSettings: {
      columns: {
        todo: { name: string; color: string; wipLimit: number | null };
        in_progress: { name: string; color: string; wipLimit: number | null };
        review: { name: string; color: string; wipLimit: number | null };
        done: { name: string; color: string; wipLimit: number | null };
      };
    };
    totalTasks: number;
  };
}

export type ProjectStatus = "not_started" | "in_progress" | "completed" | "archived";

export interface Project {
  _id: string;
  title?: string;
  name?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  progressPercentage?: number;
  progress?: number;
  format?: string;
  type?: string;
  status?: ProjectStatus;
  totalAmount?: number;
  amountPaid?: number;
  clientId?: string | { _id: string; name?: string };
  client?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

export interface TransformedGig {
  id: string;
  name: string;
  date: string;
  percent: number;
  gigType: string;
  status: string;
  isOverdue: boolean;
  totalAmount: number;
  amountPaid: number;
  client?: { name: string };
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: string;
  hasOverdue: boolean;
  initials: string;
}

export interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalRevenue: number;
  totalPaid: number;
}

export type TabType = "all" | "active" | "overdue";