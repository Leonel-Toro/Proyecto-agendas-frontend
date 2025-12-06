import React from "react";

export default function DetalleHistorial({ subtitulo, contenido = [] }) {
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
                    "Producto",
                    "Medio",
                    "Precio",
                    "Lugar",
                    "Email",
                    "Reserva",
                    "Estado",
                  ].map((h) => (
                    <th
                      key={h}
                      className="bg-[#fff38b] text-left font-bold text-black px-4 py-3"
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
                    className="odd:bg-white even:bg-zinc-50 hover:bg-yellow-50 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      {item.nombreCliente ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {item.nombreProducto ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 align-top">{item.medioCliente ?? "N/A"}</td>      
                    <td className="px-4 py-3 align-top">
                      {formateaPrecio(item.precio)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {item.lugarEncuentro ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block max-w-[280px] truncate" title={item.emailCliente ?? ""}>
                        {item.emailCliente ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {formateaFecha(item.fechaReserva)}
                    </td>
                    <td className={`px-4 py-3 align-top ${item.estado.toLowerCase()}`}>
                      {item.estado}
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
