export const ACTIVIDADES_NO_LECTIVAS = [
  'Preparación y Evaluación',
  'Consejería y Tutoría',
  'Investigación',
  'Capacitación',
  'Actividades de Gobierno',
  'Actividades de Administración',
  'Asesoría de Tesis, Exámenes Profesionales y Experiencia Profesional',
  'Responsabilidad Social Universitaria',
  'Comités Técnicos y Comisiones',
] as const;

export type ActividadNoLectivaTipo = typeof ACTIVIDADES_NO_LECTIVAS[number];

export type CargaNoLectivaEstado = 'Borrador' | 'En revisión' | 'Aprobado' | 'Rechazado';

export const ACTIVIDADES_NO_LECTIVAS_INSTRUCTIONS: Record<ActividadNoLectivaTipo, string> = {
  'Preparación y Evaluación': 'Máximo 50% de trabajo lectivo. Describe las actividades de preparación y evaluación de clases.',
  'Consejería y Tutoría': 'Indica número de alumnos y ciclo académico. Mínimo 1 hora semanal.',
  'Investigación': 'Registra número de inscripción, código, nombre y duración del proyecto. Mínimo 4 a 5 horas semanales.',
  'Capacitación': 'Describe la capacitación dentro del plan de la Facultad. Mínimo 5 horas semanales.',
  'Actividades de Gobierno': 'Si desempeña cargo, indica el puesto y responsabilidades.',
  'Actividades de Administración': 'Si desempeña cargo administrativo, indica el puesto y funciones.',
  'Asesoría de Tesis, Exámenes Profesionales y Experiencia Profesional': 'Indica número de Resolución Decanal, nombre y duración de la actividad.',
  'Responsabilidad Social Universitaria': 'Describe la actividad o proyecto en beneficio de la comunidad. Máximo 2 horas semanales.',
  'Comités Técnicos y Comisiones': 'Consigna número de Resolución y lapso de vigencia.',
};

export interface ActividadNoLectiva {
  id: string;
  docenteId: string;
  periodoId: string;
  tipo: ActividadNoLectivaTipo;
  horas: number;
  detalles: string;
  dia?: string;
  bloque?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CargaNoLectiva {
  id: string;
  docenteId: string;
  periodoId: string;
  horasLectivasAsignadas: number;
  horasLectivasNoAsignadas: number;
  lectivaDeclarada: boolean;
  declaracionLectiva: string;
  totalHoras: number;
  estado: CargaNoLectivaEstado;
  directorAprobado: boolean;
  secretariaAprobado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CargaNoLectivaWithDocente extends CargaNoLectiva {
  docenteNombre: string;
  docenteEmail?: string;
}
