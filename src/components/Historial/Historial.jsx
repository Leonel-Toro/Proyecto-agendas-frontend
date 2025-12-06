import "./Historial.css";
import DetallesHistorial from "../DetalleHistorial/DetalleHistorial";
import BotonHeader from "../BotonHeader/BotonHeader";
import { useEffect, useMemo, useState } from "react";

export default function Historial() {
  const urlBase = import.meta.env.VITE_URL_BACKEND;

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("Historial");   
  const [loading, setLoading] = useState(true);  

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
        if (!abort) setItems(Array.isArray(data) ? data : []);
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
    if (tab === "Completados") return items.filter(i => i.estado === "COMPLETADO");
    return items;
  }, [tab, items]);

  const subtitulo = useMemo(() => {
    if (tab === "Historial") return "Historial de citas reservadas";
    if (tab === "Pendientes") return "Historial de citas pendientes";
    if (tab === "Completados") return "Historial de citas completadas";
    return "Historial";
  }, [tab]);

  return (
    <section className="historial">
      <div className="container-historial">
        <div className="card-historial-header">
          <BotonHeader titulo="Historial"   onSelect={() => setTab("Historial")} />
          <BotonHeader titulo="Pendientes"  onSelect={() => setTab("Pendientes")} />
          <BotonHeader titulo="Completados" onSelect={() => setTab("Completados")} />
        </div>

        <div className="card-historial">
          {loading && <p>Cargando historial…</p>}
          {!loading && (
            <DetallesHistorial
              subtitulo={subtitulo}
              contenido={filtrados}
            />
          )}
        </div>
      </div>
    </section>
  );
}
