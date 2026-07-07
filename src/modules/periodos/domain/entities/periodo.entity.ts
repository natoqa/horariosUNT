import { EstadoPeriodo } from '@/shared/constants/period-states';

export type TipoCiclo = 'Impar' | 'Par';

export const CICLOS_IMPAR = ['I', 'III', 'V', 'VII', 'IX'] as const;
export const CICLOS_PAR = ['II', 'IV', 'VI', 'VIII', 'X'] as const;

export type CicloType = typeof CICLOS_IMPAR[number] | typeof CICLOS_PAR[number];

export function getCiclosByTipo(tipo: TipoCiclo): string[] {
  return tipo === 'Impar' ? [...CICLOS_IMPAR] : [...CICLOS_PAR];
}

export interface Periodo {
  id: string;
  name: string;
  tipoCiclo: TipoCiclo;
  startDate: string;
  endDate: string;
  availabilityDeadline: string;
  state: EstadoPeriodo;
  createdAt: string;
  updatedAt: string;
}

const VALID_TRANSITIONS: Record<EstadoPeriodo, EstadoPeriodo[]> = {
  'Configuración': ['Recopilación'],
  'Recopilación': ['Generación'],
  'Generación': ['Recopilación', 'Aprobado'],
  'Aprobado': ['Publicado'],
  'Publicado': ['Cerrado'],
  'Cerrado': [],
};

export function canTransitionTo(
  currentState: EstadoPeriodo,
  newState: EstadoPeriodo,
): boolean {
  return VALID_TRANSITIONS[currentState]?.includes(newState) ?? false;
}

export function getNextStates(currentState: EstadoPeriodo): EstadoPeriodo[] {
  return VALID_TRANSITIONS[currentState] ?? [];
}
