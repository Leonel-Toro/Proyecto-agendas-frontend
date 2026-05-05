import { Routes, Route } from 'react-router-dom'
import './App.css'
import Formulario from './components/Formulario/Formulario'
import Historial from './components/Historial/Historial'
import HistorialClinico from './components/HistorialClinico/HistorialClinico'
import Header from './components/Header/Header'
import LoginPage from './pages/LoginPage/LoginPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import PublicRoute from './components/PublicRoute/PublicRoute'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'

function Dashboard() {
	const { isAdmin } = useAuth();
	const [vista, setVista] = useState('agendar');
	const [sidebarAbierto, setSidebarAbierto] = useState(window.innerWidth >= 1024);

	function toggleSidebar() {
		setSidebarAbierto(!sidebarAbierto);
	}

	useEffect(() => {
		const handleResize = () => {
			setSidebarAbierto(window.innerWidth >= 1024);
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
				{vista === 'historialClinico' && isAdmin && <HistorialClinico />}
			</main>
		</>
	);
}

function App() {
	return (
		<Routes>
			<Route
				path="/login"
				element={
					<PublicRoute>
						<LoginPage />
					</PublicRoute>
				}
			/>
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
