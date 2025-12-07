import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { Notifications } from './pages/Notifications';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode, requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on actual role if trying to access unauthorized area
    return <Navigate to={user?.role === UserRole.ADMIN ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to={user?.role === UserRole.ADMIN ? "/admin" : "/student"} /> 
          : <Login />
      } />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student" 
        element={
          <ProtectedRoute requiredRole={UserRole.STUDENT}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;