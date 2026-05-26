import { IHorarioRepository } from '../../domain/repositories/horario.repository';
import { Horario, Asignacion } from '../../domain/entities/horario.entity';

export interface GetHorarioResult {
  horario: Horario;
  asignaciones: Asignacion[];
}

export class GetHorarioUseCase {
  constructor(private readonly horarioRepository: IHorarioRepository) {}

  async execute(periodoId: string): Promise<GetHorarioResult | null> {
    const horario = await this.horarioRepository.findByPeriodo(periodoId);
    if (!horario) return null;

    const asignaciones = await this.horarioRepository.findAsignacionesByHorario(horario.id);
    return { horario, asignaciones };
  }
}
