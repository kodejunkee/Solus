import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { courseService } from '../../services/courseService';
import { Course, InstructorStackParamList } from '../../types';
import { CourseCard } from '../../components/CourseCard';
import { Header } from '../../components/ui';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function InstructorCoursesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<InstructorStackParamList>>();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await courseService.getInstructorCourses(user.id);
      setCourses(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load courses' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <Header title="My Courses" subtitle={`${courses.length} assigned courses`} />
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={
          <EmptyState icon="📖" title="No courses assigned" message="Contact your admin to get courses assigned to you" />
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
            showInstructor={false}
          />
        )}
      />
    </View>
  );
}
