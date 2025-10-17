import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSSORedirectUrl } from '../lib/config';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('🚀 LoginPage: Starting login process...');
    
    try {
      console.log('🚀 LoginPage: Calling login function...');
      await login(email, password);
      console.log('✅ LoginPage: Login function completed successfully');
      console.log('🚀 LoginPage: Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.log('❌ LoginPage: Login failed with error:', err);
      console.log('❌ LoginPage: Error message:', err.message);
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  const handleSSOLogin = () => {
    // Redirect to Microsoft OAuth
    window.location.href = getSSORedirectUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            HR
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            COSTAATT HR Performance Gateway
          </h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-purple-600 hover:text-purple-500 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSSOLogin}
            className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#0078d4" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
            </svg>
            Sign in with Microsoft 365
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials (Click to auto-fill):</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@costaatt.edu.tt', 'P@ssw0rd!')}
              className="block hover:underline"
            >
              Admin: admin@costaatt.edu.tt / P@ssw0rd!
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('john.doe@costaatt.edu.tt', 'password123')}
              className="block hover:underline"
            >
              Supervisor: john.doe@costaatt.edu.tt / password123
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('mike.johnson@costaatt.edu.tt', 'password123')}
              className="block hover:underline"
            >
              Employee: mike.johnson@costaatt.edu.tt / password123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}