// ─── User Types ─────────────────────────────────────
export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  user_code: string;
  push_token?: string | null;
  created_at: string;
}

// ─── Course Types ───────────────────────────────────
export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  student_count: number;
  material_count: number;
  created_at: string;
  // Joined fields
  instructors?: CourseInstructor[];
}

export interface CourseInstructor {
  id: string;
  course_id: string;
  instructor_id: string;
  assigned_at: string;
  // Joined
  instructor?: User;
}

// ─── Course Registration Types ──────────────────────
export interface CourseRegistration {
  id: string;
  student_id: string;
  course_id: string;
  registered_at: string;
  // Joined fields
  course?: Course;
}

// ─── Material Types ─────────────────────────────────
export type FileType = 'pdf' | 'docx' | 'ppt' | 'pptx' | 'image' | 'zip' | 'other';

export interface Material {
  id: string;
  course_id: string;
  title: string;
  file_url: string;
  file_type: FileType;
  file_size: number;
  uploaded_by: string;
  download_count: number;
  created_at: string;
  // Joined fields
  uploader?: User;
  course?: Course;
}

// ─── Notification Types ─────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  created_by: string;
  created_at: string;
  // Joined fields
  creator?: User;
}

// ─── Analytics Types ────────────────────────────────
export interface PlatformAnalytics {
  total_users: number;
  total_students: number;
  total_instructors: number;
  total_courses: number;
  total_materials: number;
  total_downloads: number;
}

export interface InstructorAnalytics {
  total_courses: number;
  total_students: number;
  total_materials: number;
  total_downloads: number;
}

// ─── Navigation Types ───────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type StudentTabParamList = {
  Home: undefined;
  Courses: undefined;
  MyCourses: undefined;
  Profile: undefined;
};

export type InstructorTabParamList = {
  Home: undefined;
  MyCourses: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Courses: undefined;
  Announcements: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  StudentTabs: undefined;
  CourseDetail: { courseId: string };
};

export type InstructorStackParamList = {
  InstructorTabs: undefined;
  CourseDetail: { courseId: string };
  UploadMaterial: { courseId: string };
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  CreateCourse: undefined;
  AssignInstructor: { courseId: string };
  UserDetail: { userId: string };
};
