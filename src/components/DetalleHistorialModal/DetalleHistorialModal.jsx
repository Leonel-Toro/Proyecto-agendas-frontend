import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiPost, apiPut, apiDelete } from '../../api/apiClient';
import { TIPO_SESION_OPCIONES } from '../../constants/estados';

const INITIAL_FORM = {
  idReserva: '',
  motivoConsulta: '',
  tipoSesion: '',
  crisis: false,
  alta: false,
  posibleAbandono: false,
  notasGenerales: '',
};

export default function DetalleHistorialModal({ historial, modo = 'ver', pacienteId, onClose, onGuardado }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (historial) {
      setFormData({
        idReserva: historial.idReserva || '',
        motivoConsulta: historial.motivoConsulta || '',
        tipoSesion: historial.tipoSesion || '',
        crisis: historial.crisis || false,
        alta: historial.alta || false,
        posibleAbandono: historial.posibleAbandono || false,
        notasGenerales: historial.notasGenerales || '',
      });
      setNotas(Array.isArray(historial.notasSesion) ? historial.notasSesion : []);
    } else {
      setFormData(INITIAL_FORM);
      setNotas([]);
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

  const handleAgregarNota = async () => {
    if (!nuevaNota.trim() || !historial?.idHistorial) return;
    try {
      const resp = await apiPost(`/admin/historial/${historial.idHistorial}/notas`, { nota: nuevaNota.trim() });
      const notaCreada = resp?.entidad || { nota: nuevaNota.trim(), idNota: Date.now(), fechaCreacion: new Date().toISOString() };
      setNotas(prev => [...prev, notaCreada]);
      setNuevaNota('');
    } catch (e) {
      setErrorMessage(e.message || 'Error al agregar la nota');
    }
  };

  const handleEliminarNota = async (idNota) => {
    try {
      await apiDelete(`/admin/historial/notas/${idNota}`);
      setNotas(prev => prev.filter(n => n.idNota !== idNota));
    } catch (e) {
      setErrorMessage(e.message || 'Error al eliminar la nota');
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

        <div className="modal-body space-y-5">

          {/* ID Reserva (solo crear) */}
          {modo === 'crear' && (
            <div>
              <label className="input-label-with-icon">ID de la Reserva *</label>
              <input
                type="number"
                name="idReserva"
                value={formData.idReserva}
                onChange={handleChange}
                placeholder="Ej: 12"
                min={1}
                className="input-field-custom"
              />
              {errors.idReserva && <p className="text-red-500 text-xs mt-1">{errors.idReserva}</p>}
            </div>
          )}

          {/* Tipo de Sesión */}
          <div>
            <label className="input-label-with-icon">Tipo de Sesión *</label>
            {esVer ? (
              <p className="text-gray-900">{fmtTipoSesion(formData.tipoSesion)}</p>
            ) : (
              <>
                <select
                  name="tipoSesion"
                  value={formData.tipoSesion}
                  onChange={handleChange}
                  className="input-field-custom"
                >
                  <option value="">Selecciona una opción</option>
                  {TIPO_SESION_OPCIONES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.tipoSesion && <p className="text-red-500 text-xs mt-1">{errors.tipoSesion}</p>}
              </>
            )}
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'crisis', label: 'Crisis' },
              { name: 'alta', label: 'Alta' },
              { name: 'posibleAbandono', label: 'Posible abandono' },
            ].map(({ name, label }) => (
              <div key={name} className="flex items-center gap-2">
                {esVer ? (
                  <>
                    <span className={`w-4 h-4 rounded border ${formData[name] ? 'bg-[#A8B5A0] border-[#A8B5A0]' : 'border-gray-300'}`}></span>
                    <span className="text-sm text-gray-700">{label}</span>
                  </>
                ) : (
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name]}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    {label}
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Motivo de Consulta */}
          <div>
            <label className="input-label-with-icon">Motivo de Consulta</label>
            {esVer ? (
              <p className="text-gray-900">{formData.motivoConsulta || 'Sin especificar'}</p>
            ) : (
              <textarea
                name="motivoConsulta"
                value={formData.motivoConsulta}
                onChange={handleChange}
                rows="3"
                placeholder="Motivo de la consulta..."
                className="input-field-custom resize-none"
              />
            )}
          </div>

          {/* Notas Generales */}
          <div>
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

          {/* Notas de Sesión */}
          {historial && (
            <div>
              <label className="input-label-with-icon">Notas de Sesión</label>
              <div className="space-y-2 mb-3">
                {notas.length === 0 && (
                  <p className="text-sm text-gray-500">Sin notas de sesión</p>
                )}
                {notas.map((n) => (
                  <div key={n.idNota} className="flex items-start justify-between gap-2 bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                    <p className="text-sm text-gray-700 flex-1">{n.nota}</p>
                    {!esVer && (
                      <button
                        onClick={() => handleEliminarNota(n.idNota)}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!esVer && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevaNota}
                    onChange={e => setNuevaNota(e.target.value)}
                    placeholder="Agregar nota..."
                    className="input-field-custom flex-1"
                    onKeyDown={e => e.key === 'Enter' && handleAgregarNota()}
                  />
                  <button
                    onClick={handleAgregarNota}
                    disabled={!nuevaNota.trim()}
                    className="px-3 py-2 bg-[#A8B5A0] text-white rounded-lg hover:bg-[#8fa587] transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
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
