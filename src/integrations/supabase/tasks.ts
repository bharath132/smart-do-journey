import { supabase } from '@/integrations/supabase/client';
import type { Task, TaskPriority } from '@/types/task';

// Expected database schema for table `tasks`:
// columns: id (uuid, pk), user_id (uuid, fk to auth.users), text (text), completed (bool),
// category (text), priority (text), created_at (timestamptz), completed_at (timestamptz, nullable),
// start_date (date, nullable), end_date (date, nullable), start_time (text, nullable), end_time (text, nullable),
// reminder_time (timestamptz, nullable)

export type TaskRow = {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  category: string;
  priority: TaskPriority;
  created_at: string;
  completed_at: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  reminder_time: string | null;
};

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    category: row.category,
    priority: row.priority,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    reminderTime: row.reminder_time ? new Date(row.reminder_time) : undefined,
  };
}

function taskToUpdateFields(task: Task) {
  return {
    text: task.text,
    completed: task.completed,
    category: task.category,
    priority: task.priority,
    created_at: task.createdAt.toISOString(),
    completed_at: task.completedAt ? task.completedAt.toISOString() : null,
    start_date: task.startDate ? task.startDate.toISOString() : null,
    end_date: task.endDate ? task.endDate.toISOString() : null,
    start_time: task.startTime ?? null,
    end_time: task.endTime ?? null,
    reminder_time: task.reminderTime ? task.reminderTime.toISOString() : null,
  } as const;
}

export async function fetchTasksForUser(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TaskRow[]).map(rowToTask);
}

export async function insertTaskForUser(userId: string, task: Task): Promise<Task> {
  const insertRow = {
    id: task.id,
    user_id: userId,
    ...taskToUpdateFields(task),
  };
  const { data, error } = await supabase
    .from('tasks')
    .insert(insertRow)
    .select('*')
    .single();
  if (error) throw error;
  return rowToTask(data as TaskRow);
}

export async function bulkInsertTasksForUser(userId: string, tasks: Task[]): Promise<void> {
  if (tasks.length === 0) return;
  const rows = tasks.map(task => ({
    id: task.id,
    user_id: userId,
    ...taskToUpdateFields(task),
  }));
  const { error } = await supabase.from('tasks').insert(rows);
  if (error) throw error;
}

export async function updateTaskForUser(userId: string, task: Task): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(taskToUpdateFields(task))
    .eq('id', task.id)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return rowToTask(data as TaskRow);
}

export async function deleteTaskForUser(userId: string, taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);
  if (error) throw error;
} 