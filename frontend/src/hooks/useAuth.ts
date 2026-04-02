import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const register = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.register({ email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
      setUser({ id: 0, email, created_at: new Date().toISOString() });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    register,
    login,
    logout
  };
};
