import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SSOCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const error = urlParams.get('error');
    const message = urlParams.get('message');

    if (error) {
      console.error('SSO Error:', error, message);
      navigate(`/login?error=${error}&message=${encodeURIComponent(message || 'SSO authentication failed')}`);
      return;
    }

    if (token && userParam) {
      try {
        // Store the token
        localStorage.setItem('token', token);
        
        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));
        
        console.log('SSO authentication successful:', user);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error processing SSO callback:', error);
        navigate('/login?error=callback_processing_failed');
      }
    } else {
      console.error('Missing token or user data in SSO callback');
      navigate('/login?error=missing_callback_data');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing SSO Authentication</h2>
        <p className="text-gray-600">Please wait while we process your Microsoft 365 login...</p>
      </div>
    </div>
  );
}