import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../constants/supabase';
import { Material } from '../types';
import { getFileTypeFromExtension } from '../utils/formatting';

const DOWNLOAD_DIR = FileSystem.documentDirectory + 'solus_downloads/';

async function ensureDownloadDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

export const fileService = {
  async pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/*',
        'application/zip',
        'application/x-rar-compressed',
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return null;
    return result.assets[0];
  },

  async uploadMaterial(
    courseId: string,
    courseCode: string,
    title: string,
    uploadedBy: string,
    file: { uri: string; name: string; size?: number; mimeType?: string }
  ): Promise<Material> {
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${Date.now()}_${file.name}`;
    const storagePath = `${courseCode}/${fileName}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(storagePath, decode(base64), {
        contentType: file.mimeType || 'application/octet-stream',
      });
    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-materials')
      .getPublicUrl(storagePath);

    // Insert material record
    const { data: material, error: insertError } = await supabase
      .from('materials')
      .insert({
        course_id: courseId,
        title,
        file_url: urlData.publicUrl,
        file_type: getFileTypeFromExtension(file.name),
        file_size: file.size || 0,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();
    if (insertError) throw insertError;

    // Increment material count
    await supabase.rpc('increment_counter', {
      row_id: courseId,
      table_name: 'courses',
      column_name: 'material_count',
    });

    return material;
  },

  async downloadMaterial(material: Material): Promise<string> {
    await ensureDownloadDir();

    const fileName = `${material.id}_${material.title.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const ext = material.file_url.split('.').pop()?.split('?')[0] || 'bin';
    const localPath = DOWNLOAD_DIR + `${fileName}.${ext}`;

    // Check if already downloaded
    const info = await FileSystem.getInfoAsync(localPath);
    if (info.exists) return localPath;

    // Download
    const downloadResult = await FileSystem.downloadAsync(
      material.file_url,
      localPath
    );

    if (downloadResult.status !== 200) {
      throw new Error('Download failed');
    }

    // Increment download count
    await supabase.rpc('increment_counter', {
      row_id: material.id,
      table_name: 'materials',
      column_name: 'download_count',
    });

    return localPath;
  },

  async getLocalFilePath(material: Material): Promise<string | null> {
    await ensureDownloadDir();

    const fileName = `${material.id}_${material.title.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const ext = material.file_url.split('.').pop()?.split('?')[0] || 'bin';
    const localPath = DOWNLOAD_DIR + `${fileName}.${ext}`;

    const info = await FileSystem.getInfoAsync(localPath);
    return info.exists ? localPath : null;
  },

  async openFile(localPath: string) {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(localPath);
  },

  async deleteLocalFile(material: Material) {
    const localPath = await this.getLocalFilePath(material);
    if (localPath) {
      await FileSystem.deleteAsync(localPath, { idempotent: true });
    }
  },
};

// Helper: decode base64 to Uint8Array for Supabase Storage
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
