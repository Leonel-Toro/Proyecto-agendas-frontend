import './App.css'
import Formulario from './components/Formulario/Formulario'
import Historial from './components/Historial/Historial'
import Header from './components/Header/Header'
import { useState, useEffect } from 'react'

function App() {
	const [vista, setVista] = useState('agendar');
	const [sidebarAbierto, setSidebarAbierto] = useState(window.innerWidth >= 1024);
	
	function cambiarVista(vistaSeleccionada) {
		setVista(vistaSeleccionada);
	}

	function toggleSidebar() {
		setSidebarAbierto(!sidebarAbierto);
	}

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width >= 768) {
				setSidebarAbierto(true);
			} else {
				setSidebarAbierto(false);
			}
		};

		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<>
			<header className={`header-container ${sidebarAbierto ? 'abierto' : 'cerrado'}`}>
				<Header 
					cambiarVista={setVista} 
					sidebarAbierto={sidebarAbierto}
					toggleSidebar={toggleSidebar}
				/>
			</header>        
			<main className={`main-container ${sidebarAbierto ? 'sidebar-abierto' : 'sidebar-cerrado'}`}>
				{vista === 'agendar' && <Formulario />}
				{vista === 'historial' && <Historial />}
			</main>
		</>
	)
}

export default App
