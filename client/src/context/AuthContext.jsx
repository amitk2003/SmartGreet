import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we check token

  // On app load: check if user has a valid saved token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('claasplus_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
      } catch {
        // Token invalid or expired – clear it
        localStorage.removeItem('claasplus_token');
        localStorage.removeItem('claasplus_user');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  /**
   * Save token + user to state and localStorage
   */
  const saveSession = (token, userData) => {
    localStorage.setItem('claasplus_token', token);
    setUser(userData);
  };

  /**
   * Register with email
   */
  const register = async ({ name, email, password, photo }) => {
    const { data } = await authAPI.register({ name, email, password, photo });
    saveSession(data.token, data.user);
    toast.success(`🎉 Welcome to GreetMaster, ${data.user.name}!`);
    return data.user;
  };

  /**
   * Login with email
   */
  const login = async ({ email, password }) => {
    const { data } = await authAPI.login({ email, password });
    saveSession(data.token, data.user);
    toast.success(`👋 Welcome back, ${data.user.name}!`);
    return data.user;
  };

  /**
   * Simulated Google login
   */
  const googleLogin = async () => {
    // In a real app, use Google OAuth SDK to get idToken, then verify on backend
    // For demo, we send fixed test Google user data
    const fakeGoogleProfile = {
      name: 'Amit Kumar',
      email: 'amit.kumar@gmail.com',
      photo: null,
    };
    const { data } = await authAPI.googleLogin(fakeGoogleProfile);
    saveSession(data.token, data.user);
    toast.success('✅ Signed in with Google!');
    return data.user;
  };

  /**
   * Guest login – no credentials needed
   */
  const guestLogin = async () => {
    const { data } = await authAPI.guestLogin();
    saveSession(data.token, data.user);
    toast.success('👤 Continuing as Guest');
    return data.user;
  };

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem('claasplus_token');
    setUser(null);
    toast.success('👋 Signed out successfully.');
  };

  /**
   * Update user state after profile update
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, guestLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
