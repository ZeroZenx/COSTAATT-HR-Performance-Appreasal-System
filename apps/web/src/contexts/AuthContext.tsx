import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../lib/config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  dept: string;
  title: string;
  authProvider: 'LOCAL' | 'SSO';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isSSOAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for Microsoft OAuth token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store the token and redirect to dashboard
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verify token and get user info
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Verify stored token and get user info
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Handle SSO user - will be implemented when SSO is fully integrated

  const login = async (email: string, password: string) => {
    console.log('🔐 Frontend login attempt:', { email, password: '***' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('❌ Response not OK:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (data.success) {
        console.log('✅ Login successful, storing token and user data');
        console.log('🔑 Token:', data.data.accessToken.substring(0, 50) + '...');
        console.log('👤 User:', data.data.user);
        
        localStorage.setItem('token', data.data.accessToken);
        setUser(data.data.user);
        
        console.log('✅ User state updated successfully');
      } else {
        console.log('❌ Login failed:', data.message);
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.log('❌ Login error caught:', (error as Error).message);
      throw error;
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    
    // Clear user state
    setUser(null);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      isSSOAvailable: true
    }}>
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