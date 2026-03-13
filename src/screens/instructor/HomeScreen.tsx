import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { AnnouncementCard } from '../../components/AnnouncementCard';
import { Header } from '../../components/ui';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function InstructorHomeScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const notifs = await notificationService.getNotifications(20);
      setNotifications(notifs);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load announcements' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <Header title={`Hello, ${user?.name?.split(' ')[0] || 'Instructor'}`} subtitle="Instructor Dashboard" />
        <View className="px-5 mt-4 mb-8">
          {notifications.length === 0 ? (
            <EmptyState icon="📢" title="No announcements" message="Announcements from admin will appear here" />
          ) : (
            notifications.map((n) => <AnnouncementCard key={n.id} notification={n} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}
