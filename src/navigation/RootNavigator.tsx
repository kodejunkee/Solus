import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { EventSubscription } from 'expo-notifications';
import { useAuthStore } from '../stores/authStore';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { InstructorNavigator } from './InstructorNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoadingScreen } from '../components/LoadingScreen';
import {
  configurePushNotifications,
  registerForPushNotifications,
  addNotificationResponseListener,
} from '../services/pushService';

// Configure notification presentation once at module level
configurePushNotifications();

export function RootNavigator() {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();
  const responseListenerRef = useRef<EventSubscription | null>(null);

  // Initialise auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Register for push notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      registerForPushNotifications(user.id);
    }
  }, [user?.id]);

  // Handle notification taps
  useEffect(() => {
    responseListenerRef.current = addNotificationResponseListener((_response) => {
      // MVP: notification tap simply foregrounds the app.
      // Future: read _response.notification.request.content.data to navigate.
    });

    return () => {
      responseListenerRef.current?.remove();
    };
  }, []);

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  const getAppNavigator = () => {
    if (!user) return <AuthNavigator />;

    switch (user.role) {
      case 'admin':
        return <AdminNavigator />;
      case 'instructor':
        return <InstructorNavigator />;
      case 'student':
      default:
        return <StudentNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {getAppNavigator()}
    </NavigationContainer>
  );
}
