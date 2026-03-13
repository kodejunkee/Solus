import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface SearchBarProps extends TextInputProps {
  containerClassName?: string;
}

export function SearchBar({ containerClassName = '', ...props }: SearchBarProps) {
  return (
    <View className={`bg-dark-800 border border-dark-700 rounded-xl flex-row items-center px-4 ${containerClassName}`}>
      <Text className="text-dark-400 mr-2">🔍</Text>
      <TextInput
        className="flex-1 text-white py-3 text-base"
        placeholderTextColor="#64748B"
        {...props}
      />
    </View>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function Header({ title, subtitle, rightAction }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
      <View className="flex-1">
        <Text className="text-white text-2xl font-bold">{title}</Text>
        {subtitle && (
          <Text className="text-dark-400 text-sm mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightAction}
    </View>
  );
}

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ label, variant = 'primary', className = '' }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary-600/20',
    success: 'bg-emerald-500/20',
    warning: 'bg-amber-500/20',
    danger: 'bg-red-500/20',
    info: 'bg-sky-500/20',
  };

  const textVariantClasses = {
    primary: 'text-primary-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-sky-400',
  };

  return (
    <View className={`${variantClasses[variant]} rounded-full px-3 py-1 ${className}`}>
      <Text className={`${textVariantClasses[variant]} text-xs font-semibold uppercase`}>
        {label}
      </Text>
    </View>
  );
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <View
      className={`${sizeClasses[size]} bg-primary-600 rounded-full items-center justify-center ${className}`}
    >
      <Text className={`text-white ${textSizes[size]} font-bold`}>{initials}</Text>
    </View>
  );
}
