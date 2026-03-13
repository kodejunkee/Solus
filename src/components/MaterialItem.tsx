import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Material } from '../types';
import { formatFileSize, getFileTypeIcon, timeAgo } from '../utils/formatting';

interface MaterialItemProps {
  material: Material;
  onDownload: () => void;
  onOpen: () => void;
  isDownloaded: boolean;
  isDownloading?: boolean;
  onDelete?: () => void;
  showCourse?: boolean;
}

export function MaterialItem({
  material,
  onDownload,
  onOpen,
  isDownloaded,
  isDownloading = false,
  onDelete,
  showCourse = false,
}: MaterialItemProps) {
  return (
    <View className="bg-dark-800 border border-dark-700 rounded-2xl p-4 mb-3">
      <View className="flex-row items-start">
        <View className="w-10 h-10 bg-primary-600/20 rounded-xl items-center justify-center mr-3">
          <Text className="text-lg">{getFileTypeIcon(material.file_type)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-sm font-semibold" numberOfLines={2}>
            {material.title}
          </Text>
          {showCourse && material.course && (
            <Text className="text-primary-400 text-xs mt-0.5">
              {(material.course as any)?.course_code}
            </Text>
          )}
          <View className="flex-row items-center mt-1">
            <Text className="text-dark-400 text-xs">
              {formatFileSize(material.file_size)}
            </Text>
            <Text className="text-dark-600 mx-2">•</Text>
            <Text className="text-dark-400 text-xs">
              {timeAgo(material.created_at)}
            </Text>
            <Text className="text-dark-600 mx-2">•</Text>
            <Text className="text-dark-400 text-xs">
              ⬇ {material.download_count}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row mt-3 pt-3 border-t border-dark-700">
        {isDownloaded ? (
          <TouchableOpacity
            className="flex-1 bg-accent-600/20 rounded-xl py-2.5 items-center mr-2"
            onPress={onOpen}
          >
            <Text className="text-accent-400 text-sm font-semibold">📂 Open File</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="flex-1 bg-primary-600/20 rounded-xl py-2.5 items-center mr-2"
            onPress={onDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator color="#818CF8" size="small" />
            ) : (
              <Text className="text-primary-400 text-sm font-semibold">⬇ Download</Text>
            )}
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            className="bg-red-500/20 rounded-xl py-2.5 px-4 items-center"
            onPress={onDelete}
          >
            <Text className="text-red-400 text-sm font-semibold">🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
