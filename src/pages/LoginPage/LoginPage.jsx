import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

const RUT_REGEX = /^\d{7,8}-[\dkK]$/;

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellidos: '',
    rut: '',
    telefono: '',
    genero: '',
    pacienteAnterior: false,
    estudiante: false,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormError('');
    clearError();
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormError('');
  };

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
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setFormError(response.message || 'Error al iniciar sesión');
      }
    } catch {
      setFormError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setFormError('Por favor completa todos los campos obligatorios');
      return;
    }
    if (!registerForm.nombre.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (!registerForm.apellidos.trim()) {
      setFormError('Los apellidos son obligatorios');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }
    if (registerForm.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (registerForm.rut && !RUT_REGEX.test(registerForm.rut)) {
      setFormError('El RUT debe tener el formato 12345678-9');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const { confirmPassword, ...payload } = registerForm;
      const response = await register(payload);
      if (response.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setFormError(response.message || 'Error al registrar usuario');
      }
    } catch {
      setFormError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>PsicoGestion</h1>
          <p>Bienvenido!, Inicia sesión o crea una cuenta para acceder.</p>
        </div>

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

        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}

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
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="button-spinner"></span>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Nombre de usuario <span className="required">*</span></label>
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
              <label htmlFor="nombre">Nombre <span className="required">*</span></label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={registerForm.nombre}
                onChange={handleRegisterChange}
                placeholder="Tu nombre"
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos <span className="required">*</span></label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={registerForm.apellidos}
                onChange={handleRegisterChange}
                placeholder="Tus apellidos"
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
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
              <label htmlFor="registerPassword">Contraseña <span className="required">*</span></label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Mínimo 8 caracteres"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña <span className="required">*</span></label>
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
            <div className="form-group">
              <label htmlFor="rut">RUT</label>
              <input
                type="text"
                id="rut"
                name="rut"
                value={registerForm.rut}
                onChange={handleRegisterChange}
                placeholder="12345678-9"
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={registerForm.telefono}
                onChange={handleRegisterChange}
                placeholder="+56 9 1234 5678"
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="genero">Género</label>
              <select
                id="genero"
                name="genero"
                value={registerForm.genero}
                onChange={handleRegisterChange}
                disabled={isSubmitting}
              >
                <option value="">Selecciona una opción</option>
                <option value="MASCULINO">Él</option>
                <option value="FEMENINO">Ella</option>
                <option value="PREFIERO_NO_DECIRLO">Prefiero no decirlo</option>
              </select>
            </div>
            <div className="form-group form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="pacienteAnterior"
                  checked={registerForm.pacienteAnterior}
                  onChange={handleRegisterChange}
                  disabled={isSubmitting}
                />
                ¿Ha tenido sesiones anteriormente?
              </label>
            </div>
            <div className="form-group form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="estudiante"
                  checked={registerForm.estudiante}
                  onChange={handleRegisterChange}
                  disabled={isSubmitting}
                />
                ¿Es estudiante?
              </label>
            </div>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="button-spinner"></span>
                  Registrando...
                </span>
              ) : 'Registrarse'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
