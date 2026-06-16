import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, StickyNote, Pencil, Sparkles, Check, X, ClipboardList, ListRestart, ListRestartIcon } from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../api/apiClient';
import { formateaFecha } from '../../constants/estados';
import '../Historial/Historial.css';
import AgenteIAModal from '../AgenteIAModal/AgenteIAModal';

export default function NotasSesion({ reserva, onVolver }) {
  const [noHistorial, setNoHistorial] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoTexto, setEditandoTexto] = useState('');
  const [agenteNota, setAgenteNota] = useState(null);

  const pacienteId = reserva?.idPaciente ?? reserva?.pacienteId;

  useEffect(() => {
    if (!reserva?.id) {
      setLoading(false);
      return;
    }
    apiGet(`/admin/notas/reserva/${reserva.id}`)
      .then(data => {
        if (data?.code === 200) setNotas(data.entidad ?? []);
      })
      .catch(e => {
        const msg = e?.message ?? '';
        if (msg.includes('404') || msg.includes('HistorialPaciente')) {
          setNoHistorial(true);
        } else {
          setLoadError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [reserva?.id]);

  const handleAgregarNota = async () => {
    if (!nuevaNota.trim() || noHistorial) return;
    setAgregando(true);
    setError('');
    try {
      const resp = await apiPost('/admin/notas', { idReserva: reserva.id, nota: nuevaNota.trim() });
      setNotas(prev => [...prev, resp?.entidad]);
      setNuevaNota('');
    } catch (e) {
      setError(e.message || 'Error al agregar la nota');
    } finally {
      setAgregando(false);
    }
  };

  const handleEliminarNota = async (idNota) => {
    setError('');
    try {
      await apiDelete(`/admin/notas/${idNota}`);
      setNotas(prev => prev.filter(n => n.idNota !== idNota));
    } catch (e) {
      setError(e.message || 'Error al eliminar la nota');
    }
  };

  const handleIniciarEdicion = (n) => {
    setEditandoId(n.idNota);
    setEditandoTexto(n.nota);
  };

  const handleGuardarEdicion = async (idNota) => {
    if (!editandoTexto.trim()) return;
    setError('');
    try {
      await apiPatch(`/admin/notas/${idNota}`, { nota: editandoTexto.trim() });
      setNotas(prev => prev.map(n => n.idNota === idNota ? { ...n, nota: editandoTexto.trim() } : n));
      setEditandoId(null);
    } catch (e) {
      setError(e.message || 'Error al editar la nota');
    }
  };

  return (
    <section className="historial">
      <div className="container-historial shadow" style={{ height: 'auto' }}>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#4a4238]">Notas de Sesión</h2>
          <p className="text-sm text-zinc-500">{formateaFecha(reserva?.fechaReserva)}</p>
        </div>

        {/* Ficha resumen */}
        <div className="bg-[#f7f5f0] rounded-xl mb-6 border border-[#E8DFD0] p-[1rem] mt-[1rem]">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-[#4a4238] uppercase tracking-wide mb-1">Nombre Paciente</p>
              <p className="text-[#4a4238] font-medium">{reserva?.pacienteNombre ?? 'N/A'}</p>
            </div>
            {reserva?.motivoConsulta && (
              <div>
                <p className="text-xs font-semibold text-[#4a4238] uppercase tracking-wide mb-1">Motivo de Consulta</p>
                <p className="text-zinc-600">{reserva.motivoConsulta}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contenido notas */}
        <div className="my-[1.5rem]">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-400">
              <div className="w-5 h-5 border-2 border-zinc-200 border-t-[#A8B5A0] rounded-full animate-spin mr-3" />
              <span className="text-sm">Cargando notas...</span>
            </div>
          ) : !pacienteId ? (
            <div className="text-center py-12 text-zinc-400">
              <StickyNote className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No se puede identificar al paciente para cargar las notas</p>
            </div>
          ) : noHistorial ? (
            <div className="text-center py-12 text-zinc-400">
              <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay historial clínico registrado para esta sesión</p>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {notas.length === 0 ? (
                  <div className="rounded-xl p-4 bg-amber-50 p-[1rem]">
                    <div className="flex items-start gap-3">
                      <textarea
                        value={nuevaNota}
                        onChange={e => setNuevaNota(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAgregarNota()}
                        rows={3}
                        placeholder="Agregar una nota..."
                        className="flex-1 bg-transparent focus:outline-none placeholder"
                        autoFocus
                      />
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={handleAgregarNota}
                          disabled={!nuevaNota.trim() || agregando}
                          className="p-1.5 bg-[#A8B5A0] text-white rounded-lg hover:bg-[#8fa587] transition-colors disabled:opacity-50"
                          title="Guardar nota"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setNuevaNota('')}
                          className="p-1.5 bg-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-300 transition-colors"
                          title="Limpiar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {notas.map((n) => (
                      <div
                        key={n.idNota}
                        className="rounded-xl p-4 bg-amber-50 mb-[1rem]"
                      >
                        {editandoId === n.idNota ? (
                          <div className="flex gap-2 items-start p-[1rem]">
                            <textarea
                              value={editandoTexto}
                              onChange={e => setEditandoTexto(e.target.value)}
                              rows={2}
                              className="flex-1 bg-amber-50 rounded-xl px-3 py-2 text-sm text-[#4a4238] focus:outline-none focus:border-transparent"
                              autoFocus
                            />
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => handleGuardarEdicion(n.idNota)}
                                className="p-1.5 bg-[#A8B5A0] text-white rounded-lg hover:bg-[#8fa587] transition-colors"
                                title="Guardar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditandoId(null)}
                                className="p-1.5 bg-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-300 transition-colors"
                                title="Cancelar"
                              >
                                <ListRestartIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3 p-[1rem]">
                            <p className="text-sm text-[#4a4238] flex-1 leading-relaxed">{n.nota}</p>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {n.fechaCreacion && (
                                <span className="text-xs text-amber-500 hidden sm:block mr-1">
                                  {formateaFecha(n.fechaCreacion)}
                                </span>
                              )}
                              <button
                                title="Asistente IA"
                                onClick={() => setAgenteNota(n)}
                                className="p-1.5 text-violet-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleIniciarEdicion(n)}
                                className="p-1.5 text-zinc-400 hover:text-[#4a4238] hover:bg-amber-100 rounded-lg transition-colors"
                                title="Editar nota"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEliminarNota(n.idNota)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar nota"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2 pt-4 border-t border-zinc-100 mt-[1rem]">
                      <input
                        type="text"
                        value={nuevaNota}
                        onChange={e => setNuevaNota(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAgregarNota()}
                        placeholder="Agregar otra nota..."
                        className="flex-1 bg-white rounded-xl mt-[1rem] px-[1rem] py-[0.625rem] text-sm focus:outline-none focus:border-transparent"
                      />
                      <button
                        onClick={handleAgregarNota}
                        disabled={!nuevaNota.trim() || agregando}
                        className="flex items-center gap-2 mt-[1rem] px-[1rem] py-[0.625rem] bg-[#A8B5A0] text-white rounded-xl font-semibold text-sm hover:bg-[#8fa587] transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 px-4 py-2 mt-[1rem] bg-white border-2 border-[#E8DFD0] rounded-xl text-[#4a4238] font-semibold text-sm hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Historial Clinico
        </button>
      </div>

      {agenteNota && (
        <AgenteIAModal
          nota={agenteNota}
          reserva={reserva}
          onClose={() => setAgenteNota(null)}
          onNotaGuardada={(nuevaNota) => {
            if (nuevaNota) setNotas(prev => [...prev, nuevaNota]);
          }}
        />
      )}
    </section>
  );
}
