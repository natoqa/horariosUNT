import { IHorarioRepository } from '../../domain/repositories/horario.repository';
import { Horario, Asignacion } from '../../domain/entities/horario.entity';
import {
  generateSchedule,
  GenerationInput,
  GenerationResult,
} from '../../domain/services/schedule-generator.service';
import { generateHorarioSchema } from '../dtos/generate-horario.dto';

export interface GenerateHorarioResult {
  horario: Horario;
  asignaciones: Asignacion[];
  generationResult: GenerationResult;
}

export class GenerateHorarioUseCase {
  constructor(private readonly horarioRepository: IHorarioRepository) {}

  async execute(
    periodoId: string,
    input: GenerationInput,
  ): Promise<GenerateHorarioResult> {
    generateHorarioSchema.parse({ periodoId });

    // Delete existing draft if any
    const existing = await this.horarioRepository.findByPeriodo(periodoId);
    if (existing) {
      await this.horarioRepository.deleteAsignacionesByHorario(existing.id);
    }

    // Run algorithm
    const generationResult = generateSchedule(input);

    // Save horario
    const horario = existing
      ? await this.horarioRepository.save(periodoId, generationResult.summary)
      : await this.horarioRepository.save(periodoId, generationResult.summary);

    // Save asignaciones
    const asignaciones = generationResult.assignments.length > 0
      ? await this.horarioRepository.saveAsignaciones(horario.id, generationResult.assignments)
      : [];

    return { horario, asignaciones, generationResult };
  }
}
