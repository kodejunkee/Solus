import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { courseService } from '../../services/courseService';
import { CourseRegistration, StudentStackParamList } from '../../types';
import { CourseCard } from '../../components/CourseCard';
import { Header } from '../../components/ui';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { Button } from '../../components/Button';
import Toast from 'react-native-toast-message';

export function MyCoursesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { user } = useAuthStore();
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await courseService.getStudentRegistrations(user.id);
      setRegistrations(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load your courses' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <Header title="My Courses" subtitle={`${registrations.length} registered courses`} />
      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={
          <EmptyState
            icon="📖"
            title="No courses yet"
            message="Register for courses to see them here"
            action={
              <Button
                title="Browse Courses"
                onPress={() => {}}
                variant="outline"
              />
            }
          />
        }
        renderItem={({ item }) =>
          item.course ? (
            <CourseCard
              course={item.course}
              onPress={() => navigation.navigate('CourseDetail', { courseId: item.course_id })}
            />
          ) : null
        }
      />
    </View>
  );
}
