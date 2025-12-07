
import { User, StudentProfile, Grade, Notification, UserRole } from '../types';

const API_BASE = './api';

// Helper to handle API responses
async function handleResponse(response: Response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (!response.ok) {
      const error = (data && data.error) || response.statusText;
      throw new Error(error);
    }
    return data;
  } catch (e) {
    // If response isn't JSON, it's likely a PHP error or 404 HTML
    console.error("API Error:", text);
    throw new Error(text || response.statusText);
  }
}

// Map PHP snake_case to JS camelCase
const mapUserFromDB = (u: any): User | StudentProfile => {
  const base = {
    id: u.id.toString(),
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    status: u.status as 'active' | 'pending',
    avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=800000&color=fff`,
    studentId: u.student_id || undefined,
  };

  if (u.role === 'student') {
    return {
      ...base,
      program: u.program || '',
      yearLevel: parseInt(u.year_level || '1'),
      gpa: parseFloat(u.gpa || '0'),
      grades: Array.isArray(u.grades) ? u.grades.map(mapGradeFromDB) : []
    } as StudentProfile;
  }
  return base;
};

const mapGradeFromDB = (g: any): Grade => ({
  id: g.id.toString(),
  courseId: g.course_code,
  courseName: g.course_name,
  grade: g.grade,
  score: parseInt(g.score),
  semester: g.semester
});

const mapNotifFromDB = (n: any): Notification => ({
  id: n.id.toString(),
  title: n.title,
  message: n.message,
  date: n.created_at,
  isRead: n.is_read == 1,
  type: n.type
});

export const api = {
  // --- AUTH ---
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });
    const data = await handleResponse(res);
    return mapUserFromDB(data.user);
  },

  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name, email, password })
    });
    return await handleResponse(res);
  },

  // --- STUDENTS ---
  async getStudents() {
    const res = await fetch(`${API_BASE}/students.php`);
    const data = await handleResponse(res);
    return data.map(mapUserFromDB) as StudentProfile[];
  },

  async addStudent(student: Partial<StudentProfile>) {
    // Map JS to PHP fields
    const payload = {
      name: student.name,
      email: student.email,
      student_id: student.studentId,
      program: student.program,
      year_level: student.yearLevel,
      // Default password for manually created students
      password: 'uepstudent123' 
    };

    const res = await fetch(`${API_BASE}/students.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  async updateStudent(student: StudentProfile) {
    const payload = {
      id: student.id,
      name: student.name,
      email: student.email,
      student_id: student.studentId,
      program: student.program,
      year_level: student.yearLevel
    };
    
    const res = await fetch(`${API_BASE}/students.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  async deleteStudent(id: string) {
    const res = await fetch(`${API_BASE}/students.php?id=${id}`, {
      method: 'DELETE'
    });
    return await handleResponse(res);
  },

  async approveStudent(id: string) {
    const res = await fetch(`${API_BASE}/students.php`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'active' })
    });
    return await handleResponse(res);
  },

  // --- GRADES ---
  async getGrades(studentId: string) {
    const res = await fetch(`${API_BASE}/grades.php?student_id=${studentId}`);
    const data = await handleResponse(res);
    return data.map(mapGradeFromDB) as Grade[];
  },

  async addGrade(studentId: string, grade: Omit<Grade, 'id'>) {
    const payload = {
      student_id: studentId,
      course_code: grade.courseId,
      course_name: grade.courseName,
      grade: grade.grade,
      score: grade.score,
      semester: grade.semester
    };
    const res = await fetch(`${API_BASE}/grades.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  async updateGrade(grade: Grade) {
    const payload = {
      id: grade.id,
      course_code: grade.courseId,
      course_name: grade.courseName,
      grade: grade.grade,
      score: grade.score,
      semester: grade.semester
    };
    const res = await fetch(`${API_BASE}/grades.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  async deleteGrade(id: string) {
    const res = await fetch(`${API_BASE}/grades.php?id=${id}`, {
      method: 'DELETE'
    });
    return await handleResponse(res);
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications.php`);
    const data = await handleResponse(res);
    return data.map(mapNotifFromDB);
  },

  async addNotification(notif: {title: string, message: string, type: string}) {
    const res = await fetch(`${API_BASE}/notifications.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif)
    });
    return await handleResponse(res);
  },

  async deleteNotification(id: string) {
    const res = await fetch(`${API_BASE}/notifications.php?id=${id}`, {
      method: 'DELETE'
    });
    return await handleResponse(res);
  }
};
