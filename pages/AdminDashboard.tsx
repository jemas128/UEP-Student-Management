import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { db } from '../services/mockDatabase';
import { StudentProfile, UserRole, Grade } from '../types';
import { Users, BookOpen, Award, Search, Trash2, Edit2, Plus, X, Save, Check, UserCheck, RefreshCw, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Student Form Modal (Profile Info) ---
interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: StudentProfile | null;
}

const StudentModal: React.FC<StudentFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    program: '',
    yearLevel: 1,
    gpa: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        studentId: initialData.studentId || '',
        program: initialData.program || '',
        yearLevel: initialData.yearLevel || 1,
        gpa: initialData.gpa || 0
      });
    } else {
      setFormData({ name: '', email: '', studentId: '', program: '', yearLevel: 1, gpa: 0 });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-uep-maroon p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">{initialData ? 'Edit Student Details' : 'Register New Student'}</h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Juan Dela Cruz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              required
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="e.g. juan@uep.edu.ph"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Optional)</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent" 
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
                placeholder="UEP-2024-XXXX"
              />
              <p className="text-[10px] text-gray-400 mt-1">Leave blank to auto-generate</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent"
                value={formData.yearLevel}
                onChange={e => setFormData({...formData, yearLevel: Number(e.target.value)})}
              >
                {[1,2,3,4,5].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program (Course)</label>
            <select
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent"
               value={formData.program}
               onChange={e => setFormData({...formData, program: e.target.value})}
               required
            >
              <option value="">Select Program</option>
              <option value="BS Computer Science">BS Computer Science</option>
              <option value="BS Information Tech">BS Information Tech</option>
              <option value="BS Civil Engineering">BS Civil Engineering</option>
              <option value="BS Nursing">BS Nursing</option>
              <option value="BS Accountancy">BS Accountancy</option>
              <option value="BS Elementary Educ">BS Elementary Educ</option>
              <option value="BA Political Science">BA Political Science</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-uep-maroon text-white rounded-lg hover:bg-uep-light flex items-center">
              <Save className="w-4 h-4 mr-2" /> 
              {initialData ? 'Update Student' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Grades Manager Modal ---
interface GradesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  onUpdate: () => void; // Trigger refresh
}

const GradesManagerModal: React.FC<GradesManagerProps> = ({ isOpen, onClose, student, onUpdate }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Grade Form State
  const [form, setForm] = useState({
    courseId: '',
    courseName: '',
    grade: '',
    score: '',
    semester: '1st Sem 2024-2025'
  });

  useEffect(() => {
    if (student) {
      setGrades(student.grades || []);
    }
  }, [student, isOpen]);

  const resetForm = () => {
    setForm({ courseId: '', courseName: '', grade: '', score: '', semester: '1st Sem 2024-2025' });
    setEditingId(null);
  };

  const handleEdit = (g: Grade) => {
    setEditingId(g.id || null);
    setForm({
      courseId: g.courseId,
      courseName: g.courseName,
      grade: g.grade,
      score: g.score.toString(),
      semester: g.semester
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const gradeData = {
      courseId: form.courseId,
      courseName: form.courseName,
      grade: form.grade,
      score: Number(form.score),
      semester: form.semester
    };

    if (editingId) {
      // Update
      db.updateGrade(student.id, { ...gradeData, id: editingId });
    } else {
      // Add
      db.addGrade(student.id, gradeData);
    }
    
    // Refresh local list immediately roughly
    const updatedUser = db.getUsers().find(u => u.id === student.id) as StudentProfile;
    if (updatedUser) setGrades(updatedUser.grades || []);
    
    resetForm();
    onUpdate(); // Refresh parent dashboard
  };

  const handleDelete = (gradeId: string) => {
    if(!student) return;
    if(window.confirm('Delete this grade record?')) {
      db.deleteGrade(student.id, gradeId);
      const updatedUser = db.getUsers().find(u => u.id === student.id) as StudentProfile;
      if (updatedUser) setGrades(updatedUser.grades || []);
      onUpdate();
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-uep-maroon p-4 flex justify-between items-center text-white shrink-0">
          <div>
             <h3 className="font-bold text-lg">Manage Grades</h3>
             <p className="text-xs text-red-100 opacity-80">{student.name} • {student.program}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Add/Edit Form */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              {editingId ? 'Edit Grade Entry' : 'Add New Grade'}
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
               <div className="md:col-span-3">
                 <input 
                   placeholder="Code (e.g. CS101)" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required
                   value={form.courseId}
                   onChange={e => setForm({...form, courseId: e.target.value})}
                 />
               </div>
               <div className="md:col-span-5">
                 <input 
                   placeholder="Subject Description" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required
                   value={form.courseName}
                   onChange={e => setForm({...form, courseName: e.target.value})}
                 />
               </div>
               <div className="md:col-span-2">
                 <input 
                   placeholder="Grade" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required
                   value={form.grade}
                   onChange={e => setForm({...form, grade: e.target.value})}
                 />
               </div>
               <div className="md:col-span-2">
                 <input 
                   type="number"
                   placeholder="Score" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required
                   value={form.score}
                   onChange={e => setForm({...form, score: e.target.value})}
                 />
               </div>
               <div className="md:col-span-12 flex justify-between items-center mt-2">
                 <input 
                    placeholder="Semester (e.g. 1st Sem 2024-2025)"
                    className="flex-1 px-3 py-2 border rounded-md text-sm mr-3"
                    required
                    value={form.semester}
                    onChange={e => setForm({...form, semester: e.target.value})}
                 />
                 <div className="flex space-x-2">
                   {editingId && (
                     <button type="button" onClick={resetForm} className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700">Cancel</button>
                   )}
                   <button type="submit" className="px-4 py-2 bg-uep-maroon text-white text-xs font-bold rounded-md hover:bg-uep-light">
                     {editingId ? 'Update Grade' : 'Add Grade'}
                   </button>
                 </div>
               </div>
            </form>
          </div>

          {/* Grades List */}
          <div className="border rounded-lg overflow-hidden">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-100 text-gray-600 font-medium border-b">
                 <tr>
                   <th className="px-4 py-3">Subject</th>
                   <th className="px-4 py-3">Sem</th>
                   <th className="px-4 py-3 text-center">Grade</th>
                   <th className="px-4 py-3 text-center">Score</th>
                   <th className="px-4 py-3 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {grades.length === 0 ? (
                   <tr><td colSpan={5} className="p-4 text-center text-gray-400">No grades recorded yet.</td></tr>
                 ) : (
                   grades.map((g) => (
                     <tr key={g.id || g.courseId} className="hover:bg-gray-50">
                       <td className="px-4 py-3">
                         <div className="font-medium text-gray-900">{g.courseId}</div>
                         <div className="text-xs text-gray-500 truncate max-w-[150px]">{g.courseName}</div>
                       </td>
                       <td className="px-4 py-3 text-gray-500">{g.semester}</td>
                       <td className="px-4 py-3 text-center font-bold text-gray-800">{g.grade}</td>
                       <td className="px-4 py-3 text-center text-gray-600">{g.score}</td>
                       <td className="px-4 py-3 text-right">
                         <button onClick={() => handleEdit(g)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 className="w-3 h-3" /></button>
                         <button onClick={() => handleDelete(g.id!)} className="text-red-600 hover:text-red-800"><Trash2 className="w-3 h-3" /></button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 text-right">
           <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Done</button>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [pendingStudents, setPendingStudents] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [gradesStudent, setGradesStudent] = useState<StudentProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  const fetchStudents = useCallback(() => {
    const allUsers = db.getUsers();
    // Active
    const active = allUsers.filter(u => u.role === UserRole.STUDENT && u.status === 'active') as StudentProfile[];
    setStudents(active);
    
    // Pending
    const pending = allUsers.filter(u => u.role === UserRole.STUDENT && u.status === 'pending') as StudentProfile[];
    setPendingStudents(pending);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, activeTab]); 

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure you want to remove this account? This action cannot be undone.")) {
      db.deleteStudent(id);
      fetchStudents();
    }
  };

  const handleApprove = (id: string) => {
    db.approveStudent(id);
    fetchStudents(); 
  };

  const handleEdit = (student: StudentProfile) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleManageGrades = (student: StudentProfile) => {
    setGradesStudent(student);
    setIsGradesModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingStudent) {
      const updated = { ...editingStudent, ...data };
      db.updateStudent(updated);
    } else {
      // Create new active student manually
      if (!data.studentId) {
        data.studentId = `UEP-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      db.addStudent(data);
    }
    setIsModalOpen(false);
    fetchStudents();
    setActiveTab('active'); 
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const chartData = [
    { name: 'BS CS', students: students.filter(s => s.program === 'BS Computer Science').length },
    { name: 'BS IT', students: students.filter(s => s.program === 'BS Information Tech').length },
    { name: 'BS CE', students: students.filter(s => s.program === 'BS Civil Engineering').length },
    { name: 'BS N', students: students.filter(s => s.program === 'BS Nursing').length },
  ];

  return (
    <Layout title="Administrator Dashboard">
      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
      />

      <GradesManagerModal 
        isOpen={isGradesModalOpen}
        onClose={() => setIsGradesModalOpen(false)}
        student={gradesStudent}
        onUpdate={fetchStudents}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-lg bg-blue-500 bg-opacity-10 mr-4">
             <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Students</p>
            <p className="text-2xl font-bold text-gray-800">{students.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-4 rounded-lg bg-orange-500 bg-opacity-10 mr-4">
             <UserCheck className="w-8 h-8 text-orange-600" />
           </div>
           <div>
             <p className="text-gray-500 text-sm">Pending Approvals</p>
             <p className="text-2xl font-bold text-gray-800">{pendingStudents.length}</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-4 rounded-lg bg-yellow-500 bg-opacity-10 mr-4">
             <Award className="w-8 h-8 text-yellow-600" />
           </div>
           <div>
             <p className="text-gray-500 text-sm">Average GPA</p>
             <p className="text-2xl font-bold text-gray-800">
               {students.length > 0 
                  ? (students.reduce((acc, s) => acc + (s.gpa || 0), 0) / students.length).toFixed(2)
                  : '0.00'
               }
             </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
             <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'active' ? 'bg-white text-uep-maroon shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Enrolled Students
                </button>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pending Requests
                  {pendingStudents.length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">{pendingStudents.length}</span>}
                </button>
             </div>
             <div className="flex items-center space-x-2 w-full sm:w-auto">
               <button onClick={fetchStudents} className="p-2 text-gray-400 hover:text-gray-600" title="Refresh List">
                  <RefreshCw className="w-4 h-4" />
               </button>
               {activeTab === 'active' && (
                <button 
                  onClick={handleAddNew}
                  className="flex items-center px-4 py-2 bg-uep-maroon text-white rounded-lg text-sm hover:bg-uep-light transition shadow-md whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </button>
               )}
             </div>
          </div>
          
          {activeTab === 'active' ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name or ID..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-uep-maroon"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto flex-1 max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Student</th>
                      <th className="px-6 py-3 font-medium">Program</th>
                      <th className="px-6 py-3 font-medium">GPA</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img src={student.avatar} alt="" className="w-8 h-8 rounded-full mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.studentId || 'No ID'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{student.program}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (student.gpa || 0) <= 2.0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {(student.gpa || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleManageGrades(student)} className="p-1.5 text-uep-maroon bg-red-50 hover:bg-red-100 rounded-md transition-colors" title="Manage Grades">
                              <BookOpen className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(student)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors" title="Edit Profile">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(student.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500">No active students found matching your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
             <div className="overflow-x-auto flex-1 max-h-[500px]">
               <table className="w-full text-left text-sm">
                  <thead className="bg-orange-50 text-orange-800 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Applicant Name</th>
                      <th className="px-6 py-3 font-medium">Email Address</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 text-orange-600 font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-900">{student.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{student.email}</td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                Needs Approval
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-3">
                             <button 
                                onClick={() => handleApprove(student.id)}
                                className="flex items-center text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 transition-colors font-semibold"
                             >
                                <Check className="w-3 h-3 mr-1" /> Approve
                             </button>
                             <button 
                                onClick={() => handleDelete(student.id)}
                                className="flex items-center text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors font-semibold"
                             >
                                <X className="w-3 h-3 mr-1" /> Reject
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingStudents.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500">No pending registration requests.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          )}
        </div>

        {/* Enrollment Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-6">Enrollment by Program</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="students" fill="#800000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500 border-t pt-4">
            <p><strong>System Status:</strong></p>
            <p className="flex items-center mt-1"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Database Connected</p>
            <p className="flex items-center mt-1"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Sync Enabled</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};