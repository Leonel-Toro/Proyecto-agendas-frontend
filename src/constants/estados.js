export const ESTADOS = {
  1: 'Pendiente',
  2: 'Abonada',
  4: 'No Concretada',
  5: 'Pagada',
};

export function estadoIdAString(estadoId) {
  return ESTADOS[Number(estadoId)] || estadoId;
}

export const MEDIO_OPCIONES = {
  1: "Directo",
  2: "Facebook" ,
  3: "Instagram" ,
  99: "Otro"
};

export function MedioOpcionesIdString(medioId) {
  return MEDIO_OPCIONES[Number(medioId)] || medioId;
}