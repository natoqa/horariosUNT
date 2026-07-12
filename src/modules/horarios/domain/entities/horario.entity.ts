import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export const HORARIO_ESTADOS = ['Borrador', 'Aprobado', 'Publicado'] as const;
export type HorarioEstado = typeof HORARIO_ESTADOS[number];

export const HORARIO_ESTADO_LABELS: Record<HorarioEstado, string> = {
  Borrador: 'Borrador',
  Aprobado: 'Aprobado',
  Publicado: 'Publicado',
};

export const ASIGNACION_TIPOS = ['teorico', 'practico'] as const;
export type AsignacionTipo = typeof ASIGNACION_TIPOS[number];

export const ASIGNACION_TIPO_LABELS: Record<AsignacionTipo, string> = {
  teorico: 'Teórico',
  practico: 'Práctico',
};

export interface GenerationSummary {
  totalCursos: number;
  cursosAsignados: number;
  cursosNoAsignados: number;
  porcentajePreferencias: number;
  cargaPromedio: number;
  cargaMaxima: number;
  cargaMinima: number;
}

export interface Horario {
  id: string;
  periodoId: string;
  estado: HorarioEstado;
  fechaGeneracion: string;
  resumen?: GenerationSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asignacion {
  id: string;
  horarioId: string;
  grupoId: string;
  docenteId: string;
  aulaId: string;
  dia: DiaSemana | 'Pendiente';
  bloque: BloqueHorario | 'Pendiente';
  tipo: AsignacionTipo;
  createdAt: string;
}
