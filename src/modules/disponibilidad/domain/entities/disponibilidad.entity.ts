import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export const DISPONIBILIDAD_ESTADOS = ['disponible', 'no_disponible', 'preferido'] as const;

export type DisponibilidadEstado = typeof DISPONIBILIDAD_ESTADOS[number];

export const DISPONIBILIDAD_LABELS: Record<DisponibilidadEstado, string> = {
  disponible: 'Disponible',
  no_disponible: 'No disponible',
  preferido: 'Preferido',
};

export interface Disponibilidad {
  id: string;
  docenteId: string;
  periodoId: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  estado: DisponibilidadEstado;
  createdAt: string;
  updatedAt: string;
}
