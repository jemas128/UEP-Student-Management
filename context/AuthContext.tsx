import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole } from '../types';
import { db } from '../services/mockDatabase';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    const user = db.getSession();
    if (user) {
      setState({ user, isAuthenticated: true, isLoading: false });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await db.login(email, pass);
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Registration only creates the record, does not log in (needs approval)
      await db.register(name, email, pass);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    db.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};