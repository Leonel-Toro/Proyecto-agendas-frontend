import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si no hay sesión activa
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si hay sesión
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mientras verifica la sesión, mostrar loading
  if (isLoading) {
    return (
      <LoadingSpinner 
        fullScreen 
        size="lg" 
        message="Verificando sesión..." 
      />
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    // Guardar la ruta actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
}

export default ProtectedRoute;
