import React from "react";
import AccionesReserva from "../AccionesReserva/AccionesReserva";
import "./DetalleHistorial.css";

export default function DetalleHistorial({ subtitulo, contenido = [], tab = "Historial", onVer, onEditar }) {
  const rows = Array.isArray(contenido) ? contenido : [];
  return (
    <>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-600 shadow-sm">
          <p className="text-lg">No hay registros para mostrar</p>
        </div>
      ) : (
        <div className="sessions-table-wrapper">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Lugar</th>
                <th>Medio</th>
                <th>Abonado</th>
                <th>Precio</th>
                <th>Reserva</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, idx) => {                
                return (
                  <tr key={`${item.emailCliente || "row"}-${item.fechaReserva || idx}`}>
                    <td>
                      <div className="patient-cell">
                        <span className="patient-name">{item.nombreCliente ?? "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="block max-w-[200px] truncate" title={item.emailCliente ?? ""}>
                        {item.emailCliente ?? "N/A"}
                      </span>
                    </td>
                    <td>{item.telefonoCliente ?? "N/A"}</td>
                    <td>{item.lugarEncuentro ?? "N/A"}</td>
                    <td>
                      <span className="badge badge-individual">
                        {item.medioCliente ?? "N/A"}
                      </span>
                    </td>
                    <td>{formateaPrecio(item.abonado ?? 0)}</td>
                    <td>{formateaPrecio(item.precio)}</td>
                    <td>{formateaFecha(item.fechaReserva)}</td>
                    <td>
                      <span className={`badge ${getBadgeEstadoClass(item.estado)}`}>
                        {formatearEstado(item.estado)}
                      </span>
                    </td>
                    <td>
                      <AccionesReserva
                        item={item}
                        tab={tab}
                        onVer={onVer}
                        onEditar={onEditar}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
    "COMPLETADO": "Completado",
    "PAGADA": "Pagada"
  };
  return estadosMap[estado] || estado;
}

function getBadgeEstadoClass(estado) {
  const clasesMap = {
    "PENDIENTE": "badge-pendiente",
    "ABONADA": "badge-programada",
    "CANCELADA": "badge-cancelada",
    "COMPLETADO": "badge-completada",
    "PAGADA": "badge-completada"
  };
  return clasesMap[estado] || "badge-programada";
}
