import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import InputsForm from "../InputsForm/InputsForm";
import "./DetalleReservaModal.css";

export default function DetalleReservaModal({ reserva, modo = 'ver', onClose, onGuardar }) {
  const [formData, setFormData] = useState({
    nombreProducto: '',
    estado: '',
    fechaTermino: null,
    lugarEncuentro: '',
    precio: 0,
    abonado: 0,
    mensajePersonalizado: '',
  });
  const [errors, setErrors] = useState({
    nombreProducto: '',
    estado: '',
    precio: '',
    abonado: '',
    fechaTermino: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState({
    nombreProducto: false,
    estado: false,
    precio: false,
    abonado: false,
    fechaTermino: false,
  });

  useEffect(() => {
    if (reserva) {
      setFormData({
        nombreProducto: reserva.nombreProducto || '',
        estado: estadoStringAId(reserva.estado),
        fechaTermino: reserva.fechaTermino ? new Date(reserva.fechaTermino) : null,
        lugarEncuentro: reserva.lugarEncuentro || '',
        precio: reserva.precio || 0,
        abonado: reserva.abonado || 0,
        mensajePersonalizado: reserva.mensajePersonalizado || '',
      });
    }
  }, [reserva]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextState = { ...formData, [name]: value };

    setFormData(nextState);
    setTouched(prev => ({ ...prev, [name]: true }));

    validateField(name, value, nextState);

    // Revalida abono cuando cambia el precio para capturar n > precio
    if (name === 'precio') {
      validateField('abonado', nextState.abonado, nextState);
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      fechaTermino: date
    }));
    setTouched(prev => ({ ...prev, fechaTermino: true }));
    validateField('fechaTermino', date);
  };

  function validateField(name, value, nextState = {}) {
    let error = '';
    const precioActual = nextState.precio ?? formData.precio;
    if (name === 'nombreProducto') {
      if (!value || value.trim() === '') error = 'El nombre del producto es obligatorio';
    }
    if (name === 'estado') {
      if (!value || value === '' || value === '0') error = 'El estado es obligatorio';
    }
    if (name === 'abonado') {
      const n = Number(value);
      if (value === '' || isNaN(n)) { error = 'El abonado es obligatorio'; }
      else if (n < 0) { error = 'El abonado no puede ser negativo'; }
      else if (n > Number(precioActual)) {
        error = 'El abonado no puede ser mayor al precio';
      }
    }
    if (name === 'precio') {
      const n = Number(value);
      if (value === '' || isNaN(n)) error = 'El precio es obligatorio';
      else if (n < 1) error = 'El precio debe ser mayor o igual a 1';
    }
    if (name === 'fechaTermino') {
      if (!value) {
        error = '';
      } else {
        const fin = value instanceof Date ? value : new Date(value);
        const inicio = new Date(reserva?.fechaReserva);
        if (isNaN(fin.getTime())) error = 'Fecha de entrega inválida';
        else if (inicio && fin <= inicio) error = 'La entrega debe ser posterior a la reserva';
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  }

  const handleGuardar = async () => {
    if (onGuardar) {
      try {
        await onGuardar({
          ...reserva,
          ...formData,
          estado:formData.estado,
          precio: parseFloat(formData.precio) || reserva.precio,
          abonado: parseFloat(formData.abonado) || reserva.abonado,
        });
      } catch (e) {
        const mensaje = e?.message || 'Ha ocurrido un error al guardar';
        setErrorMessage(mensaje);
      }
    }
  };

  if (!reserva) return null;

  const estados = ['PENDIENTE', 'ABONADA', 'PAGADA', 'NO_CONCRETADA'];
  return (
    <div className="modal-overlay">
      {/* Modal de error flotante */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div className="bg-red-100 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-red-800 font-medium text-sm">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0" aria-label="Cerrar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="modal-content">
        {/* Header decorativo con círculos */}
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

        {/* Body con scroll */}
        <div className="modal-body">
          {/* Avatar e info del paciente */}
          <div className="patient-info">
            <div className="patient-details">
              <h3>{reserva.nombreCliente || 'N/A'}</h3>
              <p>Reserva #{reserva.id || 'N/A'}</p>
            </div>
          </div>

          {/* Información de solo lectura */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-900 break-all text-sm">{reserva.emailCliente || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <p className="text-gray-900 text-sm">{reserva.telefonoCliente || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medio
              </label>
              <p className="text-gray-900 text-sm">{reserva.medioCliente || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Reserva
              </label>
              <p className="text-gray-900 text-sm">{formatoFecha(reserva.fechaReserva)}</p>
            </div>
          </div>

          {/* Campos editables */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label-with-icon">
                  Nombre del Producto
                </label>
                {modo === 'ver' ? (
                  <p className="text-gray-900">{formData.nombreProducto || 'N/A'}</p>
                ) : (
                  <>
                    <input
                      type="text"
                      name="nombreProducto"
                      value={formData.nombreProducto}
                      onChange={handleInputChange}
                      placeholder="Ingrese nombre del producto"
                      className="input-field-custom"
                    />
                    {touched.nombreProducto && errors.nombreProducto && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.nombreProducto}</p>
                    )}
                  </>
                )}
              </div>
              <div>
                {modo === 'ver' ? (
                  <div>
                    <label className="input-label-with-icon">
                      Estado
                    </label>
                    <div className={`inline-block px-3 py-1 rounded-lg font-semibold ${getBadgeEstadoClass(formData.estado)}`}>
                      {formatearEstado(formData.estado)}
                    </div>
                  </div>
                ) : (
                  <>
                    <InputsForm
                      titulo="Estado"
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
            </div>
            <div>
              <label className="input-label-with-icon">
                Fecha de Entrega
              </label>
              {modo === 'ver' ? (
                <p className="text-gray-900">{formData.fechaTermino ? formatoFecha(formData.fechaTermino) : 'Sin especificar'}</p>
              ) : (
                <div className="space-y-3">
                  <div className="input-field-custom min-h-[48px] flex items-center">
                    {formData.fechaTermino ? format(formData.fechaTermino, "dd/MM/yyyy HH:mm", { locale: es }) : 'Seleccione fecha'}
                  </div>
                  <div className="w-full">
                    <DatePicker
                      selected={formData.fechaTermino}
                      onChange={handleDateChange}
                      showTimeSelect
                      timeIntervals={15}
                      timeFormat="HH:mm"
                      dateFormat="dd/MM/yyyy HH:mm"
                      locale={es}
                      inline
                      timeCaption="Hora"
                      className="w-full"
                      highlightDates={[{
                        "fecha-reserva-highlight": [new Date(reserva.fechaReserva)]
                      }]}
                    />
                  </div>
                  {touched.fechaTermino && errors.fechaTermino && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.fechaTermino}</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="input-label-with-icon">
                Lugar de Entrega
              </label>
              {modo === 'ver' ? (
                <p className="text-gray-900">{formData.lugarEncuentro || 'N/A'}</p>
              ) : (
                <input
                  type="text"
                  name="lugarEncuentro"
                  value={formData.lugarEncuentro}
                  onChange={handleInputChange}
                  placeholder="Ingrese lugar de entrega"
                  className="input-field-custom"
                />
              )}
            </div>
            <div>
              <label className="input-label-with-icon">
                Monto Abonado
              </label>
              {modo === 'ver' ? (
                <p className="text-gray-900 font-semibold">{formateaPrecio(formData.abonado)}</p>
              ) : (
                <>
                  <input
                    type="number"
                    name="abonado"
                    value={formData.abonado}
                    onChange={handleInputChange}
                    placeholder="Ingrese monto abonado"
                    min={1}
                    step={1}
                    className="input-field-custom"
                  />
                  {touched.abonado && errors.abonado && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.abonado}</p>
                  )}
                </>
              )}
            </div>
            <div>
              <label className="input-label-with-icon">
                Precio Total
              </label>
              {modo === 'ver' ? (
                <p className="text-gray-900 font-semibold">{formateaPrecio(formData.precio)}</p>
              ) : (
                <>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    placeholder="Ingrese precio"
                    min={1}
                    step={1}
                    className="input-field-custom"
                  />
                  {touched.precio && errors.precio && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.precio}</p>
                  )}
                </>
              )}
            </div>
            <div>
              <label className="input-label-with-icon">
                Mensaje Personalizado
              </label>
              {modo === 'ver' ? (
                <p className="text-gray-900">{formData.mensajePersonalizado || 'Sin mensaje'}</p>
              ) : (
                <textarea
                  name="mensajePersonalizado"
                  value={formData.mensajePersonalizado}
                  onChange={handleInputChange}
                  placeholder="Ingrese mensaje personalizado"
                  rows="4"
                  className="input-field-custom resize-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-cancelar"
          >
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

// Convierte string de estado a ID numérico para InputsForm
function estadoStringAId(estadoString) {
  const mapa = {
    'PENDIENTE': 1,
    'ABONADA': 2,
    'CANCELADA': 3,
    'NO_CONCRETADA': 4,
    'PAGADA': 5,
    'COMPLETADO': 6
  };
  return mapa[estadoString] || '';
}

// Convierte ID numérico a string de estado para el backend
function estadoIdAString(estadoId) {
  const mapa = {
    1: 'PENDIENTE',
    2: 'ABONADA',
    3: 'CANCELADA',
    4: 'NO_CONCRETADA',
    5: 'PAGADA',
    6: 'COMPLETADO'
  };
  return mapa[Number(estadoId)] || estadoId;
}

function formatoFecha(fecha) {
  if (!fecha) return 'N/A';
  const d = new Date(fecha);
  return isNaN(d.getTime()) ? String(fecha) : d.toLocaleString('es-CL');
}

function formatoFechaInput(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

// Formatea a valor compatible con input datetime-local (YYYY-MM-DDTHH:MM)
function formatoFechaInputDateTime(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// Parsea string de datetime-local a Date
function parseDateTimeLocal(value) {
  if (!value) return null;
  // value esperado: YYYY-MM-DDTHH:MM
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formateaPrecio(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}

function formatearEstado(estado) {
  // Convertir ID numérico a string si es necesario
  const estadoStr = typeof estado === 'number' ? estadoIdAString(estado) : estado;
  const estadosMap = {
    'PENDIENTE': 'Pendiente',
    'ABONADA': 'Abonada',
    'PAGADA': 'Pagada',
    'CANCELADA': 'Cancelada',
    'NO_CONCRETADA': 'No concretada',
    'COMPLETADO': 'Completado'
  };
  return estadosMap[estadoStr] || estadoStr;
}

function getEstadoClase(estado) {
  // Convertir ID numérico a string si es necesario
  const estadoStr = typeof estado === 'number' ? estadoIdAString(estado) : estado;
  const clasesMap = {
    'PENDIENTE': 'text-amber-600 bg-amber-50',
    'ABONADA': 'text-green-600 bg-green-50',
    'PAGADA': 'text-green-600 bg-green-50',
    'CANCELADA': 'text-red-600 bg-red-50',
    'NO_CONCRETADA': 'text-amber-700 bg-amber-50',
    'COMPLETADO': 'text-blue-600 bg-blue-50'
  };
  return clasesMap[estadoStr] || '';
}

function getBadgeEstadoClass(estado) {
  // Convertir ID numérico a string si es necesario
  const estadoStr = typeof estado === 'number' ? estadoIdAString(estado) : estado;
  const clasesMap = {
    'PENDIENTE': 'badge-pendiente',
    'ABONADA': 'badge-completada',
    'PAGADA': 'badge-completada',
    'CANCELADA': 'badge-cancelada',
    'NO_CONCRETADA': 'badge-cancelada',
    'COMPLETADO': 'badge-completada'
  };
  return clasesMap[estadoStr] || 'badge-pendiente';
}
