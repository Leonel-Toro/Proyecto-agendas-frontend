import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

/**
 * Componente para rutas públicas (login/register)
 * Redirige al dashboard si ya hay sesión activa
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si NO hay sesión
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mientras verifica la sesión, mostrar loading
  if (isLoading) {
    return (
      <LoadingSpinner 
        fullScreen 
        size="lg" 
        message="Cargando..." 
      />
    );
  }

  // Si ya está autenticado, redirigir al dashboard o a la ruta guardada
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // Si no está autenticado, mostrar el contenido (login/register)
  return children;
}

export default PublicRoute;
