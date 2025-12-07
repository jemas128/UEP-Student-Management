import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { StudentProfile } from '../types';
import { User, FileText, Calendar, Clock } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  // Safe cast because this page is protected by role check ideally, or we check here
  const student = user as StudentProfile; 

  if (!student) return <div>Loading...</div>;

  return (
    <Layout title="My Student Portal">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center md:items-start">
        <img 
          src={student.avatar} 
          alt={student.name} 
          className="w-24 h-24 rounded-full border-4 border-uep-maroon mb-4 md:mb-0 md:mr-6" 
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
          <p className="text-gray-500 mb-2">{student.program} • Year {student.yearLevel}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">ID: {student.studentId}</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Status: Regular</span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">GPA: {student.gpa.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Grades Table */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-uep-maroon" />
            Academic Records
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
                {student.grades?.map((grade, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{grade.courseName}</p>
                      <p className="text-xs text-gray-500">{grade.courseId}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{grade.semester}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block w-8 h-8 leading-8 rounded-full text-sm font-bold ${
                        grade.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                        grade.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">{grade.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule / Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-uep-maroon" />
              Today's Schedule
            </h3>
            <div className="space-y-4">
              <div className="border-l-2 border-uep-maroon pl-4 py-1">
                <p className="text-sm font-semibold text-gray-800">Data Structures</p>
                <p className="text-xs text-gray-500">09:00 AM - 10:30 AM • Rm 304</p>
              </div>
              <div className="border-l-2 border-yellow-400 pl-4 py-1">
                <p className="text-sm font-semibold text-gray-800">Web Development</p>
                <p className="text-xs text-gray-500">01:00 PM - 03:00 PM • Lab 2</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-4 py-1">
                <p className="text-sm text-gray-400">No more classes</p>
              </div>
            </div>
          </div>

          <div className="bg-uep-maroon rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Events
              </h3>
              <ul className="text-sm space-y-2 text-red-100">
                <li>• Midterm Exams (Oct 15)</li>
                <li>• University Week (Oct 25)</li>
                <li>• Career Fair (Nov 05)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};