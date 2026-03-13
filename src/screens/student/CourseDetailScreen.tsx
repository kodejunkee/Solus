import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { courseService } from '../../services/courseService';
import { fileService } from '../../services/fileService';
import { Course, Material, StudentStackParamList } from '../../types';
import { MaterialItem } from '../../components/MaterialItem';
import { Header, Badge } from '../../components/ui';
import { Card } from '../../components/Card';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import Toast from 'react-native-toast-message';

export function StudentCourseDetailScreen() {
  const route = useRoute<RouteProp<StudentStackParamList, 'CourseDetail'>>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [courseData, materialsData] = await Promise.all([
        courseService.getCourseById(courseId),
        courseService.getCourseMaterials(courseId),
      ]);
      setCourse(courseData);
      setMaterials(materialsData);

      // Check downloaded
      const downloaded = new Set<string>();
      for (const m of materialsData) {
        const localPath = await fileService.getLocalFilePath(m);
        if (localPath) downloaded.add(m.id);
      }
      setDownloadedIds(downloaded);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load course' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownload = async (material: Material) => {
    setDownloadingId(material.id);
    try {
      await fileService.downloadMaterial(material);
      setDownloadedIds((prev) => new Set(prev).add(material.id));
      Toast.show({ type: 'success', text1: 'Downloaded!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Download failed' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpen = async (material: Material) => {
    try {
      const localPath = await fileService.getLocalFilePath(material);
      if (localPath) {
        await fileService.openFile(localPath);
      } else {
        Toast.show({
          type: 'error',
          text1: 'File missing',
          text2: 'This file is missing. Please download it again.',
        });
        setDownloadedIds((prev) => {
          const next = new Set(prev);
          next.delete(material.id);
          return next;
        });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open file' });
    }
  };

  if (loading || !course) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
        }
      >
        {/* Course Info */}
        <View className="px-5 pt-4">
          <Card>
            <View className="flex-row items-center mb-2">
              <Badge label={course.course_code} variant="primary" />
            </View>
            <Text className="text-white text-xl font-bold mt-2">{course.course_title}</Text>
            {course.instructors && course.instructors.length > 0 && (
              <Text className="text-dark-300 text-sm mt-2">
                👤 {course.instructors.map((ci) => (ci.instructor as any)?.name).filter(Boolean).join(', ')}
              </Text>
            )}
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

        {/* Materials */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-white text-lg font-bold mb-3">📚 Course Materials</Text>
          {materials.length === 0 ? (
            <EmptyState
              icon="📂"
              title="No materials yet"
              message="Materials will appear here when your instructor uploads them"
            />
          ) : (
            materials.map((m) => (
              <MaterialItem
                key={m.id}
                material={m}
                isDownloaded={downloadedIds.has(m.id)}
                isDownloading={downloadingId === m.id}
                onDownload={() => handleDownload(m)}
                onOpen={() => handleOpen(m)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
