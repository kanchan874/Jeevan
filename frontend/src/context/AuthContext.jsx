import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jeevan_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile if token exists on app startup
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data && res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[Load User Error]', err.response?.data?.message || err.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register local user
  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data && res.data.success) {
        localStorage.setItem('jeevan_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || (err.code === 'ERR_NETWORK' || !err.response ? 'Server disconnected: Please ensure backend server is running on port 5000.' : 'Registration failed');
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Login local user
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        localStorage.setItem('jeevan_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || (err.code === 'ERR_NETWORK' || !err.response ? 'Server disconnected: Please ensure backend server is running on port 5000.' : 'Invalid credentials');
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Mock Google OAuth bypass
  const googleLoginMock = async (googlePayload) => {
    setError(null);
    try {
      const res = await api.post('/auth/google/mock', googlePayload);
      if (res.data && res.data.success) {
        localStorage.setItem('jeevan_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google Auth failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Update Profile details
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await api.put('/users/profile', profileData);
      if (res.data && res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Submit Donor Health Checkup
  const submitHealthCheckup = async (checkupData) => {
    setError(null);
    try {
      const res = await api.post('/users/health-checkup', checkupData);
      if (res.data && res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Health checkup submission failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Toggle Donor availability
  const toggleAvailability = async () => {
    try {
      const res = await api.put('/users/availability');
      if (res.data && res.data.success) {
        setUser((prev) => ({
          ...prev,
          isAvailable: res.data.isAvailable
        }));
        return { success: true };
      }
    } catch (err) {
      console.error('Toggle availability failed:', err);
      return { success: false };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('jeevan_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        googleLoginMock,
        updateProfile,
        submitHealthCheckup,
        toggleAvailability,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
