import { createContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, clearTokens, getAccessToken } from '../api/apiClient';

// Crear el contexto
export const AuthContext = createContext(null);

/**
 * Proveedor del contexto de autenticación
 * Maneja el estado global de autenticación de la aplicación
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay usuario autenticado
  const isAuthenticated = !!user;

  /**
   * Verificar sesión activa al cargar la aplicación
   * Usa tokens almacenados en localStorage (compatible con Safari/iOS)
   */
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Verificar si hay token guardado antes de hacer la petición
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const response = await apiFetch('/auth/check-session');
      
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
        clearTokens(); // Limpiar tokens inválidos
      }
    } catch (err) {
      // Si falla (401 o error), no hay sesión activa
      setUser(null);
      clearTokens(); // Limpiar tokens inválidos
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Iniciar sesión
   * @param {Object} credentials - { usernameOrEmail, password }
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.user) {
        setUser(response.user);
      }

      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  /**
   * Registrar nuevo usuario
   * @param {Object} credentials - { username, email, password }
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  const register = async (credentials) => {
    try {
      setError(null);
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.user) {
        setUser(response.user);
      }

      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      // Aunque falle la petición, limpiamos el estado local
      console.error('Error al cerrar sesión:', err);
    } finally {
      clearTokens(); // Limpiar tokens de localStorage
      setUser(null);
      setError(null);
    }
  };

  /**
   * Limpiar errores
   */
  const clearError = () => {
    setError(null);
  };

  // Verificar sesión al montar el componente
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
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
