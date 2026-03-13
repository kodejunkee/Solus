import { supabase } from '../constants/supabase';
import { User } from '../types';
import { generateUserCode } from '../utils/userCode';

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, name: string) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Signup failed');

    // 2. Generate unique user code with retry
    let userCode = generateUserCode();
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        name,
        email,
        role: 'student',
        user_code: userCode,
      });

      if (!insertError) break;

      // If unique constraint violation, retry with new code
      if (insertError.code === '23505') {
        userCode = generateUserCode();
        retries++;
      } else {
        throw insertError;
      }
    }

    if (retries >= maxRetries) {
      throw new Error('Failed to generate unique user code');
    }

    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updatePushToken(userId: string, token: string) {
    const { error } = await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', userId);
    if (error) throw error;
  },
};
