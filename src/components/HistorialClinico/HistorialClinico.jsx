import { useState, useEffect } from 'react';
import { apiGet } from '../../api/apiClient';
import { formateaFecha } from '../../constants/estados';
import DetalleHistorialModal from '../DetalleHistorialModal/DetalleHistorialModal';

export default function HistorialClinico() {
  const [pacienteId, setPacienteId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
  const [modoModal, setModoModal] = useState('ver');

  useEffect(() => {
    setLoadingPacientes(true);
    apiGet('/admin/pacientes')
      .then(data => {
        const lista = Array.isArray(data?.entidad) ? data.entidad : (Array.isArray(data) ? data : []);
        setPacientes(lista);
      })
      .catch(() => {})
      .finally(() => setLoadingPacientes(false));
  }, []);

  const buscar = async (e) => {
    e.preventDefault();
    if (!pacienteId || Number(pacienteId) <= 0) {
      setError('Selecciona un paciente válido');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let endpoint;
      if (desde && hasta) {
        const desdeISO = new Date(desde).toISOString();
        const hastaISO = new Date(hasta).toISOString();
        endpoint = `/admin/historial/paciente/${pacienteId}/rango?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`;
      } else {
        endpoint = `/admin/historial/paciente/${pacienteId}`;
      }
      const data = await apiGet(endpoint);
      const lista = Array.isArray(data?.entidad) ? data.entidad : [];
      setHistoriales(lista);
    } catch (e) {
      setError(e.message || 'Error al cargar los historiales');
    } finally {
      setLoading(false);
    }
  };

  const handleVer = (historial) => {
    setHistorialSeleccionado(historial);
    setModoModal('ver');
    setModalAbierto(true);
  };

  const handleEditar = (historial) => {
    setHistorialSeleccionado(historial);
    setModoModal('editar');
    setModalAbierto(true);
  };

  const handleNuevo = () => {
    setHistorialSeleccionado(null);
    setModoModal('crear');
    setModalAbierto(true);
  };

  const handleGuardado = (historialActualizado) => {
    if (modoModal === 'crear') {
      setHistoriales(prev => [historialActualizado, ...prev]);
    } else {
      setHistoriales(prev =>
        prev.map(h => h.idHistorial === historialActualizado.idHistorial ? historialActualizado : h)
      );
    }
    setModalAbierto(false);
    setHistorialSeleccionado(null);
  };

  return (
    <section className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Historial Clínico</h2>
          <p className="text-gray-500">Busca y gestiona el historial clínico de los pacientes</p>
        </div>

        {/* Filtros */}
        <form onSubmit={buscar} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Paciente *</label>
              {loadingPacientes ? (
                <div className="flex items-center gap-2 h-[38px]">
                  <div className="w-5 h-5 border-2 border-zinc-200 border-t-[#4a4238] rounded-full animate-spin flex-shrink-0" />
                  <span className="text-sm text-zinc-400">Cargando...</span>
                </div>
              ) : (
                <select
                  value={pacienteId}
                  onChange={e => setPacienteId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8B5A0]"
                >
                  <option value="">Selecciona un paciente</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellidos} — {p.email ?? p.correo ?? ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={e => setDesde(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8B5A0]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={e => setHasta(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8B5A0]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || loadingPacientes}
              className="px-6 py-2 bg-[#4a4238] text-white rounded-lg font-semibold hover:bg-[#3a3228] transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </form>

        {/* Acciones */}
        {historiales.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleNuevo}
              className="px-4 py-2 bg-[#A8B5A0] text-white rounded-lg font-semibold hover:bg-[#8fa587] transition-colors"
            >
              + Nuevo Historial
            </button>
          </div>
        )}

        {/* Tabla */}
        {historiales.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Paciente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Psicólogo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Tipo Sesión</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Crisis</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Alta</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historiales.map((h, idx) => (
                  <tr key={h.idHistorial || idx} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3">{h.pacienteNombre ?? 'N/A'}</td>
                    <td className="px-4 py-3">{h.psicologoNombre ?? 'N/A'}</td>
                    <td className="px-4 py-3">{fmtTipoSesion(h.tipoSesion)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${h.crisis ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {h.crisis ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${h.alta ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {h.alta ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formateaFecha(h.fechaCreacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVer(h)}
                          className="px-3 py-1 text-xs bg-[#A8B5A0] text-white rounded-lg hover:bg-[#8fa587] transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleEditar(h)}
                          className="px-3 py-1 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && pacienteId && (
            <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-600">
              <p>No se encontraron historiales para este paciente</p>
              <button
                onClick={handleNuevo}
                className="mt-4 px-4 py-2 bg-[#A8B5A0] text-white rounded-lg font-semibold hover:bg-[#8fa587] transition-colors"
              >
                + Crear Historial
              </button>
            </div>
          )
        )}
      </div>

      {modalAbierto && (
        <DetalleHistorialModal
          historial={historialSeleccionado}
          modo={modoModal}
          pacienteId={pacienteId}
          onClose={() => { setModalAbierto(false); setHistorialSeleccionado(null); }}
          onGuardado={handleGuardado}
        />
      )}
    </section>
  );
}

function fmtTipoSesion(tipo) {
  const map = {
    INICIAL: 'Inicial',
    SEGUIMIENTO: 'Seguimiento',
    CRISIS: 'Crisis',
    EVALUACION: 'Evaluación',
    CIERRE: 'Cierre',
  };
  return map[tipo] || tipo || 'N/A';
}
