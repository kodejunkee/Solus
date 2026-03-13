import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Text, Alert, Modal, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Header } from '../../components/ui';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { timeAgo } from '../../utils/formatting';
import Toast from 'react-native-toast-message';

export function AnnouncementsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load announcements' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }
    if (!user) return;

    setSending(true);
    try {
      await notificationService.createNotification(title.trim(), message.trim(), user.id);
      Toast.show({ type: 'success', text1: 'Announcement sent!' });
      setTitle('');
      setMessage('');
      fetchData();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to send announcement' });
    } finally {
      setSending(false);
    }
  };

  const openEdit = (n: Notification) => {
    setEditingNotification(n);
    setEditTitle(n.title);
    setEditMessage(n.message);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingNotification || !editTitle.trim() || !editMessage.trim()) return;
    setUpdating(true);
    try {
      await notificationService.updateNotification(editingNotification.id, editTitle.trim(), editMessage.trim());
      Toast.show({ type: 'success', text1: 'Announcement updated!' });
      setShowEditModal(false);
      setEditingNotification(null);
      fetchData();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (n: Notification) => {
    Alert.alert(
      'Delete Announcement',
      `Are you sure you want to delete "${n.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(n.id);
              Toast.show({ type: 'success', text1: 'Announcement deleted' });
              fetchData();
            } catch {
              Toast.show({ type: 'error', text1: 'Failed to delete' });
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <Header title="Announcements" subtitle="Send global notifications" />

        {/* Send Announcement */}
        <View className="px-5 mt-2">
          <Card>
            <Text className="text-white text-base font-semibold mb-3">📢 New Announcement</Text>
            <Input
              placeholder="Announcement title"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              placeholder="Announcement message"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
            <Button title="Send Announcement" onPress={handleSend} loading={sending} />
          </Card>
        </View>

        {/* Past Announcements */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-white text-lg font-bold mb-3">Past Announcements</Text>
          {notifications.length === 0 ? (
            <EmptyState icon="📢" title="No announcements" message="Send your first announcement above" />
          ) : (
            notifications.map((n) => (
              <View key={n.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-4 mb-3">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-amber-500/20 rounded-xl items-center justify-center mr-3">
                    <Text className="text-lg">📢</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold">{n.title}</Text>
                    <Text className="text-dark-300 text-sm mt-1.5 leading-5">{n.message}</Text>
                    <Text className="text-dark-500 text-xs mt-2">{timeAgo(n.created_at)}</Text>
                  </View>
                </View>
                {/* Admin actions */}
                <View className="flex-row justify-end mt-3 pt-3 border-t border-dark-700 gap-2">
                  <Button title="✏️ Edit" size="sm" variant="outline" onPress={() => openEdit(n)} />
                  <Button title="🗑️ Delete" size="sm" variant="danger" onPress={() => handleDelete(n)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-dark-900 rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-6">Edit Announcement</Text>
            <Input
              label="Title"
              placeholder="Announcement title"
              value={editTitle}
              onChangeText={setEditTitle}
            />
            <Input
              label="Message"
              placeholder="Announcement message"
              value={editMessage}
              onChangeText={setEditMessage}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
            <View className="flex-row gap-3 mt-2">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowEditModal(false)}
                className="flex-1"
              />
              <Button
                title="Save"
                onPress={handleUpdate}
                loading={updating}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
