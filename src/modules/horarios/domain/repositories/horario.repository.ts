import { Horario, Asignacion, GenerationSummary } from '../entities/horario.entity';
import { GeneratedAssignment } from '../services/schedule-generator.service';

export interface IHorarioRepository {
  findByPeriodo(periodoId: string): Promise<Horario | null>;
  findById(id: string): Promise<Horario | null>;
  save(periodoId: string, resumen: GenerationSummary): Promise<Horario>;
  saveAsignaciones(horarioId: string, asignaciones: GeneratedAssignment[]): Promise<Asignacion[]>;
  deleteAsignacionesByHorario(horarioId: string): Promise<void>;
  findAsignacionesByHorario(horarioId: string): Promise<Asignacion[]>;
}
