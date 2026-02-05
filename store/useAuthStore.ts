import { supabase } from '@/lib/supabase';
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  about_me?: string;
  profile_image?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string) => Promise<boolean>; // Changed to void/boolean promise for clarity, using simpler flow here
  register: (name: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check session

  initialize: async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
            // Fetch user details from Supabase
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profile) {
               set({ user: { ...profile, email: session.user.email! }, isAuthenticated: true, isLoading: false });
            } else {
               set({ 
                   user: { id: session.user.id, email: session.user.email || '', name: 'User' },
                   isAuthenticated: true, 
                   isLoading: false 
               });
            }
        } else {
            set({ isAuthenticated: false, isLoading: false });
        }
    } catch (e) {
        console.error("Auth initialization error", e);
        set({ isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string) => {
    // Note: This is a placeholder for actual email/password login. 
    // Since the UI only asks for email/password, we need to implement signInWithPassword.
    // However, the previous mock interface was `login(email)`. 
    // I will assume for now we might change the UI to ask for password or use magic link, 
    // but to fit the existing UI, I will expect the component to pass password too.
    // For now, I will keep the signature but this needs the component update.
    // Actually, I'll update this signature to accept password.
    return false; 
  },

  register: async (name: string, email: string) => {
      // Placeholder signature update needed
      return false;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));

// Separate actions to avoid changing the store signature too much in one step if complex, 
// but here I will expose helper functions or just update the Component later.
// Let's rewrite the store to actually match what we need. 

export const useAuthActions = {
     login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const trimmedEmail = email.trim();
        const { error, data } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error || !data.user) {
            console.log("Login Error:", error);
            return { success: false, error: error?.message || "Login failed" };
        }

        // Fetch profile from Supabase
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profile) {
           useAuthStore.setState({ 
               user: { ...profile, email: trimmedEmail }, 
               isAuthenticated: true 
            });
        } else {
           // Fallback if profile doesn't exist (should strictly ideally exist)
           useAuthStore.setState({ user: { id: data.user.id, email: trimmedEmail, name: 'User' }, isAuthenticated: true });
        }
        return { success: true };
     },
     register: async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const trimmedEmail = email.trim();
        const { error, data } = await supabase.auth.signUp({ 
            email: trimmedEmail, 
            password,
            options: {
                data: { full_name: name } 
            }
        });
        
        if (error || !data.user) {
             console.log("Register Error:", error);
             return { success: false, error: error?.message || "Registration failed" };
        }

        // Create Profile in Supabase
        const newProfile = {
            id: data.user.id,
            email: trimmedEmail,
            name: name,
            role: 'Member', // Default
            about_me: ''
        };

        const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);

        if (insertError) {
            console.error("Profile creation failed:", insertError);
            // Optionally handle this, but auth was successful
        }

        useAuthStore.setState({ 
            user: newProfile, 
            isAuthenticated: true 
        });
        
        return { success: true };
     },
     logout: async () => {
        await supabase.auth.signOut();
        useAuthStore.setState({ user: null, isAuthenticated: false });
     }
}
