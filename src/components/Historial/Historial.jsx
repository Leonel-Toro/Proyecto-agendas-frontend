import "./Historial.css";
import DetallesHistorial from "../DetalleHistorial/DetalleHistorial";
import DetalleReservaModal from "../DetalleReservaModal/DetalleReservaModal";
import ModalExito from "../ModalExito/ModalExito";
import { useEffect, useMemo, useState } from "react";
import { LayoutList, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGet, apiPut, apiPatch, apiDelete } from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { id: "Todas", label: "Todas", icono: LayoutList },
  { id: "EnCurso", label: "En curso", icono: Clock },
  { id: "Completadas", label: "Completadas", icono: CheckCircle },
  { id: "Canceladas", label: "Canceladas", icono: XCircle },
];

const REGISTROS_POR_PAGINA = 30;

export default function Historial() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('ver');
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const endpoint = isAdmin ? '/admin/reservas' : '/reservas';
        const data = await apiGet(endpoint);
        if (!abort) {
          const registros = Array.isArray(data?.entidad) ? data.entidad : [];
          const ordenados = [...registros].sort((a, b) =>
            new Date(b.fechaReserva) - new Date(a.fechaReserva)
          );
          setItems(ordenados);
          setPaginaActual(1);
        }
      } catch (e) {
        console.log(e.message || 'Error del servidor');
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [isAdmin]);

  const filtrados = useMemo(() => {
    if (tab === "Todas") return items;
    if (tab === "EnCurso") return items.filter(i => ["PENDIENTE", "CONFIRMADA"].includes(i.estado));
    if (tab === "Completadas") return items.filter(i => i.estado === "COMPLETADA");
    if (tab === "Canceladas") return items.filter(i => i.estado === "CANCELADA");
    return items;
  }, [tab, items]);

  const totalPaginas = Math.ceil(filtrados.length / REGISTROS_POR_PAGINA);

  const registrosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    return filtrados.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [filtrados, paginaActual]);

  const subtitulo = useMemo(() => {
    if (tab === "Todas") return "Historial de citas reservadas";
    if (tab === "EnCurso") return "Citas pendientes o confirmadas";
    if (tab === "Completadas") return "Citas completadas";
    if (tab === "Canceladas") return "Citas canceladas";
    return "Historial";
  }, [tab]);

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas);
    if (totalPaginas === 0 && paginaActual !== 1) setPaginaActual(1);
  }, [totalPaginas]);

  const manejarCambioTab = (nuevoTab) => {
    setTab(nuevoTab);
    setPaginaActual(1);
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) setPaginaActual(nuevaPagina);
  };

  const handleVerReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setModoModal('ver');
    setModalAbierto(true);
  };

  const handleEditarReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setModoModal('editar');
    setModalAbierto(true);
  };

  const handleCancelarReserva = async (id) => {
    if (!window.confirm('¿Deseas cancelar esta reserva?')) return;
    try {
      const endpoint = isAdmin ? `/admin/reservas/${id}` : `/reservas/${id}`;
      await apiDelete(endpoint);
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, estado: 'CANCELADA' } : item
      ));
      setMensajeExito('Reserva cancelada correctamente');
      setModalExitoAbierto(true);
    } catch (e) {
      console.error('Error al cancelar:', e);
    }
  };

  const handleCompletarReserva = async (id) => {
    try {
      await apiPatch(`/admin/reservas/${id}/completar`, {});
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, estado: 'COMPLETADA' } : item
      ));
      setMensajeExito('Reserva marcada como completada');
      setModalExitoAbierto(true);
    } catch (e) {
      console.error('Error al completar:', e);
    }
  };

  const handleGuardarReserva = async (reservaActualizada) => {
    try {
      const { id } = reservaActualizada;
      const endpoint = isAdmin ? `/admin/reservas/${id}` : `/reservas/${id}`;

      const payload = {
        motivoConsulta: reservaActualizada.motivoConsulta ?? '',
        modalidad: reservaActualizada.modalidad ?? '',
        duracionMinutos: Number(reservaActualizada.duracionMinutos ?? 60),
        fechaReserva: reservaActualizada.fechaReserva,
      };

      if (isAdmin) {
        payload.fechaTermino = reservaActualizada.fechaTermino ?? null;
        payload.precio = Number(reservaActualizada.precio ?? 0);
        payload.abonado = Number(reservaActualizada.abonado ?? 0);
        payload.estado = reservaActualizada.estado ?? '';
      }

      let data;
      if (isAdmin) {
        data = await apiPut(endpoint, payload);
      } else {
        data = await apiPatch(endpoint, payload);
      }

      setModalAbierto(false);
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, ...payload } : item
      ));

      const mensaje = data?.mensaje || 'La reserva se ha actualizado correctamente';
      setMensajeExito(mensaje);
      setModalExitoAbierto(true);
    } catch (e) {
      throw e;
    }
  };

  return (
    <section className="historial">
      <div className="container-historial">
        <div className="mini-header">
          <div className="sessions-header">
            <div className="sessions-title-section">
              <h2>{isAdmin ? 'Todas las reservas' : 'Mis reservas'}</h2>
              <p>Historial completo de citas</p>
            </div>
          </div>
        </div>

        <div className="card-historial-header flex gap-3 mb-6">
          {TABS.map(({ id, label, icono: Icono }) => (
            <button
              key={id}
              onClick={() => manejarCambioTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                tab === id
                  ? "bg-[#A8B5A0] text-white shadow-lg"
                  : "bg-white text-[#4a4238] hover:bg-zinc-50 border-2 border-[#E8DFD0]"
              }`}
            >
              <Icono className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="card-historial">
          {loading && <p className="text-center py-8 text-[#8C8174]">Cargando reservas…</p>}
          {!loading && (
            <>
              <DetallesHistorial
                subtitulo={subtitulo}
                contenido={registrosPaginados}
                tab={tab}
                onVer={handleVerReserva}
                onEditar={handleEditarReserva}
                onCancelar={handleCancelarReserva}
                onCompletar={handleCompletarReserva}
                isAdmin={isAdmin}
              />

              {filtrados.length > 0 && totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 py-4">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-[#4a4238] text-[#4a4238] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-zinc-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <div className="flex items-center gap-1 mx-4">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => cambiarPagina(num)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                          paginaActual === num
                            ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg"
                            : "bg-white text-blue-700 border border-blue-700 hover:bg-blue-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-[#4a4238] text-[#4a4238] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-zinc-50"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {filtrados.length > 0 && (
                <div className="text-center text-sm text-zinc-600 mt-4">
                  Mostrando página {(paginaActual - 1) * REGISTROS_POR_PAGINA + 1} de{' '}
                  {Math.min(paginaActual * REGISTROS_POR_PAGINA, filtrados.length)} de{' '}
                  {filtrados.length} reservas
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modalAbierto && (
        <DetalleReservaModal
          reserva={reservaSeleccionada}
          modo={modoModal}
          onClose={() => { setModalAbierto(false); setReservaSeleccionada(null); }}
          onGuardar={handleGuardarReserva}
        />
      )}

      {modalExitoAbierto && (
        <ModalExito
          mensaje={mensajeExito}
          onClose={() => { setModalExitoAbierto(false); setMensajeExito(''); }}
        />
      )}
    </section>
  );
}
