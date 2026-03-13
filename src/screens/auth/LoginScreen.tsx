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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    try {
      await signIn(email.trim(), password);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Invalid credentials',
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
            <Text className="text-white text-3xl font-bold">Welcome Back</Text>
            <Text className="text-dark-400 text-base mt-2">
              Sign in to access your library
            </Text>
          </View>

          {/* Form */}
          <View>
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
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon={<Text className="text-dark-400">🔒</Text>}
              rightIcon={
                <Text className="text-dark-400">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              className="mt-4"
            />
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-dark-400">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-primary-400 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
