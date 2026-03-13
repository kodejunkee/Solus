import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, RefreshControl, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { courseService } from '../../services/courseService';
import { fileService } from '../../services/fileService';
import { Course, Material, InstructorStackParamList } from '../../types';
import { MaterialItem } from '../../components/MaterialItem';
import { Header, Badge } from '../../components/ui';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function InstructorCourseDetailScreen() {
  const route = useRoute<RouteProp<InstructorStackParamList, 'CourseDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<InstructorStackParamList>>();
  const { user } = useAuthStore();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [courseData, materialsData] = await Promise.all([
        courseService.getCourseById(courseId),
        courseService.getCourseMaterials(courseId),
      ]);
      setCourse(courseData);
      setMaterials(materialsData);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load course' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async () => {
    if (!user || !course) return;

    const file = await fileService.pickDocument();
    if (!file) return;

    setUploading(true);
    try {
      await fileService.uploadMaterial(
        courseId,
        course.course_code,
        file.name,
        user.id,
        file
      );
      Toast.show({ type: 'success', text1: 'Material uploaded!' });
      fetchData();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (material: Material) => {
    Alert.alert(
      'Delete Material',
      `Are you sure you want to delete "${material.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await courseService.deleteMaterial(material.id, material.file_url);
              Toast.show({ type: 'success', text1: 'Material deleted' });
              fetchData();
            } catch {
              Toast.show({ type: 'error', text1: 'Failed to delete' });
            }
          },
        },
      ]
    );
  };

  if (loading || !course) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Course Info */}
        <View className="px-5 pt-4">
          <Card>
            <View className="flex-row items-center mb-2">
              <Badge label={course.course_code} variant="primary" />
            </View>
            <Text className="text-white text-xl font-bold mt-2">{course.course_title}</Text>
            <View className="flex-row mt-3 pt-3 border-t border-dark-700">
              <Text className="text-dark-400 text-sm mr-5">
                👥 {course.student_count} students
              </Text>
              <Text className="text-dark-400 text-sm">
                📁 {course.material_count} materials
              </Text>
            </View>
          </Card>
        </View>

        {/* Upload Button */}
        <View className="px-5 mt-4">
          <Button
            title="📤  Upload Material"
            onPress={handleUpload}
            loading={uploading}
          />
        </View>

        {/* Materials */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-white text-lg font-bold mb-3">📚 Course Materials</Text>
          {materials.length === 0 ? (
            <EmptyState
              icon="📂"
              title="No materials yet"
              message="Upload materials for your students"
            />
          ) : (
            materials.map((m) => (
              <MaterialItem
                key={m.id}
                material={m}
                isDownloaded={false}
                onDownload={() => {}}
                onOpen={() => {}}
                onDelete={
                  m.uploaded_by === user?.id
                    ? () => handleDelete(m)
                    : undefined
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
