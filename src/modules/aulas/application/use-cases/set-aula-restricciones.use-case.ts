import { IAulaRepository } from '../../domain/repositories/aula.repository';
import { AulaRestriccion } from '../../domain/entities/aula.entity';
import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

export interface SetRestriccionesInput {
  aulaId: string;
  restricciones: {
    dia: DiaSemana;
    bloque: BloqueHorario;
    motivo?: string | null;
  }[];
}

export class SetAulaRestriccionesUseCase {
  constructor(private readonly aulaRepository: IAulaRepository) {}

  async execute(input: SetRestriccionesInput): Promise<AulaRestriccion[]> {
    // 1. Limpiar las restricciones anteriores del aula
    await this.aulaRepository.clearRestricciones(input.aulaId);

    // 2. Guardar las nuevas si las hay
    if (input.restricciones.length > 0) {
      const data = input.restricciones.map((r) => ({
        aulaId: input.aulaId,
        dia: r.dia,
        bloque: r.bloque,
        motivo: r.motivo || null,
      }));
      await this.aulaRepository.saveRestricciones(input.aulaId, data);
    }

    // 3. Devolver la lista actualizada de restricciones
    return this.aulaRepository.findRestriccionesByAula(input.aulaId);
  }

  async getRestriccionesForAula(aulaId: string): Promise<AulaRestriccion[]> {
    return this.aulaRepository.findRestriccionesByAula(aulaId);
  }
}
