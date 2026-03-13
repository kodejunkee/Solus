import './global.css';
import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { RootNavigator } from './src/navigation/RootNavigator';

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead.",
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
      <Toast position="top" topOffset={60} />
    </SafeAreaProvider>
  );
}
