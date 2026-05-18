import "./Header.css"
import { Calendar, Clock, ClipboardList, Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Header({ cambiarVista, sidebarAbierto, toggleSidebar }) {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
      await logout();
      navigate('/login');
    };

    const navItems = isAdmin
      ? [
          { id: 'agendar', label: 'Agendar', icono: Calendar },
          { id: 'historial', label: 'Reservas', icono: Clock },
          { id: 'historialClinico', label: 'Historial Clínico', icono: ClipboardList },
        ]
      : [
          { id: 'agendar', label: 'Nueva Reserva', icono: Calendar },
          { id: 'historial', label: 'Mis Reservas', icono: Clock },
        ];

    return (
      <section className="header">
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
              {navItems.map(({ id, label, icono: Icono }) => (
                <div
                  key={id}
                  className="nav-item"
                  onClick={() => cambiarVista(id)}
                  title={label}
                >
                  <Icono className="nav-icon" />
                  <span className="nav-text">{label}</span>
                </div>
              ))}
            </nav>
          )}

          {sidebarAbierto && (
            <div className="user-section">
              {user && (
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  {isAdmin && <span className="text-xs text-gray-400">Psicólogo</span>}
                </div>
              )}
              <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
                <LogOut className="nav-icon" />
                <span className="nav-text">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </section>
    );
}
