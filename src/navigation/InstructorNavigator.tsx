import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { InstructorHomeScreen } from '../screens/instructor/HomeScreen';
import { InstructorCoursesScreen } from '../screens/instructor/MyCoursesScreen';
import { InstructorCourseDetailScreen } from '../screens/instructor/CourseDetailScreen';
import { InstructorAnalyticsScreen } from '../screens/instructor/AnalyticsScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { InstructorTabParamList, InstructorStackParamList } from '../types';

const Tab = createBottomTabNavigator<InstructorTabParamList>();
const Stack = createNativeStackNavigator<InstructorStackParamList>();

function InstructorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={InstructorHomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="MyCourses"
        component={InstructorCoursesScreen}
        options={{
          title: 'My Courses',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={InstructorAnalyticsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export function InstructorNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#020617' },
      }}
    >
      <Stack.Screen name="InstructorTabs" component={InstructorTabs} />
      <Stack.Screen
        name="CourseDetail"
        component={InstructorCourseDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Course Details',
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
