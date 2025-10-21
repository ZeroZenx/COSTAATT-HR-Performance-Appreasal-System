// Configuration utility for dynamic API URL resolution

export const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // Check if we're accessing via DNS-friendly name with Nginx reverse proxy
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    // With Nginx reverse proxy, use relative path (no port needed!)
    // Nginx will proxy /api/* to backend (port 3000)
    return window.location.origin + '/api';
    // This resolves to: http://hrpmg.costaatt.edu.tt/api (clean URL!)
  }
  
  // Fallback to IP address with port for direct access / development
  return 'http://10.2.1.27:3000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for SSO redirect URL
export const getSSORedirectUrl = () => {
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    // With Nginx reverse proxy, use clean URL (no port!)
    return window.location.origin + '/auth/sso/microsoft';
    // This resolves to: http://hrpmg.costaatt.edu.tt/auth/sso/microsoft
  }
  // Fallback for direct access
  return 'http://10.2.1.27:3000/auth/sso/microsoft';
};
