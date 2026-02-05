import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

type ProfileData = {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  stats: {
    tasks: number;
    completed: number;
    pending: number;
  };
};

type ProfileState = {
  profile: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
  fetchProfile: () => Promise<void>;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: {
    name: 'Loading...',
    role: 'Member',
    avatar: 'https://i.pravatar.cc/300',
    bio: '',
    stats: {
      tasks: 0,
      completed: 0,
      pending: 0,
    },
  },
  
  fetchProfile: async () => {
    try {
        const { user } = useAuthStore.getState();
        if (!user?.id) return;

        // 1. Fetch User Profile Data
        const { data: userData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        let userProfile = {};
        const currentProfile = get().profile;
        if (userData) {
            userProfile = {
                name: userData.name || currentProfile.name,
                role: userData.role || 'Member',
                bio: userData.about_me || '',
                avatar: userData.profile_image || currentProfile.avatar,
            };
        }

        // 2. Fetch Task Stats
        // Supabase doesn't have a simple multi-conditional count in one query via JS client easily without views or rpc, 
        // but we can make two cheap count calls.
        
        const { count: total, error: totalError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const { count: completed, error: completedError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_completed', true);

        const safeTotal = total || 0;
        const safeCompleted = completed || 0;
        const pending = safeTotal - safeCompleted;

        set((state) => ({
            profile: {
                ...state.profile,
                ...userProfile,
                stats: {
                    tasks: safeTotal,
                    completed: safeCompleted,
                    pending: pending
                }
            }
        }));
    } catch (e) {
        console.error("Error fetching profile:", e);
    }
  },

  updateProfile: async (data) => {
    // 1. Optimistic Update
    set((state) => {
        const updated = { ...state.profile, ...data };
        return { profile: updated };
    });

    // 2. Persist to DB
    try {
        const { profile } = get();
        const { user } = useAuthStore.getState();
        
        if (user?.id) {
            const updates = {
                name: profile.name,
                role: profile.role,
                about_me: profile.bio,
                profile_image: profile.avatar
            };

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...updates
                });

            if (error) throw error;
            
            // Sync with useAuthStore if needed
            useAuthStore.setState(prev => ({
                user: prev.user ? { 
                    ...prev.user, 
                    ...updates
                } : null
            }));
        }
    } catch (e) {
        console.error("Error updating profile db:", e);
        get().fetchProfile(); // Revert on error
    }
  },
}));
