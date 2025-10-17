import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL, getSSORedirectUrl } from '../lib/config';

interface SSOUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  dept: string;
  title: string;
  authProvider: string;
  azureId?: string;
}

interface SSOContextType {
  ssoUser: SSOUser | null;
  isSSOAuthenticated: boolean;
  ssoLogin: () => void;
  ssoLogout: () => void;
  isLoading: boolean;
}

const SSOContext = createContext<SSOContextType | undefined>(undefined);

export function SSOProvider({ children }: { children: ReactNode }) {
  const [ssoUser, setSsoUser] = useState<SSOUser | null>(null);
  const [isSSOAuthenticated, setIsSSOAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated via SSO
    const checkSSOAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://10.2.1.27:3000/auth/sso/status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user.authProvider === 'SSO') {
              setSsoUser(data.user);
              setIsSSOAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('SSO auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSSOAuth();
  }, []);

  const ssoLogin = () => {
    // Redirect to Microsoft OAuth
    window.location.href = getSSORedirectUrl();
  };

  const ssoLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/sso/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('SSO logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      setSsoUser(null);
      setIsSSOAuthenticated(false);
    }
  };

  return (
    <SSOContext.Provider value={{ 
      ssoUser, 
      isSSOAuthenticated, 
      ssoLogin, 
      ssoLogout, 
      isLoading 
    }}>
      {children}
    </SSOContext.Provider>
  );
}

export function useSSO() {
  const context = useContext(SSOContext);
  if (context === undefined) {
    throw new Error('useSSO must be used within an SSOProvider');
  }
  return context;
}