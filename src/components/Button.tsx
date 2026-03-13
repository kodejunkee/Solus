import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  className = '',
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-xl';

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3.5',
    lg: 'px-8 py-4',
  };

  const variantClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-dark-700',
    danger: 'bg-red-500',
    outline: 'border-2 border-primary-600 bg-transparent',
    ghost: 'bg-transparent',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    danger: 'text-white',
    outline: 'text-primary-600',
    ghost: 'text-primary-600',
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled || loading ? 'opacity-50' : ''
      } ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#4F46E5' : '#fff'}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            className={`font-semibold ${textSizeClasses[size]} ${textVariantClasses[variant]} ${
              icon ? 'ml-2' : ''
            }`}
            style={textStyle}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
