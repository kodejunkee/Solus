import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { courseService } from '../../services/courseService';
import { User } from '../../types';
import { SearchBar, Header, Badge, Avatar } from '../../components/ui';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function UserManagementScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await courseService.getAllUsers(search || undefined);
      setUsers(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load users' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRoleChange = (user: User) => {
    if (user.role === 'admin') {
      Toast.show({ type: 'info', text1: 'Cannot change admin role' });
      return;
    }

    const newRole = user.role === 'student' ? 'instructor' : 'student';
    const action = user.role === 'student' ? 'Promote to Instructor' : 'Demote to Student';

    Alert.alert(
      action,
      `Are you sure you want to ${action.toLowerCase()} "${user.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdatingId(user.id);
            try {
              await courseService.updateUserRole(user.id, newRole);
              Toast.show({ type: 'success', text1: `User ${action.toLowerCase()}d!` });
              fetchData();
            } catch {
              Toast.show({ type: 'error', text1: 'Failed to update role' });
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <Header title="User Management" subtitle={`${users.length} users`} />
      <View className="px-5 mb-3">
        <SearchBar
          placeholder="Search by name, email, or ID..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchData}
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={<EmptyState icon="👥" title="No users found" message="Try a different search" />}
        renderItem={({ item }) => (
          <Card className="mb-3">
            <View className="flex-row items-center">
              <Avatar name={item.name} size="md" />
              <View className="flex-1 ml-3">
                <Text className="text-white text-base font-semibold">{item.name}</Text>
                <Text className="text-dark-400 text-sm">{item.email}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-dark-500 text-xs font-mono mr-3">{item.user_code}</Text>
                  <Badge
                    label={item.role}
                    variant={item.role === 'admin' ? 'danger' : item.role === 'instructor' ? 'warning' : 'primary'}
                  />
                </View>
              </View>
              {item.role !== 'admin' && (
                <Button
                  title={item.role === 'student' ? '⬆️' : '⬇️'}
                  size="sm"
                  variant={item.role === 'student' ? 'primary' : 'danger'}
                  onPress={() => handleRoleChange(item)}
                  loading={updatingId === item.id}
                />
              )}
            </View>
          </Card>
        )}
      />
    </View>
  );
}
