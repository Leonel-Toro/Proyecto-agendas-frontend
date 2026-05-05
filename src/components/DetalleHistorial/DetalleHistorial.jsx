import React from "react";
import AccionesReserva from "../AccionesReserva/AccionesReserva";
import { formateaPrecio, formateaFecha, formatearEstado, getBadgeEstadoClass } from "../../constants/estados";
import "./DetalleHistorial.css";

export default function DetalleHistorial({
  subtitulo,
  contenido = [],
  tab,
  onVer,
  onEditar,
  onCancelar,
  onCompletar,
  isAdmin,
}) {
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
                <th>Paciente</th>
                <th>Psicólogo</th>
                <th>Modalidad</th>
                <th>Motivo</th>
                <th>Precio</th>
                <th>Abonado</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>
                    <div className="patient-cell">
                      <span className="patient-name">{item.pacienteNombre ?? 'N/A'}</span>
                      {item.pacienteRut && (
                        <span className="text-xs text-gray-500">{item.pacienteRut}</span>
                      )}
                    </div>
                  </td>
                  <td>{item.psicologoNombre ?? 'N/A'}</td>
                  <td>
                    <span className="badge badge-individual">
                      {item.modalidad === 'PRESENCIAL' ? 'Presencial' : item.modalidad === 'VIRTUAL' ? 'Virtual' : (item.modalidad ?? 'N/A')}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate" title={item.motivoConsulta}>
                    {item.motivoConsulta ?? 'N/A'}
                  </td>
                  <td>{formateaPrecio(item.precio)}</td>
                  <td>{formateaPrecio(item.abonado ?? 0)}</td>
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
                      onCancelar={onCancelar}
                      onCompletar={onCompletar}
                      isAdmin={isAdmin}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
