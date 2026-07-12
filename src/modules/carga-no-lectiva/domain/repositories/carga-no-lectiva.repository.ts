import { ActividadNoLectiva, ActividadNoLectivaTipo, CargaNoLectiva, CargaNoLectivaWithDocente } from '../entities/carga-no-lectiva.entity';

export interface ActividadNoLectivaInput {
  tipo: ActividadNoLectivaTipo;
  horas: number;
  detalles: string;
  dia?: string;
  bloque?: string;
}

export interface ICargaNoLectivaRepository {
  findActividadesByDocentePeriodo(docenteId: string, periodoId: string): Promise<ActividadNoLectiva[]>;
  saveActividades(docenteId: string, periodoId: string, actividades: ActividadNoLectivaInput[]): Promise<ActividadNoLectiva[]>;
  findCargaTotalByDocentePeriodo(docenteId: string, periodoId: string): Promise<CargaNoLectiva | null>;
  saveCargaTotal(docenteId: string, periodoId: string, totalHoras: number): Promise<CargaNoLectiva>;
  saveCargaMeta(docenteId: string, periodoId: string, meta: Partial<Pick<CargaNoLectiva, 'horasLectivasAsignadas' | 'horasLectivasNoAsignadas' | 'lectivaDeclarada' | 'declaracionLectiva'>>): Promise<CargaNoLectiva>;
  listCargasByPeriodo(periodoId: string): Promise<CargaNoLectivaWithDocente[]>;
  approveCargaTotal(cargaId: string, role: 'director' | 'secretaria'): Promise<CargaNoLectiva>;
  resetAllCargas(periodoId: string): Promise<void>;
}
