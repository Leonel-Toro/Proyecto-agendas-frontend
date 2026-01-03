import './LoadingSpinner.css';

/**
 * Componente de carga con spinner animado
 * @param {Object} props
 * @param {string} props.size - Tamaño del spinner: 'sm', 'md', 'lg'
 * @param {string} props.message - Mensaje opcional a mostrar
 * @param {boolean} props.fullScreen - Si debe ocupar toda la pantalla
 */
function LoadingSpinner({ size = 'md', message = '', fullScreen = false }) {
  const containerClass = fullScreen 
    ? 'loading-spinner-container fullscreen' 
    : 'loading-spinner-container';

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
