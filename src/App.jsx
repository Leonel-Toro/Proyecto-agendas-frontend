import './App.css'
import Formulario from './components/Formulario/Formulario'
import Historial from './components/Historial/Historial'
import Header from './components/Header/Header'
import { useState } from 'react'
function App() {
	const [vista,setVista] = useState('agendar');
	function cambiarVista(vistaSeleccionada){
		setVista(vistaSeleccionada);
	}

	return (
		<>
			<header className="header-container">
				<Header cambiarVista={setVista}/>
			</header>        
			<main className="main-container mt-[50px]">
				{vista === 'agendar' && <Formulario />}
				{vista === 'historial' && <Historial />}
			</main>
		</>
	)
}

export default App
