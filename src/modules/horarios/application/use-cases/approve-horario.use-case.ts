import { IHorarioRepository } from '../../domain/repositories/horario.repository';
import { Violation, PartialAssignment, validateHardConstraints, validateMaxConsecutiveHours } from '../../domain/services/constraint-validator.service';
import { Asignacion } from '../../domain/entities/horario.entity';
import { ApproveHorarioDTO, approveHorarioSchema } from '../dtos/approve-horario.dto';

export interface EnrichedAsignacionForApproval {
  grupoId: string;
  ciclo: string;
  aulaCapacidad: number;
  numEstudiantes: number;
  aulaType: string;
  requiereLaboratorio: boolean;
}

export interface ApproveHorarioResult {
  success: boolean;
  message?: string;
  violations?: Violation[];
}

export class ApproveHorarioUseCase {
  constructor(private readonly horarioRepository: IHorarioRepository) {}

  async execute(
    dto: ApproveHorarioDTO,
    asignaciones: Asignacion[],
    contextMap: Map<string, EnrichedAsignacionForApproval>,
  ): Promise<ApproveHorarioResult> {
    const validated = approveHorarioSchema.parse(dto);

    const horario = await this.horarioRepository.findById(validated.horarioId);
    if (!horario) {
      return { success: false, message: 'Horario no encontrado.' };
    }

    if (horario.estado !== 'Borrador') {
      return { success: false, message: `El horario debe estar en estado "Borrador" para aprobar. Estado actual: "${horario.estado}".` };
    }

    const allViolations = this.validateAllAsignaciones(asignaciones, contextMap);
    if (allViolations.length > 0) {
      return { success: false, violations: allViolations, message: 'No se puede aprobar: existen conflictos.' };
    }

    await this.horarioRepository.updateEstado(validated.horarioId, 'Aprobado');

    return { success: true };
  }

  private validateAllAsignaciones(
    asignaciones: Asignacion[],
    contextMap: Map<string, EnrichedAsignacionForApproval>,
  ): Violation[] {
    const violations: Violation[] = [];
    const seen = new Set<string>();

    for (const asignacion of asignaciones) {
      const ctx = contextMap.get(asignacion.id);
      if (!ctx) continue;

      const candidate: PartialAssignment = {
        grupoId: asignacion.grupoId,
        docenteId: asignacion.docenteId,
        aulaId: asignacion.aulaId,
        dia: asignacion.dia,
        bloque: asignacion.bloque,
        tipo: asignacion.tipo,
        ciclo: ctx.ciclo,
        aulaCapacidad: ctx.aulaCapacidad,
        numEstudiantes: ctx.numEstudiantes,
        aulaType: ctx.aulaType,
        requiereLaboratorio: ctx.requiereLaboratorio,
      };

      const others = asignaciones
        .filter((a) => a.id !== asignacion.id)
        .map((a) => {
          const c = contextMap.get(a.id);
          if (!c) return null;
          return {
            grupoId: a.grupoId,
            docenteId: a.docenteId,
            aulaId: a.aulaId,
            dia: a.dia,
            bloque: a.bloque,
            tipo: a.tipo,
            ciclo: c.ciclo,
            aulaCapacidad: c.aulaCapacidad,
            numEstudiantes: c.numEstudiantes,
            aulaType: c.aulaType,
            requiereLaboratorio: c.requiereLaboratorio,
          } as PartialAssignment;
        })
        .filter((a): a is PartialAssignment => a !== null);

      const hardViolations = validateHardConstraints(others, candidate);
      const consecutiveViolations = validateMaxConsecutiveHours(others, candidate);

      for (const v of [...hardViolations, ...consecutiveViolations]) {
        const key = `${v.rule}:${v.message}`;
        if (!seen.has(key)) {
          seen.add(key);
          violations.push(v);
        }
      }
    }

    return violations;
  }
}
