import "./Historial.css";
import DetallesHistorial from "../DetalleHistorial/DetalleHistorial";
import BotonHeader from "../BotonHeader/BotonHeader";
import { useEffect, useMemo, useState } from "react";
import { LayoutList, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const TABS = [
  { id: "Historial", label: "Historial", icono: LayoutList },
  { id: "Pendientes", label: "Pendientes", icono: Clock },
  { id: "Completados", label: "Completados", icono: CheckCircle }
];

const REGISTROS_POR_PAGINA = 30;

export default function Historial() {
  const urlBase = import.meta.env.VITE_URL_BACKEND;

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("Historial");   
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);  

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${urlBase}/reservas/historial`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json") ? await res.json() : null;
        console.log(data);
        if (!res.ok) {
          throw new Error((data && (data.message || data.error)) || "Error en la solicitud");
        }
        if (!abort) {
          const registros = data?.entidad && Array.isArray(data.entidad) ? data.entidad : [];
          // Normaliza estado y elimina duplicados por email+fechaReserva
          const map = new Map();
          registros.forEach((r) => {
            const email = String(r.emailCliente || '').trim().toLowerCase();
            const fecha = String(r.fechaReserva || '').trim();
            const key = `${email}|${fecha}`;
            if (!map.has(key)) {
              const estado = String(r.estado || '').trim().toUpperCase();
              map.set(key, { ...r, estado });
            }
          });
          setItems(Array.from(map.values()));
          setPaginaActual(1);
        }
        setLoading(false);
      } catch (e) {
        console.log(e.message || "Error del servidor");
      }
    })();
    return () => { abort = true; };
  }, [urlBase]);

  const filtrados = useMemo(() => {
    if (tab === "Historial") return items;
    if (tab === "Pendientes") return items.filter(i => i.estado === "PENDIENTE");
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

  // Asegura que la página actual nunca quede fuera de rango al cambiar filtros/tabs
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
    if (totalPaginas === 0 && paginaActual !== 1) {
      setPaginaActual(1);
    }
  }, [totalPaginas]);

  const handleVerReserva = (reserva) => {
    console.log("Ver reserva:", reserva);
    // TODO: Implementar modal/página de detalle
  };

  const handleEditarReserva = (reserva) => {
    console.log("Editar reserva:", reserva);
    // TODO: Implementar modal/página de edición
  };

  return (
    <section className="historial">
      <div className="container-historial">
        <div className="card-historial-header flex gap-3 mb-6">
          {TABS.map(({ id, label, icono: Icono }) => (
            <button
              key={id}
              onClick={() => manejarCambioTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                tab === id
                  ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg"
                  : "bg-white text-blue-700 hover:bg-blue-50 border-2 border-blue-700"
              }`}
            >
              <Icono className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="card-historial">
          {loading && <p>Cargando historial…</p>}
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
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-blue-700 text-blue-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-blue-50"
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
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-blue-700 text-blue-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-blue-50"
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
    </section>
  );
}
