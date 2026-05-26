export const ESTADOS_PERIODO = [
  'Configuración',
  'Recopilación',
  'Generación',
  'Aprobado',
  'Publicado',
  'Cerrado'
] as const;

export type EstadoPeriodo = typeof ESTADOS_PERIODO[number];
