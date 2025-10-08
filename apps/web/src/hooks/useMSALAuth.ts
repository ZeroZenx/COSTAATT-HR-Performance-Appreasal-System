import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest, roleMapping, defaultRole } from '../lib/msalConfig';
import { authApi } from '../lib/api';
import { useState, useEffect } from 'react';

export function useMSALAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Login with Microsoft 365
  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await instance.loginPopup(loginRequest);
      
      if (response.account) {
        
        // Extract user information from Azure AD
        const email = response.account.username;
        const name = response.account.name || '';
        const azureId = response.account.homeAccountId;
        const groups = response.account.idTokenClaims?.groups || [];
        
        
        // Call our SSO authentication endpoint
        const ssoResponse = await authApi.ssoLogin(email, name, azureId, groups);
        
        // Handle the response
        const ssoData = ssoResponse.data.data || ssoResponse.data;
        if (ssoData && ssoData.accessToken && ssoData.user) {
          const { accessToken, refreshToken, user: userData } = ssoData;
          
          // Store tokens and user data
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('msal_user', JSON.stringify(userData));
          
          setUser(userData);
          
          return userData;
        } else {
          throw new Error('Invalid SSO response structure');
        }
      }
    } catch (error: any) {
      console.error('❌ MSAL/SSO Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout from Microsoft 365
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear local storage
      localStorage.removeItem('msal_user');
      localStorage.removeItem('accessToken');
      setUser(null);
      
      // Logout from MSAL
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error: any) {
      console.error('MSAL Logout error:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Get user roles from Azure AD groups
  const getUserRoles = (account: any): string[] => {
    const roles: string[] = [];
    
    // Check for group claims in the token
    if (account.idTokenClaims?.groups) {
      const groups = account.idTokenClaims.groups;
      groups.forEach((group: string) => {
        if (roleMapping[group as keyof typeof roleMapping]) {
          roles.push(roleMapping[group as keyof typeof roleMapping]);
        }
      });
    }
    
    // If no roles found, use default
    if (roles.length === 0) {
      roles.push(defaultRole);
    }
    
    return roles;
  };

  // Initialize user from stored data
  useEffect(() => {
    const storedUser = localStorage.getItem('msal_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('msal_user');
      }
    }
  }, []);

  // Update user when account changes
  useEffect(() => {
    if (account && !user) {
      const userInfo = {
        id: account.homeAccountId,
        email: account.username,
        name: account.name || '',
        roles: getUserRoles(account),
      };
      setUser(userInfo);
    }
  }, [account, user]);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isLoginInProgress: inProgress === 'login',
  };
}
