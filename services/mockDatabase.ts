import { User, UserRole, StudentProfile, Notification, Grade } from '../types';

// Initial Mock Data
const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'System Administrator',
  email: 'admin@uep.edu',
  role: UserRole.ADMIN,
  status: 'active',
  avatar: 'https://ui-avatars.com/api/?name=Admin&background=800000&color=fff'
};

const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: 'student-1',
    studentId: 'UEP-2023-001',
    name: 'Jane Doe',
    email: 'jane@uep.edu',
    role: UserRole.STUDENT,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Doe&background=d4af37&color=fff',
    program: 'BS Computer Science',
    yearLevel: 3,
    gpa: 1.5,
    grades: [
      { id: 'g1', courseId: 'CS101', courseName: 'Intro to Programming', grade: '1.25', score: 95, semester: '2023-1' },
      { id: 'g2', courseId: 'CS102', courseName: 'Data Structures', grade: '1.75', score: 88, semester: '2023-1' },
      { id: 'g3', courseId: 'MATH101', courseName: 'Calculus I', grade: '1.5', score: 91, semester: '2023-1' },
    ]
  },
  {
    id: 'student-2',
    studentId: 'UEP-2023-002',
    name: 'John Smith',
    email: 'john@uep.edu',
    role: UserRole.STUDENT,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=d4af37&color=fff',
    program: 'BS Information Tech',
    yearLevel: 2,
    gpa: 2.0,
    grades: [
      { id: 'g4', courseId: 'IT101', courseName: 'Web Development', grade: '2.0', score: 85, semester: '2023-1' },
    ]
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to UEP Portal',
    message: 'Welcome to the new Student Management System. Please update your profile.',
    date: new Date().toISOString(),
    isRead: false,
    type: 'info'
  },
  {
    id: 'notif-2',
    title: 'System Maintenance',
    message: 'The system will undergo maintenance on Saturday at 10:00 PM.',
    date: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
    type: 'alert'
  }
];

const STORAGE_KEYS = {
  USERS: 'uep_users',
  SESSION: 'uep_session',
  NOTIFICATIONS: 'uep_notifications'
};

// Initialize Storage if empty
export const initializeDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const initialData = [MOCK_ADMIN, ...MOCK_STUDENTS];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
  }
};

// Helper to calc GPA
const calculateGPA = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  // Assuming Philippine grading system (1.0 is best, 5.0 is fail) or similar
  // Just averaging the numeric value if grade is numeric, else mapping letters
  let total = 0;
  let count = 0;
  
  grades.forEach(g => {
    const val = parseFloat(g.grade);
    if (!isNaN(val)) {
       total += val;
       count++;
    } else {
       // Letter grade mapping fallback
       if(g.grade.startsWith('A')) total += 1.0;
       else if(g.grade.startsWith('B')) total += 2.0;
       else if(g.grade.startsWith('C')) total += 3.0;
       else if(g.grade.startsWith('D')) total += 4.0;
       else total += 5.0; // Fail
       count++;
    }
  });
  
  return count === 0 ? 0 : total / count;
};

export const db = {
  getUsers: (): User[] => {
    initializeDB();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },
  
  findUserByEmail: (email: string): User | undefined => {
    const users = db.getUsers();
    return users.find(u => u.email === email);
  },

  // Mocking Login
  login: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = db.findUserByEmail(email);
        
        if (user) {
          if (user.status === 'pending') {
            reject(new Error('Your account is awaiting Admin approval.'));
            return;
          }
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  },

  // Mocking Registration - NOW DEFAULT TO STUDENT AND PENDING
  register: async (name: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = db.getUsers();
        if (users.find(u => u.email === email)) {
          reject(new Error('Email already exists'));
          return;
        }

        const newUser: StudentProfile = {
          id: `user-${Date.now()}`,
          name,
          email,
          role: UserRole.STUDENT, // FORCE STUDENT ROLE
          status: 'pending',       // FORCE PENDING STATUS
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4af37&color=fff`,
          // Defaults for student
          studentId: undefined, // Will be assigned by Admin upon approval/edit
          program: 'TBD',
          yearLevel: 1,
          gpa: 0,
          grades: []
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        // DO NOT LOGIN AUTOMATICALLY
        resolve();
      }, 1000);
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getSession: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  // Admin Actions
  addStudent: (student: Partial<StudentProfile>) => {
    const users = db.getUsers();
    const newStudent: StudentProfile = {
      ...student,
      id: student.id || `student-${Date.now()}`,
      role: UserRole.STUDENT,
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=d4af37&color=fff`,
      grades: [],
      gpa: 0
    } as StudentProfile;
    
    users.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newStudent;
  },

  approveStudent: (id: string) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].status = 'active';
      // Auto-assign ID if missing
      if (!(users[index] as StudentProfile).studentId) {
         (users[index] as StudentProfile).studentId = `UEP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  rejectStudent: (id: string) => {
    const users = db.getUsers();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
  },

  updateStudent: (student: StudentProfile) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === student.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...student };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  deleteStudent: (id: string) => {
    const users = db.getUsers();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
  },

  // --- Grade Management ---
  addGrade: (studentId: string, gradeData: Omit<Grade, 'id'>) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === studentId);
    if (index !== -1) {
      const student = users[index] as StudentProfile;
      const newGrade: Grade = { ...gradeData, id: `g-${Date.now()}` };
      student.grades = student.grades || [];
      student.grades.push(newGrade);
      student.gpa = calculateGPA(student.grades);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  updateGrade: (studentId: string, grade: Grade) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === studentId);
    if (index !== -1) {
      const student = users[index] as StudentProfile;
      if (student.grades) {
        const gIndex = student.grades.findIndex(g => g.id === grade.id);
        if (gIndex !== -1) {
          student.grades[gIndex] = grade;
          student.gpa = calculateGPA(student.grades);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
      }
    }
  },

  deleteGrade: (studentId: string, gradeId: string) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === studentId);
    if (index !== -1) {
      const student = users[index] as StudentProfile;
      if (student.grades) {
        student.grades = student.grades.filter(g => g.id !== gradeId);
        student.gpa = calculateGPA(student.grades);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    }
  },

  // Notifications
  getNotifications: (): Notification[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  },

  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    const notifs = db.getNotifications();
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString(),
      isRead: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return newNotif;
  },

  markAsRead: (id: string) => {
    const notifs = db.getNotifications();
    const index = notifs.findIndex(n => n.id === id);
    if (index !== -1) {
      notifs[index].isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  },
  
  deleteNotification: (id: string) => {
    const notifs = db.getNotifications();
    const newNotifs = notifs.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifs));
  }
};