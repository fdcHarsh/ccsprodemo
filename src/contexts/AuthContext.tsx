import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, providerUser, groupAdminUser } from '@/lib/mockData';

export type UserRole = 'provider' | 'group_admin';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  loginAsProvider: () => void;
  loginAsGroupAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'credflow_user';
const ROLE_KEY = 'credflow_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;
    if (stored) setUser(JSON.parse(stored));
    if (storedRole) setRole(storedRole);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
  }, [user, role, initialized]);

  const login = (userData: User) => {
    setUser(userData);
    setRole(userData.role ?? 'provider');
  };

  const loginAsProvider = () => {
    setUser(providerUser);
    setRole('provider');
  };

  const loginAsGroupAdmin = () => {
    setUser(groupAdminUser);
    setRole('group_admin');
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, login, loginAsProvider, loginAsGroupAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
