import React from 'react';
import { View, Text } from 'react-native';
import { Notification } from '../types';
import { timeAgo } from '../utils/formatting';

interface AnnouncementCardProps {
  notification: Notification;
}

export function AnnouncementCard({ notification }: AnnouncementCardProps) {
  return (
    <View className="bg-dark-800 border border-dark-700 rounded-2xl p-4 mb-3">
      <View className="flex-row items-start">
        <View className="w-10 h-10 bg-amber-500/20 rounded-xl items-center justify-center mr-3">
          <Text className="text-lg">📢</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-base font-semibold">{notification.title}</Text>
          <Text className="text-dark-300 text-sm mt-1.5 leading-5">
            {notification.message}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-dark-500 text-xs">
              {timeAgo(notification.created_at)}
            </Text>
            {notification.creator && (
              <>
                <Text className="text-dark-600 mx-2">•</Text>
                <Text className="text-dark-500 text-xs">
                  {(notification.creator as any)?.name}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
