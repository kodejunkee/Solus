import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { courseService } from '../../services/courseService';
import { Course, StudentStackParamList } from '../../types';
import { CourseCard } from '../../components/CourseCard';
import { SearchBar, Header } from '../../components/ui';
import { Button } from '../../components/Button';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';
import { Text } from 'react-native';

export function CoursesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registeredCourseIds, setRegisteredCourseIds] = useState<Set<string>>(new Set());
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [allCourses, registrations] = await Promise.all([
        search ? courseService.searchCourses(search) : courseService.getAllCourses(),
        user ? courseService.getStudentRegistrations(user.id) : Promise.resolve([]),
      ]);
      setCourses(allCourses);
      setRegisteredCourseIds(new Set(registrations.map((r) => r.course_id)));
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load courses' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRegister = async (courseId: string) => {
    if (!user) return;
    setRegisteringId(courseId);
    try {
      await courseService.registerForCourse(user.id, courseId);
      setRegisteredCourseIds((prev) => new Set(prev).add(courseId));
      Toast.show({ type: 'success', text1: 'Registered successfully!' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: error.message });
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <Header title="Browse Courses" subtitle="Find and register for courses" />
      <View className="px-5 mb-3">
        <SearchBar
          placeholder="Search courses..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchData}
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={
          <EmptyState icon="📚" title="No courses found" message="Try a different search term" />
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
            actionButton={
              registeredCourseIds.has(item.id) ? (
                <View className="bg-accent-600/20 rounded-lg px-3 py-1.5">
                  <Text className="text-accent-400 text-xs font-semibold">Registered ✓</Text>
                </View>
              ) : (
                <Button
                  title="Register"
                  size="sm"
                  onPress={() => handleRegister(item.id)}
                  loading={registeringId === item.id}
                />
              )
            }
          />
        )}
      />
    </View>
  );
}
