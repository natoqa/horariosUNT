import { EstadoPeriodo } from '@/shared/constants/period-states';

export interface Periodo {
  id: string;
  name: string;
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
