import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AuthStackParamList } from '../../types';
import Toast from 'react-native-toast-message';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await signUp(email.trim(), password, name.trim());
      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: 'Welcome to Solus!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Something went wrong',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary-600 rounded-3xl items-center justify-center mb-5 shadow-lg">
              <Text className="text-white text-3xl font-bold">S</Text>
            </View>
            <Text className="text-white text-3xl font-bold">Create Account</Text>
            <Text className="text-dark-400 text-base mt-2">
              Join your university's digital library
            </Text>
          </View>

          {/* Form */}
          <View>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              icon={<Text className="text-dark-400">👤</Text>}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Text className="text-dark-400">✉️</Text>}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon={<Text className="text-dark-400">🔒</Text>}
              rightIcon={
                <Text className="text-dark-400">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              icon={<Text className="text-dark-400">🔒</Text>}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              className="mt-4"
            />
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-dark-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-primary-400 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
