export const ESTADOS = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
};

export const ESTADO_OPCIONES = Object.entries(ESTADOS).map(([value, label]) => ({ value, label }));

export const MODALIDAD_OPCIONES = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
];

export const DURACION_OPCIONES = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]
  .map(m => ({ value: m, label: `${m} min` }));

export const TIPO_SESION_OPCIONES = [
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento' },
  { value: 'CRISIS', label: 'Crisis' },
  { value: 'EVALUACION', label: 'Evaluación' },
  { value: 'CIERRE', label: 'Cierre' },
];

export const GENERO_OPCIONES = [
  { value: 'MASCULINO', label: 'Él' },
  { value: 'FEMENINO', label: 'Ella' },
  { value: 'PREFIERO_NO_DECIRLO', label: 'Prefiero no decirlo' },
];

export function formatearEstado(estado) {
  return ESTADOS[estado] || estado;
}

export function getBadgeEstadoClass(estado) {
  const map = {
    PENDIENTE: 'badge-pendiente',
    CONFIRMADA: 'badge-programada',
    CANCELADA: 'badge-cancelada',
    COMPLETADA: 'badge-completada',
  };
  return map[estado] || 'badge-pendiente';
}

export function formateaPrecio(v) {
  return Number(v ?? 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}

export function formateaFecha(v) {
  if (!v) return 'N/A';
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString('es-CL');
}
