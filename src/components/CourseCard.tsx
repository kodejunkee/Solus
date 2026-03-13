import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  showInstructor?: boolean;
  showStats?: boolean;
  actionButton?: React.ReactNode;
}

function getInstructorNames(course: Course): string {
  if (!course.instructors || course.instructors.length === 0) return 'Unassigned';
  return course.instructors
    .map((ci) => (ci.instructor as any)?.name || 'Unknown')
    .join(', ');
}

export function CourseCard({
  course,
  onPress,
  showInstructor = true,
  showStats = true,
  actionButton,
}: CourseCardProps) {
  return (
    <TouchableOpacity
      className="bg-dark-800 border border-dark-700 rounded-2xl p-4 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <View className="bg-primary-600/20 rounded-lg px-2.5 py-1 mr-2">
              <Text className="text-primary-400 text-xs font-bold">
                {course.course_code}
              </Text>
            </View>
          </View>
          <Text className="text-white text-base font-semibold mt-1.5" numberOfLines={2}>
            {course.course_title}
          </Text>
          {showInstructor && (
            <Text className="text-dark-400 text-sm mt-1" numberOfLines={1}>
              👤 {getInstructorNames(course)}
            </Text>
          )}
        </View>
        {actionButton}
      </View>

      {showStats && (
        <View className="flex-row mt-3 pt-3 border-t border-dark-700">
          <View className="flex-row items-center mr-5">
            <Text className="text-dark-400 text-xs">
              👥 {course.student_count} students
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-dark-400 text-xs">
              📁 {course.material_count} materials
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
