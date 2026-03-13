import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { analyticsService } from '../../services/analyticsService';
import { PlatformAnalytics } from '../../types';
import { StatsCard } from '../../components/Card';
import { Header } from '../../components/ui';
import { LoadingScreen } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function AdminDashboardScreen() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await analyticsService.getPlatformAnalytics();
      setAnalytics(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load analytics' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !analytics) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <Header title="Admin Dashboard" subtitle="Platform overview" />
        <View className="px-5 mt-4 mb-8">
          <Text className="text-white text-lg font-bold mb-3">📊 Platform Analytics</Text>
          <View className="flex-row flex-wrap gap-3">
            <StatsCard title="Total Users" value={analytics.total_users} icon="👤" />
            <StatsCard title="Students" value={analytics.total_students} icon="🎓" />
            <StatsCard title="Instructors" value={analytics.total_instructors} icon="👨‍🏫" />
            <StatsCard title="Courses" value={analytics.total_courses} icon="📚" />
            <StatsCard title="Materials" value={analytics.total_materials} icon="📄" />
            <StatsCard title="Downloads" value={analytics.total_downloads} icon="⬇️" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
