import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Task } from '@/types/task';
import { bulkInsertTasksForUser } from '@/integrations/supabase/tasks';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string, age?: number) => Promise<void>;
  signOut: () => Promise<void>;
  enableGuestMode: () => void;
  disableGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // Check if user was in guest mode
        const guestMode = localStorage.getItem('guest-mode') === 'true';
        setIsGuest(guestMode);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        // If user signs in, disable guest mode
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('guest-mode');

          // One-time migration: move local tasks to Supabase for this user if not migrated yet
          try {
            const migrateKey = `migrated-tasks-${session.user.id}`;
            if (!localStorage.getItem(migrateKey)) {
              const savedTasks = localStorage.getItem('gamified-tasks');
              if (savedTasks) {
                const parsed: any[] = JSON.parse(savedTasks);
                const tasks: Task[] = parsed.map((t: any) => ({
                  id: t.id,
                  text: t.text,
                  completed: !!t.completed,
                  category: t.category,
                  priority: t.priority,
                  createdAt: new Date(t.createdAt),
                  completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
                  startDate: t.startDate ? new Date(t.startDate) : undefined,
                  endDate: t.endDate ? new Date(t.endDate) : undefined,
                  startTime: t.startTime ?? undefined,
                  endTime: t.endTime ?? undefined,
                  reminderTime: t.reminderTime ? new Date(t.reminderTime) : undefined,
                }));
                if (tasks.length) {
                  await bulkInsertTasksForUser(session.user.id, tasks);
                }
                localStorage.setItem(migrateKey, 'true');
              }
            }
          } catch (e) {
            console.error('Task migration failed:', e);
          }
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username?: string, age?: number) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: username || undefined,
          age: age || undefined,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsGuest(false);
    localStorage.removeItem('guest-mode');
  };

  const enableGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('guest-mode', 'true');
  };

  const disableGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('guest-mode');
  };

  const value: AuthContextType = {
    user,
    isGuest,
    isLoading,
    signIn,
    signUp,
    signOut,
    enableGuestMode,
    disableGuestMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 