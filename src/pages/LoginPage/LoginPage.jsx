import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

/**
 * Página de Login y Registro con tabs
 */
function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Formulario de login
  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: '',
  });

  // Formulario de registro
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Cambiar de tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormError('');
    clearError();
  };

  // Manejar cambios en el formulario de login
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Manejar cambios en el formulario de registro
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Enviar formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginForm.usernameOrEmail || !loginForm.password) {
      setFormError('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await login({
        usernameOrEmail: loginForm.usernameOrEmail,
        password: loginForm.password,
      });

      if (response.success) {
        // Redirigir al dashboard o a la ruta guardada
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setFormError(response.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setFormError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enviar formulario de registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setFormError('Por favor completa todos los campos');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    if (registerForm.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });

      if (response.success) {
        // Redirigir al dashboard
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setFormError(response.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setFormError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo o título */}
        <div className="login-header">
          <h1>Agendas</h1>
          <p>Sistema de gestión de citas</p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
            type="button"
          >
            Iniciar Sesión
          </button>
          <button
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
            type="button"
          >
            Registrarse
          </button>
        </div>

        {/* Mensaje de error */}
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}

        {/* Formulario de Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Usuario o Email</label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={loginForm.usernameOrEmail}
                onChange={handleLoginChange}
                placeholder="Ingresa tu usuario o email"
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Ingresa tu contraseña"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="button-spinner"></span>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        )}

        {/* Formulario de Registro */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={registerForm.username}
                onChange={handleRegisterChange}
                placeholder="Elige un nombre de usuario"
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="Ingresa tu email"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword">Contraseña</label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Crea una contraseña"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="Confirma tu contraseña"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="button-spinner"></span>
                  Registrando...
                </span>
              ) : (
                'Registrarse'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
