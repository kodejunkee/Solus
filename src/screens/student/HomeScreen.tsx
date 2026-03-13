import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { notificationService } from '../../services/notificationService';
import { courseService } from '../../services/courseService';
import { Notification, Material } from '../../types';
import { AnnouncementCard } from '../../components/AnnouncementCard';
import { MaterialItem } from '../../components/MaterialItem';
import { Header } from '../../components/ui';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { fileService } from '../../services/fileService';
import Toast from 'react-native-toast-message';

export function StudentHomeScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [notifs, materials] = await Promise.all([
        notificationService.getNotifications(5),
        user ? courseService.getRecentMaterials(user.id, 5) : Promise.resolve([]),
      ]);
      setNotifications(notifs);
      setRecentMaterials(materials);

      // Check downloaded status
      const downloaded = new Set<string>();
      for (const m of materials) {
        const localPath = await fileService.getLocalFilePath(m);
        if (localPath) downloaded.add(m.id);
      }
      setDownloadedIds(downloaded);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed to load data' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownload = async (material: Material) => {
    setDownloadingId(material.id);
    try {
      await fileService.downloadMaterial(material);
      setDownloadedIds((prev) => new Set(prev).add(material.id));
      Toast.show({ type: 'success', text1: 'Downloaded successfully' });
    } catch {
      Toast.show({ type: 'error', text1: 'Download failed', text2: 'Please try again' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpen = async (material: Material) => {
    try {
      const localPath = await fileService.getLocalFilePath(material);
      if (localPath) {
        await fileService.openFile(localPath);
      } else {
        Toast.show({
          type: 'error',
          text1: 'File missing',
          text2: 'This file is missing. Please download it again.',
        });
        setDownloadedIds((prev) => {
          const next = new Set(prev);
          next.delete(material.id);
          return next;
        });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open file' });
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
        }
      >
        <Header title={`Hello, ${user?.name?.split(' ')[0] || 'Student'}`} subtitle="Welcome back to Solus" />

        {/* Announcements */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">📢</Text>
              <Text className="text-white text-lg font-bold">Announcements</Text>
            </View>
          </View>
          {notifications.length === 0 ? (
            <View className="bg-dark-800 border border-dark-700 rounded-2xl p-6 items-center">
              <Text className="text-dark-400 text-sm text-center">No announcements yet</Text>
            </View>
          ) : (
            notifications.map((n) => <AnnouncementCard key={n.id} notification={n} />)
          )}
        </View>

        {/* Recent Materials */}
        <View className="px-5 mt-6 mb-8">
          <View className="flex-row items-center mb-3">
            <Text className="text-lg mr-2">📚</Text>
            <Text className="text-white text-lg font-bold">Recent Materials</Text>
          </View>
          {recentMaterials.length === 0 ? (
            <View className="bg-dark-800 border border-dark-700 rounded-2xl p-6 items-center">
              <Text className="text-dark-400 text-sm text-center">No recent materials</Text>
            </View>
          ) : (
            recentMaterials.map((m) => (
              <MaterialItem
                key={m.id}
                material={m}
                isDownloaded={downloadedIds.has(m.id)}
                isDownloading={downloadingId === m.id}
                onDownload={() => handleDownload(m)}
                onOpen={() => handleOpen(m)}
                showCourse
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
