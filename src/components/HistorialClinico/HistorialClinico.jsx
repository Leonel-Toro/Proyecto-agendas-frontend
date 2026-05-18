import { useState, useEffect } from 'react';
import { apiGet } from '../../api/apiClient';
import { formateaFecha } from '../../constants/estados';
import NotasSesion from '../NotasSesion/NotasSesion';
import { Search, CheckCircle, StickyNote } from 'lucide-react';
import '../Historial/Historial.css';
import '../DetalleHistorial/DetalleHistorial.css';

export default function HistorialClinico() {
  const [pacienteId, setPacienteId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [todasCompletadas, setTodasCompletadas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState('');
  const [reservaNotas, setReservaNotas] = useState(null);

  // Cargar pacientes y todas las reservas completadas al montar
  useEffect(() => {
    Promise.all([
      apiGet('/admin/pacientes'),
      apiGet('/admin/reservas'),
    ])
      .then(([pacientesData, reservasData]) => {
        const listaPacientes = Array.isArray(pacientesData?.entidad)
          ? pacientesData.entidad
          : (Array.isArray(pacientesData) ? pacientesData : []);
        setPacientes(listaPacientes);

        const allReservas = Array.isArray(reservasData?.entidad) ? reservasData.entidad : [];
        const completadas = allReservas
          .filter(r => r.estado === 'COMPLETADA')
          .sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
        setTodasCompletadas(completadas);
        setReservasFiltradas(completadas);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingPacientes(false);
      });
  }, []);

  const buscar = (e) => {
    e.preventDefault();
    setError('');

    const selectedPaciente = pacienteId && Number(pacienteId) > 0
      ? pacientes.find(p => String(p.id) === String(pacienteId))
      : null;

    const filtradas = todasCompletadas.filter(r => {
      if (selectedPaciente) {
        const matchId =
          (r.idPaciente !== undefined && String(r.idPaciente) === String(pacienteId)) ||
          (r.pacienteId !== undefined && String(r.pacienteId) === String(pacienteId)) ||
          (r.pacienteNombre && r.pacienteNombre.toLowerCase().includes(selectedPaciente.nombre.toLowerCase()));
        if (!matchId) return false;
      }
      if (!desde && !hasta) return true;
      const fecha = new Date(r.fechaReserva);
      if (desde && fecha < new Date(desde)) return false;
      if (hasta && fecha > new Date(`${hasta}T23:59:59`)) return false;
      return true;
    });

    setReservasFiltradas(filtradas);
  };

  if (reservaNotas) {
    return <NotasSesion reserva={reservaNotas} onVolver={() => setReservaNotas(null)} />;
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
                <option value="">Todos los pacientes</option>
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
        <div>
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
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-400">
              <div className="w-5 h-5 border-2 border-zinc-200 border-t-[#A8B5A0] rounded-full animate-spin mr-3" />
              <span className="text-sm">Cargando...</span>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-8">
                {reservasFiltradas.length > 0 ? (
                  <div className="sessions-table-wrapper">
                    <table className="sessions-table">
                      <thead>
                        <tr>
                          <th>Paciente</th>
                          <th>Modalidad</th>
                          <th>Motivo</th>
                          <th>Fecha</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservasFiltradas.map((r, idx) => (
                          <tr key={r.id || idx}>
                            <td>
                              <div className="patient-cell">
                                <span className="patient-name">{r.pacienteNombre ?? 'N/A'}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-individual">
                                {r.modalidad === 'PRESENCIAL' ? 'Presencial' : r.modalidad === 'VIRTUAL' ? 'Virtual' : (r.modalidad ?? 'N/A')}
                              </span>
                            </td>
                            <td className="max-w-[180px] truncate" title={r.motivoConsulta}>
                              {r.motivoConsulta ?? 'N/A'}
                            </td>
                            <td>{formateaFecha(r.fechaReserva)}</td>
                            <td>
                              <button
                                onClick={() => setReservaNotas(r)}
                                className="flex items-center text-[#4a4238] rounded-lg text-xs font-semibold"
                                title="Ver notas de sesión"
                              >
                                <StickyNote className="w-5 h-6" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 p-10 text-center text-zinc-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay sesiones completadas</p>
                  </div>
                )}
              </div>


            </div>
          )}
        </div>

      </div>

    </section>
  );
}
