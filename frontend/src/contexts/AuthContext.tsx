import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI, profileAPI } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (email: string, password: string) => Promise<string>;
  verifyEmail: (email: string, token: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.whoami();
      const text = response.data;
      const emailMatch = text.match(/user: (.+?),/);
      const roleMatch = text.match(/ROLE_(\w+)/);
      if (emailMatch) {
        const role = roleMatch ? roleMatch[1].toLowerCase() : 'applicant';
        // Fetch profile to get profileComplete
        try {
          const profileRes = await profileAPI.get();
          setUser({
            email: emailMatch[1],
            role: role === 'admin' ? 'admin' : 'applicant',
            profileComplete: profileRes.data.profileComplete ?? false,
          });
        } catch {
          setUser({
            email: emailMatch[1],
            role: role === 'admin' ? 'admin' : 'applicant',
            profileComplete: false,
          });
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<string> => {
    const response = await authAPI.login({ email, password });
    if (response.data.success) {
      setUser({
        email,
        role: response.data.role || 'applicant',
        profileComplete: response.data.profileComplete ?? false,
      });
    }
    return response.data.message;
  };

  const register = async (email: string, password: string): Promise<string> => {
    const response = await authAPI.register({ email, password });
    return response.data.message;
  };

  const verifyEmail = async (email: string, token: string): Promise<string> => {
    const response = await authAPI.verifyEmail({ email, token });
    return response.data.message;
  };

  const logout = async () => {
    try { await authAPI.logout(); }
    finally { setUser(null); }
  };

  const refreshProfile = async () => {
    try {
      const profileRes = await profileAPI.get();
      if (user) {
        setUser({ ...user, profileComplete: profileRes.data.profileComplete });
      }
    } catch { /* ignore */ }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isAdmin, login, register, verifyEmail, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
