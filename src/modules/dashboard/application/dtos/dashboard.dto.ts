export interface DashboardDirectorDTO {
  estadoPeriodo: string;
  porcentajeDisponibilidad: number;
  totalDocentes: number;
  docentesConDisponibilidad: number;
  cargaPromedio: number;
  cargaMaxima: number;
  cargaMinima: number;
  ocupacionAulas: number;
  totalCursos: number;
  cursosAsignados: number;
  alertas: Alerta[];
  cargaHoraria: CargaHorariaStats;
  notificacionesPendientes: number;
  generacionHabilitada: boolean;
  docentesPendientesGeneracion: number;
}

export interface DashboardSecretariaDTO {
  totalDocentes: number;
  totalCursos: number;
  totalAulas: number;
  totalGrupos: number;
  docentesActivos: number;
  cursosActivos: number;
  aulasActivas: number;
  cargaHoraria: CargaHorariaStats;
  docentesPendientesCarga: number;
  gruposSinDocente: number;
}

export interface DashboardDocenteDTO {
  estadoDisponibilidad: string;
  cargaAsignada: number;
  cargaMaxima: number;
  horarioSemanal: AsignacionSemanal[];
  cargaHoraria: CargaHorariaDocente;
  cursosAsignados: CursoAsignado[];
  estadoCargaNoLectiva: string;
  notificaciones: number;
}

export interface CargaHorariaStats {
  totalDocentes: number;
  docentesConCargaRegistrada: number;
  docentesConCargaAprobada: number;
  cargaTotalLectiva: number;
  cargaTotalNoLectiva: number;
  cargaTotal: number;
}

export interface CargaHorariaDocente {
  cargaElectiva: number;
  cargaNoLectiva: number;
  cargaTotal: number;
  horasDisponiblesNoLectivas: number;
  estadoAprobacion: string;
  directorAprobado: boolean;
  secretariaAprobado: boolean;
}

export interface CursoAsignado {
  codigo: string;
  nombre: string;
  ciclo: number;
  horas: number;
  grupo: string;
}

export interface AsignacionSemanal {
  dia: string;
  bloque: string;
  curso: string;
  aula: string;
}

export interface Alerta {
  id: string;
  tipo: 'conflicto' | 'pendiente' | 'advertencia';
  mensaje: string;
  severidad: 'alta' | 'media' | 'baja';
}
