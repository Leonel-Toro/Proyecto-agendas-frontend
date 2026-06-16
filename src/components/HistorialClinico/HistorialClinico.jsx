import { useState, useEffect } from 'react';
import { apiGet } from '../../api/apiClient';
import { formateaFecha } from '../../constants/estados';
import NotasSesion from '../NotasSesion/NotasSesion';
import { Search, StickyNote, ClipboardList } from 'lucide-react';
import '../Historial/Historial.css';
import '../DetalleHistorial/DetalleHistorial.css';

const TIPO_SESION_LABELS = {
  INICIAL: 'Inicial',
  SEGUIMIENTO: 'Seguimiento',
  CRISIS: 'Crisis',
  EVALUACION: 'Evaluación',
  CIERRE: 'Cierre',
};

export default function HistorialClinico() {
  const [pacienteId, setPacienteId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState('');
  const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
  const [buscado, setBuscado] = useState(false);

  useEffect(() => {
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
    setError('');

    if (!pacienteId || Number(pacienteId) <= 0) {
      setError('Selecciona un paciente para buscar su historial');
      return;
    }

    setLoading(true);
    setBuscado(true);

    try {
      let data;
      if (desde && hasta) {
        const desdeISO = new Date(`${desde}T00:00:00`).toISOString();
        const hastaISO = new Date(`${hasta}T23:59:59`).toISOString();
        data = await apiGet(
          `/admin/historial/paciente/${pacienteId}/rango?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
        );
      } else {
        data = await apiGet(`/admin/historial/paciente/${pacienteId}`);
      }
      setHistoriales(Array.isArray(data?.entidad) ? data.entidad : []);
    } catch {
      setHistoriales([]);
      setError('No se pudo cargar el historial del paciente');
    } finally {
      setLoading(false);
    }
  };

  if (historialSeleccionado) {
    return (
      <NotasSesion
        reserva={{
          id: historialSeleccionado.idReserva,
          idPaciente: historialSeleccionado.pacienteId,
          pacienteNombre: historialSeleccionado.pacienteNombre,
          motivoConsulta: historialSeleccionado.motivoConsulta,
          fechaReserva: historialSeleccionado.fechaCreacion,
        }}
        onVolver={() => setHistorialSeleccionado(null)}
      />
    );
  }

  return (
    <section className="historial">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-[#4a4238]">Historial Clínico de los pacientes</h2>
      </div>

      <form onSubmit={buscar} className="flex justify-between gap-3 my-[1rem]">
        <div className="flex gap-3">
          <div className="min-w-[220px] max-w-[20%]">
            <label className="block text-xs font-semibold text-[#4a4238] mb-1.5 uppercase tracking-wide">
              Paciente
            </label>
            {loadingPacientes ? (
              <div className="flex items-center gap-2 h-[42px]">
                <div className="w-4 h-4 border-2 border-zinc-300 border-t-[#A8B5A0] rounded-full animate-spin flex-shrink-0" />
                <span className="text-sm text-zinc-400">Cargando...</span>
              </div>
            ) : (
              <select
                value={pacienteId}
                onChange={e => setPacienteId(e.target.value)}
                className="w-full bg-white border-2 border-[#E8DFD0] rounded-xl p-[.5rem] text-sm text-[#4a4238] focus:outline-none focus:ring-2 focus:ring-[#A8B5A0] focus:border-transparent"
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellidos}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-[#4a4238] mb-1.5 uppercase tracking-wide">
              Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="w-full bg-white border-2 border-[#E8DFD0] rounded-xl p-[.5rem] text-sm text-[#4a4238] focus:outline-none focus:ring-2 focus:ring-[#A8B5A0] focus:border-transparent"
            />
          </div>

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-[#4a4238] mb-1.5 uppercase tracking-wide">
              Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="w-full bg-white border-2 border-[#E8DFD0] rounded-xl p-[.5rem] text-sm text-[#4a4238] focus:outline-none focus:ring-2 focus:ring-[#A8B5A0] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col justify-end">
          {error && <p className="text-red-500 text-xs mb-1">{error}</p>}
          <button
            type="submit"
            disabled={loading || loadingPacientes}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4a4238] text-white rounded-xl font-semibold text-sm hover:bg-[#3a3228] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>
      </form>

      <div className="container-historial shadow" style={{ height: 'auto', padding: '0' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-[#A8B5A0] rounded-full animate-spin mr-3" />
            <span className="text-sm">Cargando...</span>
          </div>
        ) : !buscado ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 p-[2rem]">
            <ClipboardList className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm">Selecciona un paciente y presiona Buscar</p>
          </div>
        ) : historiales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 p-[2rem]">
            <ClipboardList className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm">Sin historial clínico registrado para este paciente</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="sessions-table-wrapper">
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Tipo Sesión</th>
                    <th>Motivo</th>
                    <th>Flags</th>
                    <th>Fecha</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {historiales.map((h) => (
                    <tr key={h.idHistorial}>
                      <td>
                        <div className="patient-cell">
                          <span className="patient-name">{h.pacienteNombre ?? 'N/A'}</span>
                          {h.pacienteRut && (
                            <span className="text-xs text-zinc-400">{h.pacienteRut}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-individual">
                          {TIPO_SESION_LABELS[h.tipoSesion] ?? h.tipoSesion ?? 'N/A'}
                        </span>
                      </td>
                      <td className="max-w-[180px] truncate" title={h.motivoConsulta}>
                        {h.motivoConsulta ?? 'N/A'}
                      </td>
                      <td>
                        <div className="flex gap-1.5 flex-wrap">
                          {h.crisis && (
                            <span className="text-xs bg-red-100 text-red-600 px-[.5rem] py-[.25rem] rounded-md font-medium">
                              Crisis
                            </span>
                          )}
                          {h.alta && (
                            <span className="text-xs bg-green-100 text-green-600 px-[.5rem] py-[.25rem] rounded-md font-medium">
                              Alta
                            </span>
                          )}
                          {h.posibleAbandono && (
                            <span className="text-xs bg-amber-100 text-amber-600 px-[.5rem] py-[.25rem] rounded-md font-medium">
                              Abandono
                            </span>
                          )}
                          {!h.crisis && !h.alta && !h.posibleAbandono && (
                            <span className="text-xs text-zinc-300">—</span>
                          )}
                        </div>
                      </td>
                      <td>{formateaFecha(h.fechaCreacion)}</td>
                      <td>
                        <button
                          onClick={() => setHistorialSeleccionado(h)}
                          className="flex items-center text-[#4a4238] rounded-lg text-xs font-semibold"
                          title="Ver notas de sesión"
                        >
                          <StickyNote className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
