import { IHorarioRepository } from '../../domain/repositories/horario.repository';
import { approveHorarioSchema, ApproveHorarioDTO } from '../dtos/approve-horario.dto';

export interface PublishHorarioResult {
  success: boolean;
  message?: string;
}

export class PublishHorarioUseCase {
  constructor(private readonly horarioRepository: IHorarioRepository) {}

  async execute(dto: ApproveHorarioDTO): Promise<PublishHorarioResult> {
    const validated = approveHorarioSchema.parse(dto);

    const horario = await this.horarioRepository.findById(validated.horarioId);
    if (!horario) {
      return { success: false, message: 'Horario no encontrado.' };
    }

    if (horario.estado !== 'aprobado') {
      return { success: false, message: `El horario debe estar en estado "Aprobado" para publicar. Estado actual: "${horario.estado}".` };
    }

    await this.horarioRepository.updateEstado(validated.horarioId, 'publicado');

    // TODO: Enviar notificación a docentes cuando el módulo de notificaciones esté implementado (RF-041)

    return { success: true };
  }
}
