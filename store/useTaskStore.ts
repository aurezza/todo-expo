import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { useProfileStore } from './useProfileStore';

export interface Task {
  id: number;
  user_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
        set({ tasks: [] });
        return;
    }

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      set({ tasks: data || [], isLoading: false });
      
      // Update profile stats whenever we fetch tasks
      useProfileStore.getState().fetchProfile();
    } catch (e) {
      console.error("Failed to fetch tasks", e);
      set({ isLoading: false });
    }
  },

  addTask: async (title: string) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
            user_id: user.id,
            title: title,
            is_completed: false
        });

      if (error) throw error;

      // Refresh
      get().fetchTasks();
    } catch (e) {
      console.error("Failed to add task", e);
    }
  },

  toggleTask: async (id: number) => {
    try {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        // Optimistic update
        const newStatus = !task.is_completed;
        set(state => ({
            tasks: state.tasks.map(t => 
                t.id === id ? { ...t, is_completed: newStatus } : t
            )
        }));

        if (newStatus) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Task Completed! 🎉",
                    body: `You've completed "${task.title}"`,
                },
                trigger: null,
            });
        }

        const { error } = await supabase
            .from('tasks')
            .update({ is_completed: newStatus })
            .eq('id', id);
        
        if (error) {
            console.error("Failed to toggle task in DB", error);
            // Revert on error if strict, but for now simple
            get().fetchTasks(); // Re-fetch to sync
        } else {
             // Update stats silently
             useProfileStore.getState().fetchProfile();
        }
    } catch (e) {
        console.error("Failed to toggle task", e);
    }
  },

  deleteTask: async (id: number) => {
      try {
          // Optimistic
          const task = get().tasks.find(t => t.id === id);
          set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
          
          if (task) {
              await Notifications.scheduleNotificationAsync({
                  content: {
                      title: "Task Removed 🗑️",
                      body: `"${task.title}" has been removed`,
                  },
                  trigger: null,
              });
          }
          
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          useProfileStore.getState().fetchProfile();
      } catch (e) {
          console.error("Failed to delete task", e);
          get().fetchTasks(); // Revert/Sync
      }
  }
}));
