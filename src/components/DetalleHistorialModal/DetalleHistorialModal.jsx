import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiPost, apiPut } from '../../api/apiClient';
import { TIPO_SESION_OPCIONES } from '../../constants/estados';

const INITIAL_FORM = {
  motivoConsulta: '',
  tipoSesion: '',
  crisis: false,
  alta: false,
  posibleAbandono: false,
  notasGenerales: '',
};

export default function DetalleHistorialModal({ historial, modo = 'ver', pacienteId, onClose, onGuardado }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (historial) {
      setFormData({
        idReserva: historial.idReserva,      
        notasGenerales: historial.notasGenerales,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
    setErrorMessage('');
  }, [historial, modo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  function validate() {
    const newErrors = {};
    if (modo === 'crear' && (!formData.idReserva || Number(formData.idReserva) <= 0)) {
      newErrors.idReserva = 'El ID de la reserva es obligatorio';
    }
    if (!formData.tipoSesion) newErrors.tipoSesion = 'El tipo de sesión es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleGuardar = async () => {
    if (!validate()) return;
    setGuardando(true);
    setErrorMessage('');
    try {
      let data;
      const payload = {
        motivoConsulta: formData.motivoConsulta,
        tipoSesion: formData.tipoSesion,
        crisis: formData.crisis,
        alta: formData.alta,
        posibleAbandono: formData.posibleAbandono,
        notasGenerales: formData.notasGenerales,
      };

      if (modo === 'crear') {
        const resp = await apiPost('/admin/historial', {
          idReserva: Number(formData.idReserva),
          ...payload,
        });
        data = resp?.entidad || resp;
      } else {
        const resp = await apiPut(`/admin/historial/${historial.idHistorial}`, payload);
        data = resp?.entidad || { ...historial, ...payload };
      }

      onGuardado?.(data);
    } catch (e) {
      setErrorMessage(e.message || 'Error al guardar el historial');
    } finally {
      setGuardando(false);
    }
  };

  const esVer = modo === 'ver';

  return (
    <div className="modal-overlay">
      {errorMessage && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className="bg-red-100 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
            <div className="flex items-start justify-between gap-3">
              <p className="text-red-800 font-medium text-sm flex-1">{errorMessage}</p>
              <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="modal-content" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="modal-header-decorative">
          <button onClick={onClose} className="modal-close-btn"><X className="w-6 h-6" /></button>
          <div className="modal-header-content">
            <h2 className="modal-title">
              {esVer ? 'Historial Clínico' : modo === 'crear' ? 'Nuevo Historial' : 'Editar Historial'}
            </h2>
            {historial && (
              <p className="modal-subtitle">{historial.pacienteNombre || ''}</p>
            )}
          </div>
        </div>

        <div className="modal-body">
          {/* Notas Generales */}
          <div className="mb-[1rem]">
            <label className="input-label-with-icon">Notas Generales</label>
            {esVer ? (
              <p className="text-gray-900 whitespace-pre-wrap">{formData.notasGenerales || 'Sin notas'}</p>
            ) : (
              <textarea
                name="notasGenerales"
                value={formData.notasGenerales}
                onChange={handleChange}
                rows="4"
                placeholder="Notas generales de la sesión..."
                className="input-field-custom resize-none"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancelar">
            {esVer ? 'Cerrar' : 'Cancelar'}
          </button>
          {!esVer && (
            <button
              onClick={handleGuardar}
              disabled={guardando || Object.values(errors).some(e => e)}
              className="btn-guardar"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtTipoSesion(tipo) {
  const map = {
    INICIAL: 'Inicial', SEGUIMIENTO: 'Seguimiento', CRISIS: 'Crisis',
    EVALUACION: 'Evaluación', CIERRE: 'Cierre',
  };
  return map[tipo] || tipo || 'N/A';
}
