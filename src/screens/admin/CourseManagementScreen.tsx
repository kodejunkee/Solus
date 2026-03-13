import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { courseService } from '../../services/courseService';
import { Course, User, CourseInstructor } from '../../types';
import { CourseCard } from '../../components/CourseCard';
import { Header, Avatar, Badge } from '../../components/ui';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function CourseManagementScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create course modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Manage instructors modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentInstructors, setCurrentInstructors] = useState<CourseInstructor[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<User[]>([]);
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load courses' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateCourse = async () => {
    if (!courseCode.trim() || !courseTitle.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }
    setCreating(true);
    try {
      await courseService.createCourse(courseCode.trim().toUpperCase(), courseTitle.trim());
      Toast.show({ type: 'success', text1: 'Course created!' });
      setShowCreateModal(false);
      setCourseCode('');
      setCourseTitle('');
      fetchData();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed to create course', text2: error.message });
    } finally {
      setCreating(false);
    }
  };

  const openManageModal = async (course: Course) => {
    setSelectedCourse(course);
    setShowManageModal(true);
    try {
      const [instructorsList, courseInstructors] = await Promise.all([
        courseService.getInstructors(),
        courseService.getCourseInstructors(course.id),
      ]);
      setCurrentInstructors(courseInstructors);
      // Filter out already-assigned instructors
      const assignedIds = new Set(courseInstructors.map((ci) => ci.instructor_id));
      setAvailableInstructors(instructorsList.filter((i) => !assignedIds.has(i.id)));
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load instructors' });
    }
  };

  const handleAssign = async (instructorId: string) => {
    if (!selectedCourse) return;
    setAssigning(true);
    try {
      await courseService.assignInstructor(selectedCourse.id, instructorId);
      Toast.show({ type: 'success', text1: 'Instructor assigned!' });
      // Refresh modal data
      await openManageModal(selectedCourse);
      fetchData();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to assign instructor' });
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = (ci: CourseInstructor) => {
    const instructorName = (ci.instructor as any)?.name || 'this instructor';
    Alert.alert(
      'Unassign Instructor',
      `Remove ${instructorName} from this course?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: async () => {
            try {
              await courseService.unassignInstructor(ci.course_id, ci.instructor_id);
              Toast.show({ type: 'success', text1: 'Instructor unassigned' });
              if (selectedCourse) await openManageModal(selectedCourse);
              fetchData();
            } catch {
              Toast.show({ type: 'error', text1: 'Failed to unassign' });
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <Header
        title="Course Management"
        subtitle={`${courses.length} courses`}
        rightAction={
          <Button title="+ New" size="sm" onPress={() => setShowCreateModal(true)} />
        }
      />
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        ListEmptyComponent={<EmptyState icon="📚" title="No courses" message="Create your first course" />}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => openManageModal(item)}
            actionButton={
              <Button
                title="👨‍🏫"
                size="sm"
                variant="outline"
                onPress={() => openManageModal(item)}
              />
            }
          />
        )}
      />

      {/* Create Course Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-dark-900 rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-6">Create Course</Text>
            <Input
              label="Course Code"
              placeholder="e.g. CSC401"
              value={courseCode}
              onChangeText={setCourseCode}
              autoCapitalize="characters"
            />
            <Input
              label="Course Title"
              placeholder="e.g. Computer Architecture"
              value={courseTitle}
              onChangeText={setCourseTitle}
            />
            <View className="flex-row gap-3 mt-2">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowCreateModal(false)}
                className="flex-1"
              />
              <Button
                title="Create"
                onPress={handleCreateCourse}
                loading={creating}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Manage Instructors Modal */}
      <Modal visible={showManageModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-dark-900 rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-white text-xl font-bold mb-1">Manage Instructors</Text>
            <Text className="text-dark-400 text-sm mb-4">
              {selectedCourse?.course_code} — {selectedCourse?.course_title}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Current Instructors */}
              <Text className="text-white text-base font-semibold mb-2">
                Current Instructors ({currentInstructors.length})
              </Text>
              {currentInstructors.length === 0 ? (
                <Text className="text-dark-500 text-sm mb-4 italic">No instructors assigned</Text>
              ) : (
                currentInstructors.map((ci) => (
                  <View
                    key={ci.id}
                    className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl p-3 mb-2"
                  >
                    <Avatar name={(ci.instructor as any)?.name || '?'} size="sm" />
                    <View className="flex-1 ml-3">
                      <Text className="text-white text-sm font-semibold">{(ci.instructor as any)?.name}</Text>
                      <Text className="text-dark-400 text-xs">{(ci.instructor as any)?.email}</Text>
                    </View>
                    <Button
                      title="✕"
                      size="sm"
                      variant="danger"
                      onPress={() => handleUnassign(ci)}
                    />
                  </View>
                ))
              )}

              {/* Available Instructors */}
              <Text className="text-white text-base font-semibold mt-4 mb-2">
                Available Instructors ({availableInstructors.length})
              </Text>
              {availableInstructors.length === 0 ? (
                <Text className="text-dark-500 text-sm mb-4 italic">
                  {currentInstructors.length > 0
                    ? 'All instructors are assigned'
                    : 'No instructors available. Promote a student first.'}
                </Text>
              ) : (
                availableInstructors.map((inst) => (
                  <TouchableOpacity
                    key={inst.id}
                    className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl p-3 mb-2"
                    onPress={() => handleAssign(inst.id)}
                    disabled={assigning}
                  >
                    <Avatar name={inst.name} size="sm" />
                    <View className="flex-1 ml-3">
                      <Text className="text-white text-sm font-semibold">{inst.name}</Text>
                      <Text className="text-dark-400 text-xs">{inst.email}</Text>
                    </View>
                    <Badge label="+ Assign" variant="primary" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Button
              title="Done"
              variant="secondary"
              onPress={() => setShowManageModal(false)}
              className="mt-3"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
