export interface PlanEstudio {
  id: string;
  nombre: string;
  anio: number;
  pdfUrl: string | null;
  estado: 'Activo' | 'Inactivo';
  fechaPublicacion: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PLAN_ESTADO_LABELS: Record<PlanEstudio['estado'], string> = {
  Activo: 'Activo',
  Inactivo: 'Inactivo',
};
