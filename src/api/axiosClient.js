import axios from 'axios';

// Dynamically read the base URL from Vite environment variables, falling back to local dev
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Normalize URL: remove any accidental trailing slash
const baseURL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('satori_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized errors gracefully
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('satori_token');
      localStorage.removeItem('satori_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;