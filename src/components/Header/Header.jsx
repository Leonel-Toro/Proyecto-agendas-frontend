import "./Header.css"
import { Calendar, Clock, Sparkles, Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Header({ cambiarVista, sidebarAbierto, toggleSidebar }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
      await logout();
      navigate('/login');
    };

    return (
      <section className="header">
        {/* Botón hamburguesa para contraer/expandir */}
        <div className="header-top">
          <button 
            className="hamburger-btn"
            onClick={toggleSidebar}
            aria-label={sidebarAbierto ? "Contraer menú" : "Expandir menú"}
            title={sidebarAbierto ? "Contraer menú" : "Expandir menú"}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className={`header-content ${sidebarAbierto ? 'visible' : 'oculto'}`}>
          <div className="logo-section">
            {sidebarAbierto && <h1 className="logo-text"></h1>}
          </div>
          
          {sidebarAbierto && (
            <nav className="nav-menu">
              <div 
                className="nav-item"
                onClick={() => cambiarVista("agendar")}
                title="Agendar"
              >
                <Calendar className="nav-icon" />
                <span className="nav-text">Agendar</span>
              </div>
              <div 
                className="nav-item"
                onClick={() => cambiarVista("historial")}
                title="Historial"
              >
                <Clock className="nav-icon" />
                <span className="nav-text">Historial</span>
              </div>
            </nav>
          )}

          {/* Sección de usuario y logout */}
          {sidebarAbierto && (
            <div className="user-section">
              {user && (
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                </div>
              )}
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <LogOut className="nav-icon" />
                <span className="nav-text">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </section>
    )
}