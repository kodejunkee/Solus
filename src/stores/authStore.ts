import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../constants/supabase';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const profile = await authService.getProfile(session.user.id);
            set({ session, user: profile, isLoading: false, isInitialized: true });
          } catch {
            set({ session, user: null, isLoading: false, isInitialized: true });
          }
        } else {
          set({ session: null, user: null, isLoading: false, isInitialized: true });
        }
      });

      // Check existing session
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ session, user: profile, isLoading: false, isInitialized: true });
      } else {
        set({ isLoading: false, isInitialized: true });
      }
    } catch {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { session } = await authService.signIn(email, password);
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ session, user: profile, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      const { session } = await authService.signUp(email, password, name);
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ session, user: profile, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({ user: null, session: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshProfile: async () => {
    const { session } = get();
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id);
      set({ user: profile });
    }
  },
}));
