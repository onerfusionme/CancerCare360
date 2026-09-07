export enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED'
}

export interface FollowUpTask {
  id: string;
  patientId: string;
  taskType: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  assignedToId?: string;
  escalationLevel: number;
  patient?: any;
  assignedTo?: any;
}

export interface CreateTaskDto {
  patientId: string;
  taskType: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignedToId?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
  escalationLevel?: number;
}

export interface TaskFilter {
  priority?: TaskPriority;
  status?: TaskStatus;
  taskType?: string;
  overdue?: boolean;
}

export interface TaskDashboardStats {
  open: number;
  inProgress: number;
  overdue: number;
  resolvedToday: number;
  totalThisWeek: number;
}
