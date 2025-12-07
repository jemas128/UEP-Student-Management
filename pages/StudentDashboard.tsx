
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StudentProfile, Grade } from '../types';
import { FileText, Calendar, Clock, Loader2 } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(user as StudentProfile);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await api.getGrades(user.id);
        setGrades(data);
        // Calculate GPA locally based on fresh grades
        // (Simple averaging for display, assuming GPA logic is consistent)
        // Ideally backend returns updated profile, but we can compute here:
      } catch (e) {
        console.error("Failed to load grades", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (isLoading && !profile) {
    return (
      <Layout title="Student Portal">
        <div className="h-screen flex items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-uep-maroon" />
        </div>
      </Layout>
    );
  }

  const displayProfile = profile || (user as StudentProfile);
  // Re-calculate GPA for display
  const currentGPA = grades.length > 0 
    ? (grades.reduce((sum, g) => sum + (parseFloat(g.grade) || 0), 0) / grades.length).toFixed(2)
    : displayProfile.gpa.toFixed(2);

  return (
    <Layout title="My Student Portal">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center md:items-start">
        <img 
          src={displayProfile.avatar} 
          alt={displayProfile.name} 
          className="w-24 h-24 rounded-full border-4 border-uep-maroon mb-4 md:mb-0 md:mr-6" 
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">{displayProfile.name}</h2>
          <p className="text-gray-500 mb-2">{displayProfile.program} • Year {displayProfile.yearLevel}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">ID: {displayProfile.studentId}</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Status: Regular</span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">GPA: {currentGPA}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-uep-maroon" /> Academic Records
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">Course</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Semester</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-center">Grade</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400">No grades recorded yet.</td></tr>
                ) : (
                  grades.map((grade, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{grade.courseName}</p>
                        <p className="text-xs text-gray-500">{grade.courseId}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{grade.semester}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block w-8 h-8 leading-8 rounded-full text-sm font-bold ${
                          grade.grade.startsWith('1') ? 'bg-green-100 text-green-700' :
                          grade.grade.startsWith('5') ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-700">{grade.score}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-uep-maroon" />Today's Schedule</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-uep-maroon pl-4 py-1">
                <p className="text-sm font-semibold text-gray-800">No classes scheduled</p>
                <p className="text-xs text-gray-500">Check back later for updates</p>
              </div>
            </div>
          </div>
          <div className="bg-uep-maroon rounded-xl shadow-sm p-6 text-white">
            <h3 className="font-bold mb-2 flex items-center"><Calendar className="w-5 h-5 mr-2" />Upcoming Events</h3>
            <ul className="text-sm space-y-2 text-red-100"><li>• Midterm Exams (Coming Soon)</li></ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};
