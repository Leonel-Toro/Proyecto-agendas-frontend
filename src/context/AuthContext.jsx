import { createContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, clearTokens, getAccessToken } from '../api/apiClient';

export const AuthContext = createContext(null);

function normalizeResponse(response) {
  const userData = response?.user || response?.entidad;
  const isSuccess =
    response?.success === true ||
    (typeof response?.code === 'number' && response.code >= 200 && response.code < 300);
  const message = response?.mensaje || response?.message || '';
  return { isSuccess, userData, message, raw: response };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const response = await apiFetch('/auth/check-session');
      const { isSuccess, userData } = normalizeResponse(response);
      if (isSuccess && userData) {
        setUser(userData);
      } else {
        setUser(null);
        clearTokens();
      }
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const { isSuccess, userData, message } = normalizeResponse(response);
      if (isSuccess && userData) {
        setUser(userData);
      }
      return { success: isSuccess, user: userData, message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (credentials) => {
    try {
      setError(null);
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const { isSuccess, userData, message } = normalizeResponse(response);
      if (isSuccess && userData) {
        setUser(userData);
      }
      return { success: isSuccess, user: userData, message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      clearTokens();
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    error,
    login,
    register,
    logout,
    checkSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
