import { CheckCircle } from 'lucide-react';
import './ModalExito.css';

export default function ModalExito({ mensaje, onClose }) {
  return (
    <div className="modal-exito-overlay">
      <div className="modal-exito-content">
        <div className="modal-exito-icon">
          <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={2} />
        </div>
        <h2 className="modal-exito-titulo">¡Éxito!</h2>
        <p className="modal-exito-mensaje">{mensaje}</p>
        <button
          onClick={onClose}
          className="modal-exito-boton"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
