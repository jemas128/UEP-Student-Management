
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { StudentProfile, UserRole, Grade } from '../types';
import { Users, BookOpen, Award, Search, Trash2, Edit2, Plus, X, Save, Check, UserCheck, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Student Form Modal ---
interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: StudentProfile | null;
  isLoading: boolean;
}

const StudentModal: React.FC<StudentFormProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    program: '',
    yearLevel: 1,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        studentId: initialData.studentId || '',
        program: initialData.program || '',
        yearLevel: initialData.yearLevel || 1,
      });
    } else {
      setFormData({ name: '', email: '', studentId: '', program: '', yearLevel: 1 });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-uep-maroon p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">{initialData ? 'Edit Student Details' : 'Register New Student'}</h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              required
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon" 
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon"
                value={formData.yearLevel}
                onChange={e => setFormData({...formData, yearLevel: Number(e.target.value)})}
              >
                {[1,2,3,4,5].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon"
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
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-uep-maroon text-white rounded-lg hover:bg-uep-light flex items-center disabled:opacity-50">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />}
              {initialData ? 'Update' : 'Create'}
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
  onUpdate: () => void;
}

const GradesManagerModal: React.FC<GradesManagerProps> = ({ isOpen, onClose, student, onUpdate }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    courseId: '',
    courseName: '',
    grade: '',
    score: '',
    semester: '1st Sem 2024-2025'
  });

  useEffect(() => {
    if (isOpen && student) {
      loadGrades();
    }
  }, [isOpen, student]);

  const loadGrades = async () => {
    if(!student) return;
    setIsLoading(true);
    try {
      // Fetch latest grades directly from DB
      const data = await api.getGrades(student.id);
      setGrades(data);
    } catch (error) {
      console.error("Failed to load grades", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const gradeData = {
      courseId: form.courseId,
      courseName: form.courseName,
      grade: form.grade,
      score: Number(form.score),
      semester: form.semester
    };

    setIsLoading(true);
    try {
      if (editingId) {
        await api.updateGrade({ ...gradeData, id: editingId });
      } else {
        await api.addGrade(student.id, gradeData);
      }
      await loadGrades(); // Reload list
      onUpdate(); // Tell parent to refresh student GPA
      resetForm();
    } catch (e) {
      alert("Error saving grade");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gradeId: string) => {
    if(!window.confirm('Delete this grade?')) return;
    setIsLoading(true);
    try {
      await api.deleteGrade(gradeId);
      await loadGrades();
      onUpdate();
    } catch (e) {
      alert("Error deleting grade");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-uep-maroon p-4 flex justify-between items-center text-white shrink-0">
          <div>
             <h3 className="font-bold text-lg">Manage Grades</h3>
             <p className="text-xs text-red-100 opacity-80">{student.name}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-uep-maroon" />
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              {editingId ? 'Edit Grade Entry' : 'Add New Grade'}
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
               <div className="md:col-span-3">
                 <input 
                   placeholder="Code (CS101)" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required value={form.courseId}
                   onChange={e => setForm({...form, courseId: e.target.value})}
                 />
               </div>
               <div className="md:col-span-5">
                 <input 
                   placeholder="Subject Description" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required value={form.courseName}
                   onChange={e => setForm({...form, courseName: e.target.value})}
                 />
               </div>
               <div className="md:col-span-2">
                 <input 
                   placeholder="Grade" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required value={form.grade}
                   onChange={e => setForm({...form, grade: e.target.value})}
                 />
               </div>
               <div className="md:col-span-2">
                 <input 
                   type="number" placeholder="Score" 
                   className="w-full px-3 py-2 border rounded-md text-sm"
                   required value={form.score}
                   onChange={e => setForm({...form, score: e.target.value})}
                 />
               </div>
               <div className="md:col-span-12 flex justify-between items-center mt-2">
                 <input 
                    placeholder="Semester"
                    className="flex-1 px-3 py-2 border rounded-md text-sm mr-3"
                    required value={form.semester}
                    onChange={e => setForm({...form, semester: e.target.value})}
                 />
                 <div className="flex space-x-2">
                   {editingId && <button type="button" onClick={resetForm} className="px-3 py-2 text-xs font-medium text-gray-500">Cancel</button>}
                   <button type="submit" className="px-4 py-2 bg-uep-maroon text-white text-xs font-bold rounded-md hover:bg-uep-light">
                     {editingId ? 'Update Grade' : 'Add Grade'}
                   </button>
                 </div>
               </div>
            </form>
          </div>

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
                   <tr><td colSpan={5} className="p-4 text-center text-gray-400">No grades found.</td></tr>
                 ) : (
                   grades.map((g) => (
                     <tr key={g.id} className="hover:bg-gray-50">
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [gradesStudent, setGradesStudent] = useState<StudentProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const allUsers = await api.getStudents();
      setStudents(allUsers.filter(u => u.status === 'active' && u.role === UserRole.STUDENT));
      setPendingStudents(allUsers.filter(u => u.status === 'pending' && u.role === UserRole.STUDENT));
    } catch (err: any) {
      console.error(err);
      setError("Could not connect to database. Please check your internet or PHP settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id: string) => {
    if(!window.confirm("Permanently delete this student?")) return;
    try {
      await api.deleteStudent(id);
      fetchStudents();
    } catch (e) { alert("Failed to delete"); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveStudent(id);
      fetchStudents(); 
    } catch (e) { alert("Failed to approve"); }
  };

  const handleFormSubmit = async (data: any) => {
    setIsActionLoading(true);
    try {
      if (editingStudent) {
        await api.updateStudent({ ...editingStudent, ...data });
      } else {
        await api.addStudent(data);
      }
      setIsModalOpen(false);
      fetchStudents();
      setActiveTab('active');
    } catch (e: any) {
      alert("Error saving: " + e.message);
    } finally {
      setIsActionLoading(false);
    }
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

  if (isLoading && students.length === 0 && pendingStudents.length === 0) {
    return (
      <Layout title="Administrator Dashboard">
         <div className="h-96 flex flex-col items-center justify-center text-gray-500">
           <Loader2 className="w-10 h-10 animate-spin text-uep-maroon mb-4" />
           <p>Loading records from database...</p>
         </div>
      </Layout>
    );
  }

  return (
    <Layout title="Administrator Dashboard">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
        isLoading={isActionLoading}
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
               {students.length > 0 ? (students.reduce((acc, s) => acc + (s.gpa || 0), 0) / students.length).toFixed(2) : '0.00'}
             </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
             <div className="flex space-x-2">
                <button onClick={() => setActiveTab('active')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'active' ? 'bg-white text-uep-maroon shadow-sm ring-1 ring-gray-200' : 'text-gray-500'}`}>
                  Enrolled Students
                </button>
                <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'}`}>
                  Pending Requests {pendingStudents.length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">{pendingStudents.length}</span>}
                </button>
             </div>
             <div className="flex items-center space-x-2">
               <button onClick={fetchStudents} className="p-2 text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
               {activeTab === 'active' && (
                <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-uep-maroon text-white rounded-lg text-sm hover:bg-uep-light">
                  <Plus className="w-4 h-4 mr-2" /> Add Student
                </button>
               )}
             </div>
          </div>
          
          {activeTab === 'active' ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-uep-maroon"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto flex-1 max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0">
                    <tr><th className="px-6 py-3 font-medium">Student</th><th className="px-6 py-3 font-medium">Program</th><th className="px-6 py-3 font-medium">GPA</th><th className="px-6 py-3 font-medium text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img src={student.avatar} alt="" className="w-8 h-8 rounded-full mr-3" />
                            <div><p className="font-medium text-gray-900">{student.name}</p><p className="text-xs text-gray-500">{student.studentId || 'No ID'}</p></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{student.program}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${ (student.gpa || 0) <= 2.0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{(student.gpa || 0).toFixed(2)}</span></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => { setGradesStudent(student); setIsGradesModalOpen(true); }} className="p-1.5 text-uep-maroon bg-red-50 hover:bg-red-100 rounded-md" title="Grades"><BookOpen className="w-4 h-4" /></button>
                            <button onClick={() => { setEditingStudent(student); setIsModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(student.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
             <div className="overflow-x-auto flex-1 max-h-[500px]">
               <table className="w-full text-left text-sm">
                  <thead className="bg-orange-50 text-orange-800 sticky top-0">
                    <tr><th className="px-6 py-3 font-medium">Applicant</th><th className="px-6 py-3 font-medium">Email</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3 font-medium text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{student.name}</td>
                        <td className="px-6 py-4 text-gray-600">{student.email}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Pending</span></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-3">
                             <button onClick={() => handleApprove(student.id)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 font-semibold"><Check className="w-3 h-3 mr-1" /> Approve</button>
                             <button onClick={() => handleDelete(student.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 font-semibold"><X className="w-3 h-3 mr-1" /> Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </div>

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
        </div>
      </div>
    </Layout>
  );
};
