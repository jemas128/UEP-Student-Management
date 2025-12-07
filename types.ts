export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'pending';
  avatar?: string;
  studentId?: string; // Only for students
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

export interface Grade {
  id?: string; // Added for management
  courseId: string; // Code like CS101
  courseName: string;
  grade: string; // A, B, C, or 1.0, 1.25 etc
  score: number;
  semester: string;
}

export interface StudentProfile extends User {
  program: string;
  yearLevel: number;
  gpa: number;
  grades: Grade[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}