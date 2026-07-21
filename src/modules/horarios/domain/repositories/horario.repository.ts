import { Horario, Asignacion, GenerationSummary, HorarioEstado } from '../entities/horario.entity';
import { GeneratedAssignment } from '../services/schedule-generator.service';

export interface IHorarioRepository {
  findByPeriodo(periodoId: string): Promise<Horario | null>;
  findById(id: string): Promise<Horario | null>;
  save(periodoId: string, resumen?: GenerationSummary): Promise<Horario>;
  saveAsignaciones(horarioId: string, asignaciones: GeneratedAssignment[]): Promise<Asignacion[]>;
  deleteAsignacionesByHorario(horarioId: string): Promise<void>;
  findAsignacionesByHorario(horarioId: string): Promise<Asignacion[]>;
  findAsignacionById(id: string): Promise<Asignacion | null>;
  updateAsignacion(id: string, data: Partial<Pick<Asignacion, 'docenteId' | 'aulaId' | 'dia' | 'bloque'>>): Promise<Asignacion>;
  updateEstado(id: string, estado: HorarioEstado): Promise<Horario>;
  saveManualAsignacion(horarioId: string, asignacion: GeneratedAssignment): Promise<Asignacion>;
  deleteAsignacion(id: string): Promise<void>;
}
