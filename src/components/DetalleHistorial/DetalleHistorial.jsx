import React from "react";
import AccionesReserva from "../AccionesReserva/AccionesReserva";

export default function DetalleHistorial({ subtitulo, contenido = [], tab = "Historial", onVer, onEditar }) {
  const rows = Array.isArray(contenido) ? contenido : [];

  return (
    <>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-600 shadow-sm">
          No hay registros.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm md:block">
            <table className="min-w-[900px] w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr>
                  {[
                    "Cliente",
                    "Email",
                    "Lugar",
                    //"Teléfono",
                    "Medio",
                    "Abonado",
                    "Precio",
                    "Reserva",
                    "Estado",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="bg-gradient-to-r from-blue-700 to-cyan-600 text-left font-bold text-white px-4 py-3 first:rounded-tl-xl last:rounded-tr-xl"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((item, idx) => (
                  <tr
                    key={`${item.emailCliente || "row"}-${item.fechaReserva || idx}`}
                    className="odd:bg-white even:bg-zinc-50 hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      {item.nombreCliente ?? "N/A"} 
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block max-w-[280px] truncate" title={item.emailCliente ?? ""}>
                        {item.emailCliente ?? "N/A"}
                      </span>
                    </td>
                    {/*<td className="px-4 py-3 align-top">
                      {item.telefonoCliente ?? "N/A"}
                    </td>*/}
                    <td className="px-4 py-3 align-top">
                      {item.lugarEncuentro ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 align-top">{item.medioCliente ?? "N/A"}</td>    
                    <td className="px-4 py-3 align-top">
                      {formateaPrecio(item.abonado ?? 0)}
                    </td>  
                    <td className="px-4 py-3 align-top">
                      {formateaPrecio(item.precio)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {formateaFecha(item.fechaReserva)}
                    </td>
                    <td className={`px-4 py-3 align-top font-semibold ${getEstadoClase(item.estado)}`}>
                      {formatearEstado(item.estado)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AccionesReserva
                        item={item}
                        tab={tab}
                        onVer={onVer}
                        onEditar={onEditar}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function formateaPrecio(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

function formateaFecha(v) {
  if (!v) return "N/A";
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString("es-CL");
}

function formatearEstado(estado) {
  const estadosMap = {
    "PENDIENTE": "Pendiente",
    "ABONADA": "Abonada",
    "CANCELADA": "Cancelada",
    "COMPLETADO": "Completado"
  };
  return estadosMap[estado] || estado;
}

function getEstadoClase(estado) {
  const clasesMap = {
    "PENDIENTE": "text-amber-600 bg-amber-50",
    "ABONADA": "text-green-600 bg-green-50",
    "CANCELADA": "text-red-600 bg-red-50",
    "COMPLETADO": "text-blue-600 bg-blue-50"
  };
  return clasesMap[estado] || "";
}
