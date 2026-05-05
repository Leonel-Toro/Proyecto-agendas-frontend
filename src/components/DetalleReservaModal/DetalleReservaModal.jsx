import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import CalendarioHora from '../Formulario/CalendarioHora/CalendarioHora.jsx';
import InputsForm from "../InputsForm/InputsForm";
import { formateaPrecio, formateaFecha, formatearEstado, getBadgeEstadoClass } from '../../constants/estados';
import { useAuth } from '../../hooks/useAuth';
import "./DetalleReservaModal.css";

const INITIAL_FORM = {
  motivoConsulta: '',
  modalidad: '',
  duracionMinutos: 60,
  fechaReserva: null,
  fechaTermino: null,
  precio: 0,
  abonado: 0,
  estado: '',
};

export default function DetalleReservaModal({ reserva, modo = 'ver', onClose, onGuardar }) {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (reserva) {
      setFormData({
        motivoConsulta: reserva.motivoConsulta || '',
        modalidad: reserva.modalidad || '',
        duracionMinutos: reserva.duracionMinutos || 60,
        fechaReserva: reserva.fechaReserva ? new Date(reserva.fechaReserva) : null,
        fechaTermino: reserva.fechaTermino ? new Date(reserva.fechaTermino) : null,
        precio: reserva.precio || 0,
        abonado: reserva.abonado || 0,
        estado: reserva.estado || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [reserva]);

  function validateField(name, value, nextState = formData) {
    let error = '';
    const precio = Number(nextState.precio ?? formData.precio);

    if (name === 'modalidad') {
      if (!value) error = 'La modalidad es obligatoria';
    }
    if (name === 'duracionMinutos') {
      const n = Number(value);
      if (!n || n < 30 || n > 360 || n % 30 !== 0) error = 'Duración inválida';
    }
    if (name === 'fechaReserva') {
      if (!value) error = 'La fecha es obligatoria';
      else if (new Date(value) <= new Date()) error = 'La fecha debe ser futura';
    }
    if (name === 'estado' && isAdmin) {
      if (!value) error = 'El estado es obligatorio';
    }
    if (name === 'precio' && isAdmin) {
      const n = Number(value);
      if (isNaN(n) || n < 0) error = 'El precio debe ser mayor o igual a 0';
    }
    if (name === 'abonado' && isAdmin) {
      const n = Number(value);
      if (isNaN(n) || n < 0) error = 'El abonado debe ser mayor o igual a 0';
      else if (n > precio) error = 'El abonado no puede ser mayor al precio';
    }
    if (name === 'fechaTermino' && value) {
      const fin = value instanceof Date ? value : new Date(value);
      const inicio = new Date(reserva?.fechaReserva);
      if (isNaN(fin.getTime())) error = 'Fecha de término inválida';
      else if (inicio && fin <= inicio) error = 'La fecha de término debe ser posterior a la reserva';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value, next);
    if (name === 'precio') validateField('abonado', next.abonado, next);
  };

  const handleCalendarioChange = (fieldName) => ({ value }) => {
    const next = { ...formData, [fieldName]: value };
    setFormData(next);
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value, next);
  };

  const handleGuardar = async () => {
    const camposValidar = isAdmin
      ? ['modalidad', 'duracionMinutos', 'fechaReserva', 'estado', 'precio', 'abonado']
      : ['modalidad', 'duracionMinutos', 'fechaReserva'];

    const newTouched = camposValidar.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(prev => ({ ...prev, ...newTouched }));

    let hayErrores = false;
    camposValidar.forEach(field => {
      if (validateField(field, formData[field], formData)) hayErrores = true;
    });
    if (hayErrores) return;

    if (onGuardar) {
      try {
        await onGuardar({ ...reserva, ...formData });
      } catch (e) {
        setErrorMessage(e?.message || 'Ha ocurrido un error al guardar');
      }
    }
  };

  if (!reserva) return null;

  return (
    <div className="modal-overlay">
      {errorMessage && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div className="bg-red-100 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
            <div className="flex items-start justify-between gap-3">
              <p className="text-red-800 font-medium text-sm flex-1">{errorMessage}</p>
              <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="modal-content">
        <div className="modal-header-decorative">
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
          <div className="modal-header-content">
            <h2 className="modal-title">
              {modo === 'ver' ? 'Detalle de Reserva' : 'Editar Reserva'}
            </h2>
            <p className="modal-subtitle">
              {modo === 'ver' ? 'Información completa de la reserva' : 'Actualiza los detalles de la reserva'}
            </p>
          </div>
        </div>

        <div className="modal-body">
          {/* Info fija del paciente y psicólogo */}
          <div className="patient-info">
            <div className="patient-details">
              <h3>{reserva.pacienteNombre || 'N/A'}</h3>
              {reserva.pacienteRut && <p className="text-sm text-gray-500">{reserva.pacienteRut}</p>}
              <p>Reserva #{reserva.id || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Psicólogo</label>
              <p className="text-gray-900 text-sm">{reserva.psicologoNombre || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Reserva</label>
              <p className="text-gray-900 text-sm">{fmtFecha(reserva.fechaReserva)}</p>
            </div>
          </div>

          <div className="space-y-5" style={{ marginTop: '1rem' }}>

            {/* Motivo de consulta */}
            <div>
              <label className="input-label-with-icon">Motivo de Consulta</label>
              {modo === 'ver' ? (
                <p className="text-gray-900">{formData.motivoConsulta || 'Sin especificar'}</p>
              ) : (
                <textarea
                  name="motivoConsulta"
                  value={formData.motivoConsulta}
                  onChange={handleInputChange}
                  placeholder="Motivo de la consulta"
                  rows="3"
                  className="input-field-custom resize-none"
                />
              )}
            </div>

            {/* Modalidad y Duración */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label-with-icon">Modalidad</label>
                {modo === 'ver' ? (
                  <p className="text-gray-900">{formData.modalidad === 'PRESENCIAL' ? 'Presencial' : formData.modalidad === 'VIRTUAL' ? 'Virtual' : (formData.modalidad || 'N/A')}</p>
                ) : (
                  <>
                    <InputsForm
                      titulo=""
                      input="select"
                      name="modalidad"
                      value={formData.modalidad}
                      changePayload={handleInputChange}
                    />
                    {touched.modalidad && errors.modalidad && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.modalidad}</p>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="input-label-with-icon">Duración</label>
                {modo === 'ver' ? (
                  <p className="text-gray-900">{formData.duracionMinutos} min</p>
                ) : (
                  <>
                    <InputsForm
                      titulo=""
                      input="select"
                      name="duracionMinutos"
                      value={formData.duracionMinutos}
                      changePayload={handleInputChange}
                    />
                    {touched.duracionMinutos && errors.duracionMinutos && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.duracionMinutos}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Fecha de Reserva editable */}
            {modo === 'editar' && (
              <div>
                <label className="input-label-with-icon">Nueva Fecha</label>
                <div className="calendario-modal">
                  <CalendarioHora
                    name="fechaReserva"
                    value={formData.fechaReserva}
                    changePayload={handleCalendarioChange('fechaReserva')}
                  />
                  {touched.fechaReserva && errors.fechaReserva && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.fechaReserva}</p>
                  )}
                </div>
              </div>
            )}

            {/* Estado (badge en ver, select en editar admin) */}
            <div>
              <label className="input-label-with-icon">Estado</label>
              {modo === 'ver' || !isAdmin ? (
                <span className={`badge ${getBadgeEstadoClass(formData.estado)}`}>
                  {formatearEstado(formData.estado)}
                </span>
              ) : (
                <>
                  <InputsForm
                    titulo=""
                    input="select"
                    name="estado"
                    value={formData.estado}
                    changePayload={handleInputChange}
                  />
                  {touched.estado && errors.estado && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.estado}</p>
                  )}
                </>
              )}
            </div>

            {/* Precio y Abonado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label-with-icon">Precio</label>
                {modo === 'ver' || !isAdmin ? (
                  <p className="text-gray-900 font-semibold">{formateaPrecio(formData.precio)}</p>
                ) : (
                  <>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      placeholder="Precio total"
                      min={0}
                      className="input-field-custom"
                    />
                    {touched.precio && errors.precio && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.precio}</p>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="input-label-with-icon">Abonado</label>
                {modo === 'ver' || !isAdmin ? (
                  <p className="text-gray-900 font-semibold">{formateaPrecio(formData.abonado)}</p>
                ) : (
                  <>
                    <input
                      type="number"
                      name="abonado"
                      value={formData.abonado}
                      onChange={handleInputChange}
                      placeholder="Monto abonado"
                      min={0}
                      className="input-field-custom"
                    />
                    {touched.abonado && errors.abonado && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.abonado}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Fecha de Término (admin, editar) */}
            {isAdmin && modo === 'editar' && (
              <div>
                <label className="input-label-with-icon">Fecha de Término</label>
                <div className="calendario-modal">
                  <CalendarioHora
                    name="fechaTermino"
                    value={formData.fechaTermino}
                    changePayload={handleCalendarioChange('fechaTermino')}
                    highlightDates={reserva.fechaReserva ? [new Date(reserva.fechaReserva)] : []}
                  />
                  {touched.fechaTermino && errors.fechaTermino && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.fechaTermino}</p>
                  )}
                </div>
              </div>
            )}
            {isAdmin && modo === 'ver' && (
              <div>
                <label className="input-label-with-icon">Fecha de Término</label>
                <p className="text-gray-900">{formData.fechaTermino ? fmtFecha(formData.fechaTermino) : 'Sin especificar'}</p>
              </div>
            )}

          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancelar">
            {modo === 'ver' ? 'Cerrar' : 'Cancelar'}
          </button>
          {modo === 'editar' && (
            <button
              onClick={handleGuardar}
              disabled={Object.values(errors).some(e => e !== '')}
              className="btn-guardar"
            >
              Guardar Cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtFecha(fecha) {
  if (!fecha) return 'N/A';
  const d = new Date(fecha);
  return isNaN(d.getTime()) ? String(fecha) : d.toLocaleString('es-CL');
}
