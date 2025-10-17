import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Save
} from 'lucide-react';

export function ChangePasswordPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message) setMessage(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      checks: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate current password
      if (!formData.currentPassword) {
        throw new Error('Current password is required');
      }

      // Validate new password
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        throw new Error('New password does not meet requirements');
      }

      // Confirm passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      // Check if new password is different from current
      if (formData.currentPassword === formData.newPassword) {
        throw new Error('New password must be different from current password');
      }

      // Make API call to change password
      const response = await fetch(`http://10.2.1.27:3000/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(data.message || 'Failed to change password');
      }

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred while changing password' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.newPassword);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            <p className="mt-2 text-gray-600">Update your account password</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              {/* User Info */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`mb-6 p-4 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        message.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {formData.newPassword && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600">Password must contain:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center text-xs ${
                          passwordValidation.checks.minLength ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            passwordValidation.checks.minLength ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          At least 8 characters
                        </div>
                        <div className={`flex items-center text-xs ${
                          passwordValidation.checks.hasUpperCase ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            passwordValidation.checks.hasUpperCase ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          One uppercase letter
                        </div>
                        <div className={`flex items-center text-xs ${
                          passwordValidation.checks.hasLowerCase ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            passwordValidation.checks.hasLowerCase ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          One lowercase letter
                        </div>
                        <div className={`flex items-center text-xs ${
                          passwordValidation.checks.hasNumbers ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            passwordValidation.checks.hasNumbers ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          One number
                        </div>
                        <div className={`flex items-center text-xs ${
                          passwordValidation.checks.hasSpecialChar ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            passwordValidation.checks.hasSpecialChar ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          One special character
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10 ${
                        formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
