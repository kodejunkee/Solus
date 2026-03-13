import { supabase } from '../constants/supabase';
import { PlatformAnalytics, InstructorAnalytics } from '../types';

export const analyticsService = {
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    // Fetch from analytics_counters table
    const { data, error } = await supabase
      .from('analytics_counters')
      .select('key, value');
    if (error) throw error;

    const counters: Record<string, number> = {};
    (data || []).forEach((row: { key: string; value: number }) => {
      counters[row.key] = row.value;
    });

    return {
      total_users: counters['total_users'] || 0,
      total_students: counters['total_students'] || 0,
      total_instructors: counters['total_instructors'] || 0,
      total_courses: counters['total_courses'] || 0,
      total_materials: counters['total_materials'] || 0,
      total_downloads: counters['total_downloads'] || 0,
    };
  },

  async getInstructorAnalytics(instructorId: string): Promise<InstructorAnalytics> {
    // Get course IDs from junction table
    const { data: assignments, error: aErr } = await supabase
      .from('course_instructors')
      .select('course_id')
      .eq('instructor_id', instructorId);
    if (aErr) throw aErr;

    if (!assignments || assignments.length === 0) {
      return { total_courses: 0, total_students: 0, total_materials: 0, total_downloads: 0 };
    }

    const courseIds = assignments.map((a) => a.course_id);

    // Get course stats
    const { data: courses, error: cErr } = await supabase
      .from('courses')
      .select('id, student_count, material_count')
      .in('id', courseIds);
    if (cErr) throw cErr;

    let totalStudents = 0;
    let totalMaterials = 0;

    (courses || []).forEach((c) => {
      totalStudents += c.student_count || 0;
      totalMaterials += c.material_count || 0;
    });

    // Get total downloads for instructor's materials
    let totalDownloads = 0;
    if (courseIds.length > 0) {
      const { data: materials, error: mErr } = await supabase
        .from('materials')
        .select('download_count')
        .in('course_id', courseIds);
      if (mErr) throw mErr;

      (materials || []).forEach((m) => {
        totalDownloads += m.download_count || 0;
      });
    }

    return {
      total_courses: courseIds.length,
      total_students: totalStudents,
      total_materials: totalMaterials,
      total_downloads: totalDownloads,
    };
  },
};
