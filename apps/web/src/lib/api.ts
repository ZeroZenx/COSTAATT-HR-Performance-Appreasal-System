import axios from 'axios';
import { ApiResponse } from '@costaatt/shared';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data, error.config?.url);
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => {
    return api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: any }>>('/auth/login', {
      email,
      password,
    });
  },
  
  register: (userData: any) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: any }>>('/auth/register', userData),
  
  ssoLogin: (email: string, name: string, azureId: string, groups: string[] = []) => {
    return api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: any }>>('/auth/sso', {
      email,
      name,
      azureId,
      groups,
    });
  },
  
  getProfile: () =>
    api.get<ApiResponse<any>>('/auth/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    }),
  
  resetPassword: (email: string) =>
    api.post<ApiResponse<void>>('/auth/reset-password', { email }),
};


// Users API
export const usersApi = {
  getAll: (params?: any) =>
    api.get<ApiResponse<any[]>>('/users', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/users/${id}`),
  
  getSubordinates: () =>
    api.get<ApiResponse<any[]>>('/users/subordinates'),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/users/${id}`),
};

// Employees API
export const employeesApi = {
  getAll: (params?: any) =>
    api.get<ApiResponse<any[]>>('/employees', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/employees/${id}`),
  
  getDepartments: () =>
    api.get<ApiResponse<string[]>>('/employees/departments'),
  
  getDivisions: () =>
    api.get<ApiResponse<string[]>>('/employees/divisions'),
  
  getEmploymentTypes: () =>
    api.get<ApiResponse<string[]>>('/employees/employment-types'),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/employees', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/employees/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/employees/${id}`),
};

// Appraisal Cycles API
export const cyclesApi = {
  getAll: () =>
    api.get<ApiResponse<any[]>>('/cycles'),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/cycles/${id}`),
  
  getActive: () =>
    api.get<ApiResponse<any>>('/cycles/active'),
  
  getStats: (id: string) =>
    api.get<ApiResponse<any>>(`/cycles/${id}/stats`),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/cycles', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/cycles/${id}`, data),
  
  activate: (id: string) =>
    api.put<ApiResponse<any>>(`/cycles/${id}/activate`),
  
  close: (id: string) =>
    api.put<ApiResponse<any>>(`/cycles/${id}/close`),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/cycles/${id}`),
};

// Appraisal Templates API
export const templatesApi = {
  getAll: () =>
    api.get<ApiResponse<any[]>>('/templates'),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/templates/${id}`),
  
  getByType: (type: string) =>
    api.get<ApiResponse<any[]>>(`/templates/type/${type}`),
  
  getDefaults: () =>
    api.get<ApiResponse<any[]>>('/templates/defaults'),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/templates', data),
  
  createDefaults: () =>
    api.post<ApiResponse<any[]>>('/templates/create-defaults'),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/templates/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/templates/${id}`),
};

// Appraisals API
export const appraisalsApi = {
  getAll: (params?: any) =>
    api.get<ApiResponse<any[]>>('/appraisals', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/appraisals/${id}`),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/appraisals', data),
  
  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<any>>(`/appraisals/${id}/status`, { status }),
  
  submitForAck: (id: string) =>
    api.post<ApiResponse<any>>(`/appraisals/${id}/submit-for-ack`),
  
  sign: (id: string, role: string) =>
    api.post<ApiResponse<any>>(`/appraisals/${id}/sign`, { role }),
  
  updateCriterionScore: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/appraisals/${id}/criteria`, data),
  
  getScore: (id: string) =>
    api.get<ApiResponse<any>>(`/appraisals/${id}/score`),
  
  addEvidence: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/appraisals/${id}/evidence`, data),
  
  addComment: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/appraisals/${id}/comments`, data),
  
  addGoal: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/appraisals/${id}/goals`, data),
  
  updateGoal: (id: string, goalId: string, data: any) =>
    api.put<ApiResponse<any>>(`/appraisals/${id}/goals/${goalId}`, data),
  
  addMidYear: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/appraisals/${id}/midyear`, data),
  
  updateMidYear: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/appraisals/${id}/midyear`, data),
};

// Competencies API
export const competenciesApi = {
  getAll: (params?: any) =>
    api.get<ApiResponse<any[]>>('/competencies', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/competencies/${id}`),
  
  getDepartments: () =>
    api.get<ApiResponse<string[]>>('/competencies/departments'),
  
  getStats: () =>
    api.get<ApiResponse<any>>('/competencies/stats'),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/competencies', data),
  
  bulkCreate: (data: any[]) =>
    api.post<ApiResponse<any>>('/competencies/bulk', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/competencies/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/competencies/${id}`),
};


// Storage API
export const storageApi = {
  getPresignedUrl: (key: string, contentType: string) =>
    api.post<ApiResponse<{ url: string }>>('/storage/presigned-url', { key, contentType }),
};

// PDF API
export const pdfApi = {
  getAppraisalPdf: (id: string) =>
    api.get(`/pdf/appraisal/${id}`, { responseType: 'blob' }),
  
  getGoalsPdf: (id: string) =>
    api.get(`/pdf/goals/${id}`, { responseType: 'blob' }),
  
  getMidYearPdf: (id: string) =>
    api.get(`/pdf/midyear/${id}`, { responseType: 'blob' }),
};

// Appraisal Instances API
export const appraisalInstancesApi = {
  getAll: (params?: any) =>
    api.get<ApiResponse<any[]>>('/appraisal-instances', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/appraisal-instances/${id}`),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/appraisal-instances', data),
  
  updateSections: (id: string, sections: any[]) =>
    api.put<ApiResponse<any>>(`/appraisal-instances/${id}/sections`, { sections }),
  
  submitForReview: (id: string) =>
    api.post<ApiResponse<any>>(`/appraisal-instances/${id}/submit`),
  
  finalize: (id: string) =>
    api.post<ApiResponse<any>>(`/appraisal-instances/${id}/finalize`),
  
  getTemplates: () =>
    api.get<ApiResponse<any[]>>('/appraisal-instances/templates'),
  
  getCycles: () =>
    api.get<ApiResponse<any[]>>('/appraisal-instances/cycles'),
  
  addEvidence: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/appraisal-instances/${id}/evidence`, data),
  
  addComment: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/appraisal-instances/${id}/comments`, data),
};

// Settings API
export const settingsApi = {
  // System Stats
  getSystemStats: () => api.get<ApiResponse<any>>('/settings/stats'),
  
  // Appraisal Cycles
  getCycles: () => api.get<ApiResponse<any>>('/settings/cycles'),
  createCycle: (data: any) => api.post<ApiResponse<any>>('/settings/cycles', data),
  updateCycle: (id: string, data: any) => api.put<ApiResponse<any>>(`/settings/cycles/${id}`, data),
  activateCycle: (id: string) => api.put<ApiResponse<any>>(`/settings/cycles/${id}/activate`),
  closeCycle: (id: string) => api.put<ApiResponse<any>>(`/settings/cycles/${id}/close`),
  
  // Templates
  getTemplates: () => api.get<ApiResponse<any>>('/settings/templates'),
  createTemplate: (data: any) => api.post<ApiResponse<any>>('/settings/templates', data),
  updateTemplate: (id: string, data: any) => api.put<ApiResponse<any>>(`/settings/templates/${id}`, data),
  
  // Users
  getUsers: () => api.get<ApiResponse<any>>('/settings/users'),
  updateUserRole: (id: string, role: string) => api.put<ApiResponse<any>>(`/settings/users/${id}/role`, { role }),
  updateUserStatus: (id: string, active: boolean) => api.put<ApiResponse<any>>(`/settings/users/${id}/status`, { active }),
  
  // Import/Export
  getImportJobs: () => api.get<ApiResponse<any>>('/settings/import-jobs'),
  getImportErrors: (jobId: string) => api.get<ApiResponse<any>>(`/settings/import-jobs/${jobId}/errors`),
  
  // SSO
  getSSOConfig: () => api.get<ApiResponse<any>>('/settings/sso'),
  updateSSOConfig: (config: any) => api.put<ApiResponse<any>>('/settings/sso', config),
  
  // Audit
  getAuditLogs: (filters?: any) => api.get<ApiResponse<any>>('/settings/audit-logs', { params: filters }),
  
  // System Config
  getSystemConfig: () => api.get<ApiResponse<any>>('/settings/system-config'),
  updateSystemConfig: (config: any) => api.put<ApiResponse<any>>('/settings/system-config', config),
  
  // Backup
  getBackupStatus: () => api.get<ApiResponse<any>>('/settings/backup'),
  createBackup: () => api.post<ApiResponse<any>>('/settings/backup'),
};

// Reports API
export const reportsApi = {
  getPerformanceScores: (filters: { cycleId?: string; department?: string }) => 
    api.get<ApiResponse<any>>('/settings/reports/performance-scores', { params: filters }),
  getCompletionRates: (filters: { cycleId?: string; department?: string }) => 
    api.get<ApiResponse<any>>('/settings/reports/completion-rates', { params: filters }),
  getDepartmentBreakdown: (filters: { cycleId?: string }) => 
    api.get<ApiResponse<any>>('/settings/reports/department-breakdown', { params: filters }),
  getCycles: () => api.get<ApiResponse<any>>('/settings/reports/cycles'),
  getDepartments: () => api.get<ApiResponse<any>>('/settings/reports/departments'),
};

export const chatbotApi = {
  askQuestion: (data: { question: string; userRole: string }) =>
    api.post<ApiResponse<any>>('/chatbot/ask', data),
  getFAQs: (role?: string) => api.get<ApiResponse<any>>('/chatbot/faqs', { params: { role } }),
  getUnansweredQuestions: () => api.get<ApiResponse<any>>('/chatbot/unanswered'),
};

// Audit API
export const auditApi = {
  getAuditLogs: (filters?: {
    entity?: string;
    action?: string;
    actorId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<any>>('/audit/logs', { params: filters }),
  getAuditStats: (period?: 'day' | 'week' | 'month') => 
    api.get<ApiResponse<any>>('/audit/stats', { params: { period } }),
};

// Import API
export const importApi = {
  importEmployees: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<any>>('/import/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  importGeneralStaffTemplate: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<any>>('/import/templates/general-staff', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  importExecutiveTemplate: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<any>>('/import/templates/executive', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

