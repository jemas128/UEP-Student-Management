import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, Loader2, User, UserPlus, LogIn, CheckCircle, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        // Strict Student Registration
        await register(name, email, password);
        setSuccessMsg('Application submitted! Your student account is pending Administrator approval.');
        setIsLoginView(true); // Switch back to login
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row m-4 min-h-[600px]">
        
        {/* Left Side - Brand */}
        <div className="md:w-1/2 bg-uep-maroon p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] opacity-10 bg-cover bg-center"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-8">
              <GraduationCap className="w-10 h-10 text-uep-gold" />
              <span className="text-2xl font-bold tracking-wider">UEP</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Student Management System</h2>
            <p className="text-red-100">Welcome to the official UEP portal. Access your dashboard to manage grades, schedules, and student information efficiently.</p>
          </div>
          <div className="relative z-10 text-sm text-red-200">
            © 2024 University of Eastern Philippines. <br/>Admin access is restricted.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {isLoginView ? 'Portal Login' : 'Student Application'}
            </h3>
            <p className="text-gray-500">
              {isLoginView 
                ? 'Enter your credentials to access the system.' 
                : 'Fill out the form to request a student account.'}
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200 flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLoginView && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent outline-none transition-all"
                    placeholder="Juan Dela Cruz"
                    required={!isLoginView}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent outline-none transition-all"
                  placeholder="student@uep.edu.ph"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-uep-maroon text-white py-3 rounded-lg font-semibold hover:bg-uep-light transition-colors flex items-center justify-center shadow-lg shadow-red-900/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                isLoginView ? 'Sign In' : 'Submit Application'
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLoginView ? 'New Student?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError('');
                setSuccessMsg('');
              }}
              className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              {isLoginView ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Apply for Student Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Back to Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};