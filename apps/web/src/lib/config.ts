// Configuration utility for dynamic API URL resolution

export const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // Check if we're accessing via DNS-friendly name
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    return 'http://hrpmg.costaatt.edu.tt:3000';
  }
  
  // Fallback to IP address for local development
  return 'http://10.2.1.27:3000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for SSO redirect URL
export const getSSORedirectUrl = () => {
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    return 'http://hrpmg.costaatt.edu.tt:3000/auth/sso/microsoft';
  }
  return 'http://10.2.1.27:3000/auth/sso/microsoft';
};
