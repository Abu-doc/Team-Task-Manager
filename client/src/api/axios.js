import axios from 'axios';

// 🌐 Create unified custom Axios deployment instance
const api = axios.create({
  // 💡 REPLACE THIS URL WITH YOUR ACTUAL GENERATED RAILWAY BACKEND LINK FROM YOUR DASHBOARD
  baseURL: 'team-task-manager-production-42e8.up.railway.app', 
  withCredentials: true,
});

// 🔒 REQUEST INTERCEPTOR: Inject Authorization Tokens Securely
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Sets standard bearer credentials on the outgoing header pipe
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🛡️ RESPONSE INTERCEPTOR: Global Session Sentinel & 401 Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Determine if the incoming error originated from an auth entrypoint
    const isAuthRoute = 
      error.config?.url?.includes('/auth/login') || 
      error.config?.url?.includes('/auth/register');

    // If an invalid session token hits a protected route, wipe memory and drop to gate
    if (error.response?.status === 401 && !isAuthRoute) {
      console.warn("Session credential invalidation intercepted. Flushing system profile metrics.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;