import "./Historial.css";
import DetallesHistorial from "../DetalleHistorial/DetalleHistorial";
import DetalleReservaModal from "../DetalleReservaModal/DetalleReservaModal";
import ModalExito from "../ModalExito/ModalExito";
import BotonHeader from "../BotonHeader/BotonHeader";
import { useEffect, useMemo, useState } from "react";
import { LayoutList, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGet, apiPut } from '../../api/apiClient';

const TABS = [
  { id: "Historial", label: "Historial", icono: LayoutList },
  { id: "Pendientes", label: "Pendientes", icono: Clock },
  { id: "Completados", label: "Completados", icono: CheckCircle }
];

const REGISTROS_POR_PAGINA = 30;

export default function Historial() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("Historial");   
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
        const data = await apiGet('/reservas/historial');
        
        if (!abort) {
          const registros = data?.entidad && Array.isArray(data.entidad) ? data.entidad : [];
          const map = new Map();
          registros.forEach((r) => {
            const fecha = String(r.fechaReserva || '').trim();
            const key = `${r.nombreCliente}|${fecha}`;
            if (!map.has(key)) {
              const estado = String(r.estado || '').trim().toUpperCase();
              map.set(key, { ...r, estado });
            }
          });
          
          // Ordenar por fecha de término más próxima o fecha de reserva más nueva
          const itemsOrdenados = Array.from(map.values()).sort((a, b) => {
            const fechaTerminoA = a.fechaTermino ? new Date(a.fechaTermino).getTime() : null;
            const fechaTerminoB = b.fechaTermino ? new Date(b.fechaTermino).getTime() : null;
            const fechaReservaA = new Date(a.fechaReserva).getTime();
            const fechaReservaB = new Date(b.fechaReserva).getTime();
            const ahora = Date.now();
            
            // Si ambos tienen fecha de término
            if (fechaTerminoA && fechaTerminoB) {
              return fechaTerminoA - fechaTerminoB; // Ascendente: más próxima primero
            }
            
            // Si solo A tiene fecha de término
            if (fechaTerminoA && !fechaTerminoB) {
              return -1; // A primero
            }
            
            // Si solo B tiene fecha de término
            if (!fechaTerminoA && fechaTerminoB) {
              return 1; // B primero
            }
            
            // Si ninguno tiene fecha de término, ordenar por fecha de reserva (más nueva primero)
            return fechaReservaB - fechaReservaA; // Descendente: más nueva primero
          });
          
          setItems(itemsOrdenados);
          setPaginaActual(1);
        }
        setLoading(false);
      } catch (e) {
        console.log(e.message || "Error del servidor");
        setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  const filtrados = useMemo(() => {
    if (tab === "Historial") return items;
    if (tab === "Pendientes") return items.filter(i => ["ABONADA", "PENDIENTE"].includes(i.estado));
    if (tab === "Completados") return items.filter(i => ["PAGADA", "CANCELADA"].includes(i.estado));
    return items;
  }, [tab, items]);

  const totalPaginas = Math.ceil(filtrados.length / REGISTROS_POR_PAGINA);
  
  const registrosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;
    return filtrados.slice(inicio, fin);
  }, [filtrados, paginaActual]);

  const subtitulo = useMemo(() => {
    if (tab === "Historial") return "Historial de citas reservadas";
    if (tab === "Pendientes") return "Citas pendientes de pago";
    if (tab === "Completados") return "Citas abonadas o canceladas";
    return "Historial";
  }, [tab]);

  const manejarCambioTab = (nuevoTab) => {
    setTab(nuevoTab);
    setPaginaActual(1);
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

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

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
    if (totalPaginas === 0 && paginaActual !== 1) {
      setPaginaActual(1);
    }
  }, [totalPaginas]);

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

  const handleGuardarReserva = async (reservaActualizada) => {
    try {
      const payloadNormalizado = {
        id: reservaActualizada?.id,
        precio: Number(reservaActualizada?.precio ?? 0),
        abonado: Number(reservaActualizada?.abonado ?? 0),
        abono: Number(reservaActualizada?.abonado ?? 0),
        estado: reservaActualizada?.estado ?? "",
        nombreProducto: reservaActualizada?.nombreProducto ?? "",
        fechaReserva: reservaActualizada?.fechaReserva ?? "",
        fechaTermino: reservaActualizada?.fechaTermino ?? reservaActualizada?.fechaReserva ?? "",
        lugarEncuentro: reservaActualizada?.lugarEncuentro ?? "",
        nombreCliente: reservaActualizada?.nombreCliente ?? "",
        medioCliente: reservaActualizada?.medioCliente ?? "",
        mensajePersonalizado: reservaActualizada?.mensajePersonalizado ?? "",
      };

      const data = await apiPut('/reservas/editar', payloadNormalizado);

      // Cerrar modal de edición
      setModalAbierto(false);
      
      setItems(prevItems => {
        const index = prevItems.findIndex(item => item.id === reservaActualizada.id);
        if (index !== -1) {
          const newItems = [...prevItems];
          newItems[index] = { ...reservaActualizada, estado: String(estadoIdAString(reservaActualizada.estado)).trim().toUpperCase() };
          return newItems;
        }
        return prevItems;
      });

      // Mostrar modal de éxito
      const mensajeRespuesta = typeof data === 'object' && data?.mensaje 
        ? data.mensaje 
        : 'La reserva se ha actualizado correctamente';
      setMensajeExito(mensajeRespuesta);
      setModalExitoAbierto(true);
      
    } catch (e) {
      console.error("Error de red al editar reserva:", e);
      throw e;

    }
  };

  const handleCerrarModalExito = () => {
    setModalExitoAbierto(false);
    setMensajeExito('');
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setReservaSeleccionada(null);
  };

  return (
    <section className="historial">
      <div className="container-historial">
        {/* Header con título y acciones */}
        <div className="mini-header">
          <div className="sessions-header">
            <div className="sessions-title-section">
              <h2>Registro de Reservas</h2>
              <p>Historial completo de reservas</p>
            </div>
          </div>
        </div>

        {/* Tabs de filtro */}
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

        {/* Tabla de contenido */}
        <div className="card-historial">
          {loading && <p className="text-center py-8 text-[#8C8174]">Cargando historial…</p>}
          {!loading && (
            <>
              <DetallesHistorial
                subtitulo={subtitulo}
                contenido={registrosPaginados}
                tab={tab}
                onVer={handleVerReserva}
                onEditar={handleEditarReserva}
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
                  Mostrando {(paginaActual - 1) * REGISTROS_POR_PAGINA + 1} a {Math.min(paginaActual * REGISTROS_POR_PAGINA, filtrados.length)} de {filtrados.length} registros
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalle/Edición */}
      {modalAbierto && (
        <DetalleReservaModal
          reserva={reservaSeleccionada}
          modo={modoModal}
          onClose={handleCerrarModal}
          onGuardar={handleGuardarReserva}
        />
      )}

      {/* Modal de Éxito */}
      {modalExitoAbierto && (
        <ModalExito
          mensaje={mensajeExito}
          onClose={handleCerrarModalExito}
        />
      )}
    </section>
  );
}
