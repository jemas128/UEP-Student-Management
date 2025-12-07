
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
    // If PHP returns {error: "msg"}, throw it
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (e: any) {
    // Log the raw text response for debugging (visible in browser console)
    console.error("API Error (Raw Response):", text);
    throw new Error(e.message || "Server Error. Check Console.");
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
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/db_connect.php`);
      const text = await res.text();
      if(text.includes('Connection failed')) throw new Error(text);
      return true;
    } catch (e) {
      return false;
    }
  },

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
    // GET is usually safe
    const res = await fetch(`${API_BASE}/students.php?action=get_all`);
    const data = await handleResponse(res);
    return data.map(mapUserFromDB) as StudentProfile[];
  },

  async addStudent(student: Partial<StudentProfile>) {
    const payload = {
      action: 'add_student',
      name: student.name,
      email: student.email,
      student_id: student.studentId,
      program: student.program,
      year_level: student.yearLevel,
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
      action: 'update_student',
      id: student.id,
      name: student.name,
      email: student.email,
      student_id: student.studentId,
      program: student.program,
      year_level: student.yearLevel
    };
    
    // Using POST instead of PUT
    const res = await fetch(`${API_BASE}/students.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  async deleteStudent(id: string) {
    // Using POST instead of DELETE
    const res = await fetch(`${API_BASE}/students.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_student', id })
    });
    return await handleResponse(res);
  },

  async approveStudent(id: string) {
    const res = await fetch(`${API_BASE}/students.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', id, status: 'active' })
    });
    return await handleResponse(res);
  },

  // --- GRADES ---
  async getGrades(studentId: string) {
    const res = await fetch(`${API_BASE}/grades.php?action=get_grades&student_id=${studentId}`);
    const data = await handleResponse(res);
    return data.map(mapGradeFromDB) as Grade[];
  },

  async addGrade(studentId: string, grade: Omit<Grade, 'id'>) {
    const payload = {
      action: 'add_grade',
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
      action: 'update_grade',
      id: grade.id,
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

  async deleteGrade(id: string) {
    const res = await fetch(`${API_BASE}/grades.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_grade', id })
    });
    return await handleResponse(res);
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications.php?action=get_all`);
    const data = await handleResponse(res);
    return data.map(mapNotifFromDB);
  },

  async addNotification(notif: {title: string, message: string, type: string}) {
    const res = await fetch(`${API_BASE}/notifications.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...notif, action: 'add_notif' })
    });
    return await handleResponse(res);
  },

  async deleteNotification(id: string) {
    const res = await fetch(`${API_BASE}/notifications.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_notif', id })
    });
    return await handleResponse(res);
  }
};
