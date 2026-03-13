import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export function LoadingScreen() {
  return (
    <View className="flex-1 bg-dark-950 items-center justify-center">
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="text-dark-400 text-base mt-4">Loading...</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-white text-lg font-semibold text-center">{title}</Text>
      <Text className="text-dark-400 text-sm text-center mt-2 leading-5">{message}</Text>
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}
