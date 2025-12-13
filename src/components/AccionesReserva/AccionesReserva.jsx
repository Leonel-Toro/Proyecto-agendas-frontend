import { Eye, Edit } from 'lucide-react';

export default function AccionesReserva({ item, tab, onVer, onEditar }) {
  const acciones = {
    Historial: [
      { label: "Ver", icono: Eye, accion: () => onVer?.(item), color: "text-blue-600" }
    ],
    Pendientes: [
      { label: "Ver", icono: Eye, accion: () => onVer?.(item), color: "text-blue-600" },
      { label: "Editar", icono: Edit, accion: () => onEditar?.(item), color: "text-orange-600" }
    ],
    Completados: [
      { label: "Ver", icono: Eye, accion: () => onVer?.(item), color: "text-blue-600" }
    ]
  };

  const botonesAccion = acciones[tab] || [];

  return (
    <div className="flex items-center gap-2">
      {botonesAccion.map((accion, idx) => {
        const Icono = accion.icono;
        return (
          <button
            key={idx}
            onClick={accion.accion}
            title={accion.label}
            className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors ${accion.color}`}
          >
            <Icono className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
