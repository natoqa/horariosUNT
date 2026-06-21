import { IHorarioRepository } from '../../domain/repositories/horario.repository';
import { UpdateAsignacionUseCase, EnrichedAsignacionContext } from './update-asignacion.use-case';
import { UpdateAsignacionDTO } from '../dtos/update-asignacion.dto';
import { Asignacion } from '../../domain/entities/horario.entity';
import { Violation } from '../../domain/services/constraint-validator.service';
import { RegistrarAuditoriaUseCase } from '@/modules/auditoria';
import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export interface PostPublishUpdateResult {
  success: boolean;
  asignacion?: Asignacion;
  violations?: Violation[];
  message?: string;
}

export interface PostPublishContext {
  userId: string;
  userEmail: string;
  userRole: string;
}

export class PostPublishUpdateUseCase {
  constructor(
    private readonly horarioRepository: IHorarioRepository,
    private readonly updateUseCase: UpdateAsignacionUseCase,
    private readonly auditoriaUseCase: RegistrarAuditoriaUseCase,
  ) {}

  async execute(
    dto: UpdateAsignacionDTO,
    contextLookup: (asignacionId: string, newAulaId?: string) => Promise<EnrichedAsignacionContext | null>,
    allAsignaciones: Asignacion[],
    allContexts: Map<string, EnrichedAsignacionContext>,
    userContext: PostPublishContext,
  ): Promise<PostPublishUpdateResult> {
    const horario = await this.getHorarioFromAsignacion(dto.asignacionId, allAsignaciones);
    if (!horario) {
      return { success: false, message: 'No se pudo determinar el horario de la asignación.' };
    }

    if (horario.estado !== 'Publicado') {
      return { success: false, message: 'Esta acción solo aplica a horarios publicados.' };
    }

    const currentAsignacion = allAsignaciones.find((a) => a.id === dto.asignacionId);
    if (!currentAsignacion) {
      return { success: false, message: 'Asignación no encontrada.' };
    }

    const datosAnteriores = {
      docenteId: currentAsignacion.docenteId,
      aulaId: currentAsignacion.aulaId,
      dia: currentAsignacion.dia,
      bloque: currentAsignacion.bloque,
    };

    const result = await this.updateUseCase.execute(dto, contextLookup, allAsignaciones, allContexts);

    if (!result.success) {
      return {
        success: false,
        violations: result.violations,
        message: result.message,
      };
    }

    const datosNuevos = {
      docenteId: dto.docenteId ?? currentAsignacion.docenteId,
      aulaId: dto.aulaId ?? currentAsignacion.aulaId,
      dia: (dto.dia as DiaSemana) ?? currentAsignacion.dia,
      bloque: (dto.bloque as BloqueHorario) ?? currentAsignacion.bloque,
    };

    await this.auditoriaUseCase.execute({
      userId: userContext.userId,
      userEmail: userContext.userEmail,
      userRole: userContext.userRole,
      modulo: 'horarios',
      accion: 'modificacion_post_publicacion',
      entidadId: dto.asignacionId,
      datosAnteriores,
      datosNuevos,
      descripcion: `Cambio post-publicación: ${dto.motivo}`,
    });

    // TODO: Enviar notificación al docente afectado cuando el módulo de notificaciones esté implementado (RF-056/RN-027)

    return { success: true, asignacion: result.asignacion };
  }

  private async getHorarioFromAsignacion(asignacionId: string, allAsignaciones: Asignacion[]) {
    const asignacion = allAsignaciones.find((a) => a.id === asignacionId);
    if (!asignacion) return null;
    return this.horarioRepository.findById(asignacion.horarioId);
  }
}
