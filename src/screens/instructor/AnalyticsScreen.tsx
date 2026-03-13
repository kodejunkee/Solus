import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { analyticsService } from '../../services/analyticsService';
import { InstructorAnalytics } from '../../types';
import { StatsCard } from '../../components/Card';
import { Header } from '../../components/ui';
import { LoadingScreen } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function InstructorAnalyticsScreen() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await analyticsService.getInstructorAnalytics(user.id);
      setAnalytics(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load analytics' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !analytics) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <Header title="Analytics" subtitle="Your teaching metrics" />
        <View className="px-5 mt-4 mb-8">
          <View className="flex-row flex-wrap gap-3">
            <StatsCard title="Courses" value={analytics.total_courses} icon="📚" />
            <StatsCard title="Students" value={analytics.total_students} icon="👥" />
            <StatsCard title="Materials" value={analytics.total_materials} icon="📄" />
            <StatsCard title="Downloads" value={analytics.total_downloads} icon="⬇️" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
