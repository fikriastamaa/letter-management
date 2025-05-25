import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils';

export const AuthContext = createContext();

// Don't set withCredentials globally since the backend is using wildcard CORS
// axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  // Simpan token di state
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);

  // Configure axios to use authorization header for every request when token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  }, [token]);

  useEffect(() => {
    // Check if user is already authenticated via token in localStorage
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        try {
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token validity with a simple request
          await axios.get(`${BASE_URL}/notes`);
          
          // If request succeeds, token is valid
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Stored token invalid, clearing auth data');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setAuthError('');
      const response = await axios.post(
        `${BASE_URL}/login`,
        { email, password }
      );

      if (response.data.accessToken) {
        // Store token and user info in localStorage
        localStorage.setItem('auth_token', response.data.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(response.data.safeUserData));
        setToken(response.data.accessToken);
        setUser(response.data.safeUserData);
        setIsAuthenticated(true);
        return true;
      } else {
        setAuthError('Login gagal. Email atau password salah.');
        return false;
      }
    } catch (error) {
      setAuthError(
        error.response?.data?.message ||
        'Login gagal. Email atau password salah.'
      );
      return false;
    }
  };

  // Register function
  const register = async (email, username, password) => {
    try {
      setAuthError('');
      const response = await axios.post(
        `${BASE_URL}/register`,
        { email, username, password }
      );

      if (response.status === 201) {
        return true;
      } else {
        setAuthError('Registrasi gagal. Silakan coba lagi.');
        return false;
      }
    } catch (error) {
      setAuthError(
        error.response?.data?.message ||
        'Registrasi gagal. Silakan coba lagi.'
      );
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setToken('');
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
      
      // Remove from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Clear Authorization header
      delete axios.defaults.headers.common['Authorization'];
      // Call backend logout endpoint
      await axios.get(`${BASE_URL}/logout`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Helper untuk request dengan Authorization header
  const authAxios = axios.create({
    baseURL: BASE_URL, // pastikan ini http://localhost:5000
  });
  authAxios.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Contoh penggunaan route yang sama:
  // authAxios.get('/surat-masuk')
  // authAxios.post('/surat-masuk', {...})
  // authAxios.patch('/surat-masuk/:id/status', {...})
  // authAxios.get('/jawaban-surat/:id')
  // authAxios.post('/jawaban-surat', {...})
  // authAxios.post('/login', {...})
  // authAxios.post('/register', {...})
  // authAxios.get('/logout')

  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    authError,
    token,
    authAxios,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};