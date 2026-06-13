import {
  CategoriaDocente,
  RegimenDocente,
  CondicionDocente,
  EscuelaProcedencia,
} from '@/shared/constants/categories';

export interface Docente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string | null;
  categoria: CategoriaDocente;
  regimen: RegimenDocente;
  condicion: CondicionDocente;
  escuela: EscuelaProcedencia;
  fechaIngreso: string;
  cargaMaxima: number;
  cargaElectiva: number;
  estado: 'Activo' | 'Inactivo';
  createdAt: string;
  updatedAt: string;
}

export function calcularAntiguedad(fechaIngreso: string): number {
  const ingreso = new Date(fechaIngreso);
  const hoy = new Date();
  const diffMs = hoy.getTime() - ingreso.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}

export function getCargaMaximaDefault(regimen: RegimenDocente): number {
  switch (regimen) {
    case 'Dedicación Exclusiva':
      return 40;
    case 'Tiempo Completo':
      return 20;
    case 'Tiempo Parcial':
      return 12;
  }
}

export function getHorasDisponiblesNoLectivas(docente: Docente): number {
  return Math.max(0, docente.cargaMaxima - docente.cargaElectiva);
}
