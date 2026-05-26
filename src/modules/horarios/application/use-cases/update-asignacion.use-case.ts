import { IHorarioRepository } from '../../domain/repositories/horario.repository';
import { UpdateAsignacionDTO, updateAsignacionSchema } from '../dtos/update-asignacion.dto';
import { Asignacion } from '../../domain/entities/horario.entity';
import {
  PartialAssignment,
  Violation,
  validateHardConstraints,
  validateMaxConsecutiveHours,
} from '../../domain/services/constraint-validator.service';

export interface EnrichedAsignacionContext {
  grupoId: string;
  ciclo: string;
  aulaCapacidad: number;
  numEstudiantes: number;
  aulaType: string;
  requiereLaboratorio: boolean;
}

export interface UpdateAsignacionResult {
  success: boolean;
  asignacion?: Asignacion;
  violations?: Violation[];
  message?: string;
}

export class UpdateAsignacionUseCase {
  constructor(private readonly horarioRepository: IHorarioRepository) {}

  async execute(
    dto: UpdateAsignacionDTO,
    contextLookup: (asignacionId: string, newAulaId?: string) => Promise<EnrichedAsignacionContext | null>,
    allAsignaciones: Asignacion[],
    allContexts: Map<string, EnrichedAsignacionContext>,
  ): Promise<UpdateAsignacionResult> {
    const validated = updateAsignacionSchema.parse(dto);

    const current = await this.horarioRepository.findAsignacionById(validated.asignacionId);
    if (!current) {
      return { success: false, message: 'Asignación no encontrada.' };
    }

    const newDocenteId = validated.docenteId ?? current.docenteId;
    const newAulaId = validated.aulaId ?? current.aulaId;
    const newDia = validated.dia ?? current.dia;
    const newBloque = validated.bloque ?? current.bloque;

    const context = await contextLookup(validated.asignacionId, validated.aulaId);
    if (!context) {
      return { success: false, message: 'No se pudo obtener el contexto de la asignación.' };
    }

    const candidate: PartialAssignment = {
      grupoId: context.grupoId,
      docenteId: newDocenteId,
      aulaId: newAulaId,
      dia: newDia,
      bloque: newBloque,
      tipo: current.tipo,
      ciclo: context.ciclo,
      aulaCapacidad: context.aulaCapacidad,
      numEstudiantes: context.numEstudiantes,
      aulaType: context.aulaType,
      requiereLaboratorio: context.requiereLaboratorio,
    };

    const otherAsignaciones = allAsignaciones.filter((a) => a.id !== current.id);
    const existing: PartialAssignment[] = otherAsignaciones.map((a) => {
      const ctx = allContexts.get(a.id);
      return {
        grupoId: a.grupoId,
        docenteId: a.docenteId,
        aulaId: a.aulaId,
        dia: a.dia,
        bloque: a.bloque,
        tipo: a.tipo,
        ciclo: ctx?.ciclo ?? '',
        aulaCapacidad: ctx?.aulaCapacidad ?? 0,
        numEstudiantes: ctx?.numEstudiantes ?? 0,
        aulaType: ctx?.aulaType ?? '',
        requiereLaboratorio: ctx?.requiereLaboratorio ?? false,
      };
    });

    const hardViolations = validateHardConstraints(existing, candidate);
    const consecutiveViolations = validateMaxConsecutiveHours(existing, candidate);
    const allViolations = [...hardViolations, ...consecutiveViolations];

    if (allViolations.length > 0) {
      return { success: false, violations: allViolations };
    }

    const updateData: Partial<Pick<Asignacion, 'docenteId' | 'aulaId' | 'dia' | 'bloque'>> = {};
    if (validated.docenteId) updateData.docenteId = validated.docenteId;
    if (validated.aulaId) updateData.aulaId = validated.aulaId;
    if (validated.dia) updateData.dia = validated.dia;
    if (validated.bloque) updateData.bloque = validated.bloque;

    const updated = await this.horarioRepository.updateAsignacion(
      validated.asignacionId,
      updateData,
    );

    return { success: true, asignacion: updated };
  }
}
