import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} - Objeto con el estado y funciones de autenticación
 * @throws {Error} - Si se usa fuera del AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
}

export default useAuth;
