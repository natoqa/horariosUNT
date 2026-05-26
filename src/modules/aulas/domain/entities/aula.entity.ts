import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export interface Aula {
  id: string;
  codigo: string;
  nombre: string;
  pabellon: string | null;
  piso: number | null;
  capacidad: number;
  tipo: 'Aula Teórica' | 'Laboratorio de Cómputo' | 'Laboratorio Especializado' | 'Auditorio';
  equipamiento: string[];
  estado: 'Activa' | 'Inactiva' | 'Mantenimiento';
  createdAt: string;
  updatedAt: string;
}

export interface AulaRestriccion {
  id: string;
  aulaId: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  motivo: string | null;
  createdAt: string;
}
