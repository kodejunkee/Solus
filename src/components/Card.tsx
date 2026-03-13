import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <View
      className={`bg-dark-800 border border-dark-700 rounded-2xl p-4 ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  gradient?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon, className = '' }: StatsCardProps) {
  return (
    <View className={`bg-dark-800 border border-dark-700 rounded-2xl p-4 flex-1 min-w-[45%] ${className}`}>
      <View className="flex-row items-center justify-between mb-2">
        {icon && <Text className="text-2xl">{icon}</Text>}
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-dark-400 text-sm mt-1">{title}</Text>
    </View>
  );
}
