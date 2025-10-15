import axios from 'axios';

// API base URL - points to your existing NestJS backend
// Default assumes backend on port 3000, adjust via .env.local if different
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth store
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to get full image URL with authentication token
export const getImageUrl = (path: string): string => {
  if (!path) return '';

  let fullUrl = '';

  // If already a full URL, use as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    fullUrl = path;
  }
  // If it's a relative URL starting with /api, prepend the base domain
  else if (path.startsWith('/api')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // Remove /api from the base URL if it exists, then add the path
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
    fullUrl = `${cleanBaseUrl}${path}`;
  }
  // Otherwise, assume it's a path that needs full base URL
  else {
    fullUrl = `${API_BASE_URL}${path}`;
  }

  // Add authentication token as query parameter if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
    }
  }

  return fullUrl;
};

export default apiClient;