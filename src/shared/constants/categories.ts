export const CATEGORIAS_DOCENTE = ['Principal', 'Asociado', 'Auxiliar'] as const;
export const REGIMENES_DOCENTE = ['Dedicación Exclusiva', 'Tiempo Completo', 'Tiempo Parcial'] as const;
export const CONDICIONES_DOCENTE = ['Nombrado', 'Contratado'] as const;

export type CategoriaDocente = typeof CATEGORIAS_DOCENTE[number];
export type RegimenDocente = typeof REGIMENES_DOCENTE[number];
export type CondicionDocente = typeof CONDICIONES_DOCENTE[number];
