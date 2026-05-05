import ModalExito from "../ModalExito/ModalExito"
import "./Formulario.css"
import "../../App.css"
import CalendarioHora from "./CalendarioHora/CalendarioHora"
import InputsForm from "../InputsForm/InputsForm"
import styles from "../InputsForm/InputsForm.module.css"
import { useState, useEffect } from "react"
import { apiPost, apiGet } from '../../api/apiClient'
import { useAuth } from '../../hooks/useAuth'

export default function Formulario() {
  const { isAdmin, user } = useAuth();

  function getInitialPayload() {
    return {
      psicologoId: isAdmin ? (user?.id ?? '') : '',
      pacienteId: !isAdmin ? (user?.id ?? '') : '',
      motivoConsulta: '',
      modalidad: '',
      duracionMinutos: 60,
      fechaReserva: new Date(),
      precio: !isAdmin ? (user?.estudiante ? 10000 : 15000) : 0,
      abonado: 0,
    };
  }

  const [payload, setPayload] = useState(getInitialPayload);
  const [psicologos, setPsicologos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setLoading(true);
    const endpoint = isAdmin ? '/admin/pacientes' : '/psicologos';
    const setter = isAdmin ? setPacientes : setPsicologos;

    apiGet(endpoint)
      .then(data => {
        const lista = Array.isArray(data?.entidad) ? data.entidad : (Array.isArray(data) ? data : []);
        setter(lista);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  function validateField(name, value, currentPayload = payload) {
    let error = '';
    switch (name) {
      case 'psicologoId':
        if (!isAdmin && (!value || Number(value) <= 0)) error = 'Debes seleccionar un psicólogo';
        break;
      case 'pacienteId':
        if (isAdmin && (!value || Number(value) <= 0)) error = 'Seleccionar el paciente es obligatorio';
        break;
      case 'modalidad':
        if (!value) error = 'La modalidad es obligatoria';
        break;
      case 'duracionMinutos': {
        const n = Number(value);
        if (!n || n < 30 || n > 360 || n % 30 !== 0) error = 'Duración inválida';
        break;
      }
      case 'fechaReserva':
        if (!value || new Date(value) <= new Date()) error = 'La fecha debe ser futura';
        break;
      case 'precio': {
        if (isAdmin) {
          const n = Number(value);
          if (isNaN(n) || n < 0) error = 'El precio debe ser mayor o igual a 0';
        }
        break;
      }
      case 'abonado': {
        if (isAdmin) {
          const n = Number(value);
          const precio = Number(currentPayload.precio);
          if (isNaN(n) || n < 0) error = 'El abonado debe ser mayor o igual a 0';
          else if (n > precio) error = 'El abonado no puede ser mayor al precio';
        }
        break;
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  }

  function handlePayload(inputEvent) {
    const name = inputEvent.target !== undefined ? inputEvent.target.name : inputEvent.name;
    let value = inputEvent.target !== undefined ? inputEvent.target.value : inputEvent.value;

    const nuevoPayload = { ...payload, [name]: value };
    setPayload(nuevoPayload);
    setTouched(prev => ({ ...prev, [name]: true }));

    Object.keys(nuevoPayload).forEach(fieldName => {
      if (touched[fieldName] || fieldName === name) {
        validateField(fieldName, nuevoPayload[fieldName], nuevoPayload);
      }
    });
  }

  async function enviarFormulario(e) {
    e.preventDefault();

    const camposRequeridos = ['modalidad', 'duracionMinutos', 'fechaReserva'];
    if (!isAdmin) camposRequeridos.push('psicologoId');
    if (isAdmin) camposRequeridos.push('pacienteId', 'precio', 'abonado');

    const newTouched = camposRequeridos.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(prev => ({ ...prev, ...newTouched }));

    let hayErrores = false;
    camposRequeridos.forEach(field => {
      const err = validateField(field, payload[field], payload);
      if (err) hayErrores = true;
    });

    if (hayErrores) {
      setErrorMessage('Por favor, corrige los errores del formulario');
      return;
    }

    const payloadNormalizado = {
      psicologoId: Number(payload.psicologoId),
      motivoConsulta: payload.motivoConsulta,
      modalidad: payload.modalidad,
      duracionMinutos: Number(payload.duracionMinutos),
      fechaReserva: payload.fechaReserva,
      precio: Number(payload.precio),
    };

    if (isAdmin) {
      payloadNormalizado.pacienteId = Number(payload.pacienteId);
      payloadNormalizado.abonado = Number(payload.abonado);
    }

    const endpoint = isAdmin ? '/admin/reservas' : '/reservas';

    try {
      const data = await apiPost(endpoint, payloadNormalizado);
      const mensajeRespuesta = data?.mensaje || 'La reserva se ha agendado correctamente';
      setMensajeExito(mensajeRespuesta);
      setModalExitoAbierto(true);
    } catch (error) {
      setErrorMessage(error.message || 'Error de conexión con el servidor');
    }
  }

  const handleCerrarModalExito = () => {
    setModalExitoAbierto(false);
    setMensajeExito('');
    setPayload(getInitialPayload());
    setErrors({});
    setTouched({});
  };

  if (loading) {
    return (
      <section className='formulario'>
        <div className="container-formulario">
          <div className="card">
            <div className="card-details flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-4 border-[#E8DFD0] border-t-[#4a4238] rounded-full animate-spin" />
              <p className="text-sm font-medium text-[#8C8174]">
                Cargando formulario...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='formulario'>
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-red-100 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
            <div className="flex items-start justify-between gap-3">
              <p className="text-red-800 font-medium text-sm flex-1">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container-formulario">
        <div className="card">
          <form>
            <div className="card-details">

              {/* Sección 1: Datos de la sesión */}
              <div className="mb-6">
                <div className="titulo-formulario bg-white/80 p-1 inline-flex items-center gap-2 shadow-md">
                  <span className="w-1.5 h-8 bg-[#4a4238] rounded-full"></span>
                  <span className="text-base font-bold text-gray-800 pr-3">Datos de la sesión</span>
                </div>
              </div>

              <div className="grid grid-cols-1 my-[1rem] gap-3">
                {/* Paciente: selector de psicólogos */}
                {!isAdmin && (
                  <div className="min-h-[95px]">
                    <div className="flex flex-col gap-1">
                      <label className={styles.inputLabel}>Psicólogo</label>
                      <select
                        name="psicologoId"
                        value={payload.psicologoId}
                        onChange={handlePayload}
                        className={`form-control ${styles.selectForm}`}
                      >
                        <option value="">Selecciona un psicólogo</option>
                        {psicologos.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellidos} — {p.email ?? p.correo ?? ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {touched.psicologoId && errors.psicologoId && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.psicologoId}</p>
                    )}
                  </div>
                )}

                {/* Admin: selector de pacientes */}
                {isAdmin && (
                  <div className="min-h-[95px]">
                    <div className="flex flex-col gap-1">
                      <label className={styles.inputLabel}>Paciente</label>
                      <select
                        name="pacienteId"
                        value={payload.pacienteId}
                        onChange={handlePayload}
                        className={`form-control ${styles.selectForm}`}
                      >
                        <option value="">Selecciona un paciente</option>
                        {pacientes.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellidos} — {p.email ?? p.correo ?? ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {touched.pacienteId && errors.pacienteId && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.pacienteId}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 my-[1rem] gap-3">
                <div className="min-h-[95px]">
                  <InputsForm
                    titulo="Modalidad"
                    input="select"
                    name="modalidad"
                    value={payload.modalidad}
                    changePayload={handlePayload}
                  />
                  {touched.modalidad && errors.modalidad && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.modalidad}</p>
                  )}
                </div>
                <div className="min-h-[95px]">
                  <InputsForm
                    titulo="Duración"
                    input="select"
                    name="duracionMinutos"
                    value={payload.duracionMinutos}
                    changePayload={handlePayload}
                  />
                  {touched.duracionMinutos && errors.duracionMinutos && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.duracionMinutos}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 my-[1rem] gap-3">
                <InputsForm
                  titulo="Motivo de consulta"
                  placeholder="Describe el motivo de la consulta..."
                  input="textarea"
                  name="motivoConsulta"
                  value={payload.motivoConsulta}
                  changePayload={handlePayload}
                />
              </div>

              {/* Sección 2: Fecha y hora */}
              <div className="mt-[2.5rem] mb-6">
                <div className="titulo-formulario bg-white/80 p-1 inline-flex items-center gap-2 shadow-md">
                  <span className="w-1.5 h-8 bg-[#4a4238] rounded-full"></span>
                  <span className="text-base font-bold text-gray-800 pr-3">Fecha y hora</span>
                </div>
              </div>

              <div className="grid grid-cols-1 my-[1rem] gap-3">
                <div>
                  <CalendarioHora
                    name="fechaReserva"
                    changePayload={handlePayload}
                    value={payload.fechaReserva}
                  />
                  {touched.fechaReserva && errors.fechaReserva && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.fechaReserva}</p>
                  )}
                </div>
              </div>

              {/* Precio y Abonado */}
              <div className={`grid gap-3 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div className="min-h-[95px]">
                  {isAdmin ? (
                    <>
                      <InputsForm
                        titulo="Precio"
                        type="number"
                        placeholder="Ej: 50000"
                        input="input"
                        name="precio"
                        value={payload.precio}
                        changePayload={handlePayload}
                      />
                      {touched.precio && errors.precio && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors.precio}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className={styles.inputLabel}>Precio</label>
                      <input
                        type="text"
                        className={styles.inputForm}
                        value={`$${Number(payload.precio).toLocaleString('es-CL')}`}
                        disabled
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-0.5 ml-1">
                        {user?.estudiante ? 'Tarifa estudiante' : 'Tarifa regular'}
                      </p>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="min-h-[95px]">
                    <InputsForm
                      titulo="Abonado"
                      type="number"
                      placeholder="Ej: 25000"
                      input="input"
                      name="abonado"
                      value={payload.abonado}
                      changePayload={handlePayload}
                    />
                    {touched.abonado && errors.abonado && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors.abonado}</p>
                    )}
                  </div>
                )}
              </div>

            </div>

            <div className="card-actions">
              <button
                className="px-8 py-3 bg-[#4a4238] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={enviarFormulario}
              >
                Reservar
              </button>
            </div>
          </form>
        </div>
      </div>

      {modalExitoAbierto && (
        <ModalExito mensaje={mensajeExito} onClose={handleCerrarModalExito} />
      )}
    </section>
  );
}
