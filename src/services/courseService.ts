import { supabase } from '../constants/supabase';
import { Course, CourseRegistration, Material, User, CourseInstructor } from '../types';

export const courseService = {
  // ─── Courses ──────────────────────────────────────
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructors:course_instructors(id, course_id, instructor_id, assigned_at, instructor:users!instructor_id(id, name, email, user_code))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async searchCourses(query: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructors:course_instructors(id, course_id, instructor_id, assigned_at, instructor:users!instructor_id(id, name, email, user_code))')
      .or(`course_code.ilike.%${query}%,course_title.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getCourseById(courseId: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructors:course_instructors(id, course_id, instructor_id, assigned_at, instructor:users!instructor_id(id, name, email, user_code))')
      .eq('id', courseId)
      .single();
    if (error) throw error;
    return data;
  },

  async createCourse(courseCode: string, courseTitle: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert({ course_code: courseCode, course_title: courseTitle })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ─── Instructor Assignment ────────────────────────
  async assignInstructor(courseId: string, instructorId: string) {
    const { error } = await supabase
      .from('course_instructors')
      .insert({ course_id: courseId, instructor_id: instructorId });
    if (error) throw error;
  },

  async unassignInstructor(courseId: string, instructorId: string) {
    const { error } = await supabase
      .from('course_instructors')
      .delete()
      .eq('course_id', courseId)
      .eq('instructor_id', instructorId);
    if (error) throw error;
  },

  async getCourseInstructors(courseId: string): Promise<CourseInstructor[]> {
    const { data, error } = await supabase
      .from('course_instructors')
      .select('*, instructor:users!instructor_id(id, name, email, user_code)')
      .eq('course_id', courseId)
      .order('assigned_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // ─── Course Registrations ────────────────────────
  async getStudentRegistrations(studentId: string): Promise<CourseRegistration[]> {
    const { data, error } = await supabase
      .from('course_registrations')
      .select('*, course:courses(*, instructors:course_instructors(id, instructor_id, instructor:users!instructor_id(id, name)))')
      .eq('student_id', studentId)
      .order('registered_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async isStudentRegistered(studentId: string, courseId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('course_registrations')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async registerForCourse(studentId: string, courseId: string) {
    const { error } = await supabase
      .from('course_registrations')
      .insert({ student_id: studentId, course_id: courseId });
    if (error) throw error;

    // Increment counter
    await supabase.rpc('increment_counter', {
      row_id: courseId,
      table_name: 'courses',
      column_name: 'student_count',
    });
  },

  async unregisterFromCourse(studentId: string, courseId: string) {
    const { error } = await supabase
      .from('course_registrations')
      .delete()
      .eq('student_id', studentId)
      .eq('course_id', courseId);
    if (error) throw error;

    await supabase.rpc('decrement_counter', {
      row_id: courseId,
      table_name: 'courses',
      column_name: 'student_count',
    });
  },

  // ─── Materials ────────────────────────────────────
  async getCourseMaterials(courseId: string): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*, uploader:users!uploaded_by(id, name)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getRecentMaterials(studentId: string, limit: number = 10): Promise<Material[]> {
    // Get courses the student is registered for
    const { data: regs, error: regError } = await supabase
      .from('course_registrations')
      .select('course_id')
      .eq('student_id', studentId);
    if (regError) throw regError;

    if (!regs || regs.length === 0) return [];

    const courseIds = regs.map((r) => r.course_id);

    const { data, error } = await supabase
      .from('materials')
      .select('*, course:courses(course_code, course_title), uploader:users!uploaded_by(id, name)')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async deleteMaterial(materialId: string, fileUrl: string) {
    // Delete from storage
    const path = fileUrl.split('/course-materials/')[1];
    if (path) {
      await supabase.storage.from('course-materials').remove([path]);
    }

    // Delete record
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId);
    if (error) throw error;
  },

  async incrementDownloadCount(materialId: string) {
    await supabase.rpc('increment_counter', {
      row_id: materialId,
      table_name: 'materials',
      column_name: 'download_count',
    });
  },

  // ─── Instructor Courses ──────────────────────────
  async getInstructorCourses(instructorId: string): Promise<Course[]> {
    // Get course IDs from junction table
    const { data: assignments, error: aErr } = await supabase
      .from('course_instructors')
      .select('course_id')
      .eq('instructor_id', instructorId);
    if (aErr) throw aErr;

    if (!assignments || assignments.length === 0) return [];

    const courseIds = assignments.map((a) => a.course_id);

    const { data, error } = await supabase
      .from('courses')
      .select('*, instructors:course_instructors(id, instructor_id, instructor:users!instructor_id(id, name))')
      .in('id', courseIds)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // ─── Admin: Users ────────────────────────────────
  async getAllUsers(searchQuery?: string): Promise<User[]> {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,user_code.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateUserRole(userId: string, newRole: 'student' | 'instructor') {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);
    if (error) throw error;
  },

  async getInstructors(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'instructor')
      .order('name');
    if (error) throw error;
    return data || [];
  },
};
