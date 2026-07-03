import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_USER_CONFIG } from '../config/defaultUser';

interface User {
  username: string;
  email?: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('finops_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('finops_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple authentication - check against default user
    // In production, this would make an API call to backend
    if (
      username === DEFAULT_USER_CONFIG.username &&
      password === DEFAULT_USER_CONFIG.password
    ) {
      const userData: User = {
        username: DEFAULT_USER_CONFIG.username,
        email: DEFAULT_USER_CONFIG.email,
        displayName: DEFAULT_USER_CONFIG.displayName,
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('finops_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('finops_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

