import { Eye, Edit, X, CheckCircle, ClipboardList } from 'lucide-react';

export default function AccionesReserva({ item, onVer, onEditar, onCancelar, onCompletar, isAdmin }) {
  const mas24h = isAdmin || new Date(item.fechaReserva) > Date.now() + 24 * 60 * 60 * 1000;
  const editable = ['PENDIENTE', 'CONFIRMADA'].includes(item.estado) && mas24h;
  const cancelable = !['CANCELADA', 'COMPLETADA'].includes(item.estado) && mas24h;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onVer?.(item)}
        title="Ver"
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-[#A8B5A0]"
      >
        <Eye className="w-4 h-4" />
      </button>
      {editable && (
        <button
          onClick={() => onEditar?.(item)}
          title="Editar"
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-orange-600"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {cancelable && (
        <button
          onClick={() => onCancelar?.(item.id)}
          title="Cancelar"
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {isAdmin && item.estado !== 'COMPLETADA' && item.estado !== 'CANCELADA' && (
        <button
          onClick={() => onCompletar?.(item.id)}
          title="Completar"
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-green-600"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
