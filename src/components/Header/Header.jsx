import "./Header.css"
import { Calendar, Clock, Sparkles, Menu } from 'lucide-react'

export default function Header({ cambiarVista, sidebarAbierto, toggleSidebar }) {
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
        </div>
      </section>
    )
}