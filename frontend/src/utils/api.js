import axios from 'axios';
import { toast } from 'react-hot-toast';

let isRedirectingToLogin = false;
let lastNetworkToastAt = 0;
const NETWORK_TOAST_COOLDOWN_MS = 10000;

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isColdStartLikeError = (error) => {
  // Axios timeout
  if (error?.code === 'ECONNABORTED') return true;

  // Network error (no response received)
  if (error?.request && !error?.response) return true;

  // Common gateway errors during cold start / spin-up
  const status = error?.response?.status;
  if (status === 502 || status === 503 || status === 504) return true;

  return false;
};

/**
 * Best-effort wake-up for Render (or other) cold starts.
 * Polls `/health` with short timeouts + backoff until success or deadline.
 */
export const wakeServer = async (options = {}) => {
  const {
    maxWaitMs = 25000,
    initialDelayMs = 0,
    attemptTimeoutMs = 8000,
    onAttempt,
  } = options;

  if (initialDelayMs > 0) await sleep(initialDelayMs);

  const startedAt = Date.now();
  let attempt = 0;

  // Backoff schedule (ms) keeps UX snappy without hammering
  const delays = [0, 750, 1250, 2000, 3000, 4000, 5000];

  while (Date.now() - startedAt < maxWaitMs) {
    attempt += 1;
    if (typeof onAttempt === 'function') {
      try {
        onAttempt({ attempt, elapsedMs: Date.now() - startedAt });
      } catch {
        // ignore callback errors
      }
    }

    try {
      // Use a short timeout so we can retry quickly during spin-up
      await api.get('/health', { timeout: attemptTimeoutMs, skipErrorToast: true, skipNetworkToast: true });
      return true;
    } catch (error) {
      if (!isColdStartLikeError(error)) {
        return false;
      }
      const delay = delays[Math.min(attempt - 1, delays.length - 1)];
      if (delay > 0) await sleep(delay);
    }
  }

  return false;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only add cache-busting timestamp for sensitive data endpoints
    // This prevents browser caching for real-time data while allowing
    // caching for static/cacheable endpoints
    const CACHE_BUST_ENDPOINTS = ['/auth/me', '/users/stats', '/users/profile', '/progress', '/users/preferences'];
    const shouldBustCache = CACHE_BUST_ENDPOINTS.some(ep => config.url.includes(ep));

    if (config.method === 'get' && shouldBustCache) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const skipErrorToast = !!error?.config?.skipErrorToast;
    const skipNetworkToast = !!error?.config?.skipNetworkToast;

    if (skipErrorToast) {
      return Promise.reject(error);
    }

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          
          // Only redirect to login if not already on auth pages.
          // /auth/callback handles its own error state — never hard-redirect from there.
          if (
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register') &&
            !window.location.pathname.includes('/auth/callback')
          ) {
            toast.error('Session expired. Please login again.', { id: 'session-expired' });

            if (!isRedirectingToLogin) {
              isRedirectingToLogin = true;
              window.location.href = '/login';
            }
          }
          break;

        case 403:
          // Forbidden - insufficient permissions
          toast.error(data.message || 'Access denied. Insufficient permissions.');
          break;

        case 404:
          // Not found
          if (!data.message?.includes('Route not found')) {
            toast.error(data.message || 'Resource not found.');
          }
          break;

        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;

        default:
          // Other errors
          if (data.message && !data.message.includes('validation')) {
            toast.error(data.message);
          }
          break;
      }
    } else if (error.request) {
      // Network error
      if (!skipNetworkToast) {
        const now = Date.now();
        if (now - lastNetworkToastAt > NETWORK_TOAST_COOLDOWN_MS) {
          toast.error('Network error. Please check your connection.', { id: 'network-error' });
          lastNetworkToastAt = now;
        }
      }
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    requestPasswordResetOtp: (email) => api.post('/auth/request-password-reset-otp', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    verifyToken: () => api.post('/auth/verify-token'),
  },

  // User endpoints
  users: {
    getProfile: (config = {}) => api.get('/users/profile', config),
    updateProfile: (data) => api.put('/users/profile', data),
    updatePreferences: (data) => api.put('/users/preferences', data),
    getStats: (config = {}) => api.get('/users/stats', config),
    deleteAccount: () => api.delete('/users/account'),
  },

  // Interview endpoints
  interviews: {
    create: (data) => api.post('/interviews', data),
    getAll: (params, config = {}) => api.get('/interviews', { params, ...config }),
    getById: (sessionId) => api.get(`/interviews/${sessionId}`),
    start: (sessionId) => api.post(`/interviews/${sessionId}/start`),
    submitAnswer: (sessionId, data) => api.post(`/interviews/${sessionId}/submit-answer`, data),
    complete: (sessionId) => api.post(`/interviews/${sessionId}/complete`),
  },

  // Coding endpoints
  coding: {
    getSession: (sessionId) => api.get(`/coding/session/${sessionId}`),
    execute: (data) => api.post('/coding/execute', data),
    getProgress: (sessionId, params) => api.get(`/coding/progress/${sessionId}`, { params }),
    saveProgress: (data) => api.post('/coding/save-progress', data),
    submit: (data) => api.post('/coding/submit', data),
  },

  // Realtime endpoints
  realtime: {
    executeCode: (data) => api.post('/realtime/execute-code', data),
    liveFeedback: (data) => api.post('/realtime/live-feedback', data),
    saveProgress: (data) => api.post('/realtime/save-progress', data),
    getSessionStatus: (sessionId) => api.get(`/realtime/session-status/${sessionId}`),
  },

  // AI endpoints
  ai: {
    generateQuestions: (data) => api.post('/ai/generate-questions', data),
    evaluateCode: (data) => api.post('/ai/evaluate-code', data),
    evaluateBehavioral: (data) => api.post('/ai/evaluate-behavioral', data),
    generatePreparationGuide: (data) => api.post('/ai/preparation-guide', data),
    getPersonalizedFeedback: (data) => api.post('/ai/personalized-feedback', data),
    generateFollowUpQuestions: (data) => api.post('/ai/follow-up-questions', data),
  },

  // AI Interview endpoints
  aiInterview: {
    startPersonalized: (data) => api.post('/ai-interview/start-personalized', data),
    start: (data) => api.post('/ai-interview/start', data),
    getSession: (sessionId) => api.get(`/ai-interview/session/${sessionId}`),
    respond: (data) => api.post('/ai-interview/respond', data),
    complete: (data) => api.post('/ai-interview/complete', data),
    hint: (data) => api.post('/ai-interview/hint', data)
  },

  // Quick Practice endpoints
  quickPractice: {
    getTopics: () => api.get('/quick-practice/topics'),
    start: (data) => api.post('/quick-practice/start', data),
    getSession: (sessionId) => api.get(`/quick-practice/session/${sessionId}`),
    submit: (sessionId, data) => api.post(`/quick-practice/session/${sessionId}/submit`, data),
    getResults: (sessionId) => api.get(`/quick-practice/session/${sessionId}/results`)
  },

  // Progress endpoints
  progress: {
    get: (config = {}) => api.get('/progress', config),
    updateActivity: (data) => api.post('/progress/update-activity', data),
    updateSkill: (data) => api.post('/progress/update-skill', data),
    getAnalytics: (params) => api.get('/progress/analytics', { params }),
    unlockAchievement: (data) => api.post('/progress/achievements', data),
  },

  // Preparation sheet endpoints
  preparationSheet: {
    get: (config = {}) => api.get('/preparation-sheet', config),
    toggle: (questionId, completed) =>
      api.patch(`/preparation-sheet/${questionId}/toggle`, typeof completed === 'boolean' ? { completed } : {}),
  },

  // MCQ Mock Interview endpoints
  mcq: {
    getTopics: () => api.get('/mcq/topics'),
    createSession: (data) => api.post('/mcq/create', data),
    getSession: (sessionId) => api.get(`/mcq/session/${sessionId}`),
    submitAnswer: (sessionId, data) => api.post(`/mcq/session/${sessionId}/answer`, data),
    completeSession: (sessionId) => api.post(`/mcq/session/${sessionId}/complete`),
    getResults: (sessionId) => api.get(`/mcq/session/${sessionId}/results`)
  },

  // Admin endpoints
  admin: {
    codingQuestions: {
      list: (params) => api.get('/admin/coding-questions', { params }),
      create: (data) => api.post('/admin/coding-questions', data),
      update: (id, data) => api.put(`/admin/coding-questions/${id}`, data),
      remove: (id) => api.delete(`/admin/coding-questions/${id}`),
      upload: (file) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/admin/coding-questions/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    quickPracticeQuestions: {
      list: (params) => api.get('/admin/quick-practice-questions', { params }),
      create: (data) => api.post('/admin/quick-practice-questions', data),
      update: (id, data) => api.put(`/admin/quick-practice-questions/${id}`, data),
      remove: (id) => api.delete(`/admin/quick-practice-questions/${id}`),
      importFile: (file) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/admin/quick-practice-questions/import', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    preparationSheet: {
      list: (params) => api.get('/admin/preparation-sheet', { params }),
      create: (data) => api.post('/admin/preparation-sheet', data),
      update: (id, data) => api.put(`/admin/preparation-sheet/${id}`, data),
      remove: (id) => api.delete(`/admin/preparation-sheet/${id}`),
      upload: (file) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/admin/preparation-sheet/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    }
  }
};

// Utility functions
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    toast.error('Failed to download file');
    throw error;
  }
};

// Health check
export const healthCheck = () => api.get('/health');

export const __internal = {
  isColdStartLikeError,
};

// Default export for direct axios usage (used by AuthContext)
export default api;
