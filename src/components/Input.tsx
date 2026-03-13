import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerClassName = '',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-dark-300 text-sm font-medium mb-1.5">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-dark-800 rounded-xl px-4 border-2 ${
          error
            ? 'border-red-500'
            : isFocused
            ? 'border-primary-500'
            : 'border-dark-700'
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-white py-3.5 text-base"
          placeholderTextColor="#64748B"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} className="ml-2 p-1">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-400 text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
