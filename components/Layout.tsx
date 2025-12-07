import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap, Menu, X, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === UserRole.ADMIN;

  const NavItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => {
    const isActive = location.pathname === path;
    return (
      <button 
        onClick={() => {
          navigate(path);
          setSidebarOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-colors rounded-lg ${
          isActive 
            ? 'bg-white/10 text-white' 
            : 'text-red-100 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-uep-maroon text-white transition-transform duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-center h-16 border-b border-white/10">
          <GraduationCap className="w-8 h-8 mr-2 text-yellow-400" />
          <span className="text-xl font-bold tracking-wider">UEP SMS</span>
        </div>

        <div className="p-4">
          <div className="mb-6 px-4">
            <p className="text-xs text-red-200 uppercase font-semibold mb-2">Main Menu</p>
            
            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <NavItem icon={Users} label="Student Management" path="/admin" />
                <NavItem icon={Bell} label="Notifications" path="/notifications" />
              </>
            )}

            {/* Student Navigation */}
            {!isAdmin && (
              <>
                <NavItem icon={LayoutDashboard} label="My Dashboard" path="/student" />
                <NavItem icon={BookOpen} label="My Grades" path="/student" />
                <NavItem icon={Bell} label="Announcements" path="/notifications" />
              </>
            )}

          </div>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-uep-maroon">
          <div className="flex items-center mb-4 px-2">
            <img 
              src={user?.avatar || "https://picsum.photos/200"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-yellow-400 mr-3"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-red-200 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-red-900/50 rounded-lg hover:bg-red-900 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-800 ml-2 lg:ml-0">{title}</h1>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-400 hover:text-uep-maroon transition-colors relative"
            >
               <Bell className="w-5 h-5" />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <span className="text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};