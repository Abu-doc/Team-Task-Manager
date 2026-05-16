import { createContext, useContext, useState, useEffect } from 'react';
// 💡 Linked directly to your custom instance inside client/src/api/axios.js
import api from '../api/axios'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication state on initialization/refresh
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const cachedUser = localStorage.getItem('user');
        const cachedToken = localStorage.getItem('token');

        if (cachedUser && cachedToken) {
          setUser(JSON.parse(cachedUser));
        }
      } catch (error) {
        console.error("Failed to parse cached terminal profile session:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 🔐 UNIFIED LOGIN CONTEXT ENGINE
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Connects cleanly via your custom Axios base url instance
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user: authenticatedUser } = response.data;
      
      // Lock credential states to local environment storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      setUser(authenticatedUser);
      return response.data;
    } catch (error) {
      console.error("Context layer authentication failure:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 📝 UNIFIED REGISTER CONTEXT ENGINE
  const register = async (registrationData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', registrationData);
      
      const { token, user: registeredUser } = response.data;
      
      // Auto-authenticate browser environment right away on successful compilation
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      
      setUser(registeredUser);
      return response.data;
    } catch (error) {
      console.error("Context layer registration failure:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 DE-AUTHENTICATION LOGOUT LINK
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an operational AuthProvider wrapper context.');
  }
  return context;
}