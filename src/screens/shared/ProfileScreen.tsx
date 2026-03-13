import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Header, Avatar, Badge } from '../../components/ui';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import Toast from 'react-native-toast-message';

export function ProfileScreen() {
  const { user, signOut, isLoading } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to sign out' });
          }
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView>
        <Header title="Profile" />

        <View className="px-5 mt-2">
          {/* User Info Card */}
          <Card className="items-center py-6">
            <Avatar name={user.name} size="lg" />
            <Text className="text-white text-xl font-bold mt-4">{user.name}</Text>
            <Text className="text-dark-400 text-sm mt-1">{user.email}</Text>
            <Badge
              label={user.role}
              variant={
                user.role === 'admin'
                  ? 'danger'
                  : user.role === 'instructor'
                  ? 'warning'
                  : 'primary'
              }
              className="mt-3"
            />
          </Card>

          {/* User Code */}
          <Card className="mt-4">
            <Text className="text-dark-400 text-sm mb-1">Your Unique ID</Text>
            <Text className="text-white text-2xl font-bold tracking-widest">
              {user.user_code}
            </Text>
            <Text className="text-dark-500 text-xs mt-1">
              Share this with your instructors or admin
            </Text>
          </Card>

          {/* Account Details */}
          <Card className="mt-4">
            <Text className="text-white text-base font-semibold mb-3">Account Details</Text>
            <View className="flex-row justify-between py-2 border-b border-dark-700">
              <Text className="text-dark-400 text-sm">Member Since</Text>
              <Text className="text-white text-sm">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-dark-400 text-sm">Role</Text>
              <Text className="text-white text-sm capitalize">{user.role}</Text>
            </View>
          </Card>

          {/* Sign Out */}
          <View className="mt-6 mb-8">
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="danger"
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
