import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { StudentHomeScreen } from '../screens/student/HomeScreen';
import { CoursesScreen } from '../screens/student/CoursesScreen';
import { MyCoursesScreen } from '../screens/student/MyCoursesScreen';
import { StudentCourseDetailScreen } from '../screens/student/CourseDetailScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { StudentTabParamList, StudentStackParamList } from '../types';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

function StudentTabs() {
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
        component={StudentHomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="MyCourses"
        component={MyCoursesScreen}
        options={{
          title: 'My Courses',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📖</Text>,
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

export function StudentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#020617' },
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen
        name="CourseDetail"
        component={StudentCourseDetailScreen}
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
