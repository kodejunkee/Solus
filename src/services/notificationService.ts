import { supabase } from '../constants/supabase';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, creator:users!created_by(id, name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async createNotification(title: string, message: string, createdBy: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ title, message, created_by: createdBy })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateNotification(id: string, title: string, message: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ title, message })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
