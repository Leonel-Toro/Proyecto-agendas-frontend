import { Routes, Route } from 'react-router-dom'
import './App.css'
import Formulario from './components/Formulario/Formulario'
import Historial from './components/Historial/Historial'
import Header from './components/Header/Header'
import LoginPage from './pages/LoginPage/LoginPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import PublicRoute from './components/PublicRoute/PublicRoute'
import { useState, useEffect } from 'react'

// Componente Dashboard (contenido protegido)
function Dashboard() {
	const [vista, setVista] = useState('agendar');
	const [sidebarAbierto, setSidebarAbierto] = useState(window.innerWidth >= 1024);

	function toggleSidebar() {
		setSidebarAbierto(!sidebarAbierto);
	}

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width >= 1024) {
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
	);
}

function App() {
	return (
		<Routes>
			{/* Rutas públicas (solo accesibles sin sesión) */}
			<Route 
				path="/login" 
				element={
					<PublicRoute>
						<LoginPage />
					</PublicRoute>
				} 
			/>

			{/* Rutas protegidas (requieren autenticación) */}
			<Route 
				path="/*" 
				element={
					<ProtectedRoute>
						<Dashboard />
					</ProtectedRoute>
				} 
			/>
		</Routes>
	)
}

export default App
