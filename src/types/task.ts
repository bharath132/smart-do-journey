export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  category: string;
  priority: TaskPriority;
  createdAt: Date;
  completedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  reminderTime?: Date;
} 