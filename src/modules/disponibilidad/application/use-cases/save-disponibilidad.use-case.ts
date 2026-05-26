import { IDisponibilidadRepository, DisponibilidadBlock } from '../../domain/repositories/disponibilidad.repository';
import { Disponibilidad } from '../../domain/entities/disponibilidad.entity';
import { saveDisponibilidadSchema } from '../dtos/save-disponibilidad.dto';
import { Periodo } from '@/modules/periodos';
import { getCargaMaximaDefault } from '@/modules/docentes';
import { RegimenDocente } from '@/shared/constants/categories';

export class SaveDisponibilidadUseCase {
  constructor(private readonly disponibilidadRepository: IDisponibilidadRepository) {}

  async execute(
    docenteId: string,
    periodoId: string,
    blocks: DisponibilidadBlock[],
    periodo: Periodo,
    docenteRegimen: RegimenDocente,
  ): Promise<Disponibilidad[]> {
    saveDisponibilidadSchema.parse({ periodoId, blocks });

    if (periodo.state !== 'Recopilación') {
      throw new Error('Solo puede registrar disponibilidad cuando el período está en estado "Recopilación".');
    }

    const availableCount = blocks.filter(
      (b) => b.estado === 'disponible' || b.estado === 'preferido',
    ).length;

    const minRequired = getCargaMaximaDefault(docenteRegimen);

    if (availableCount < minRequired) {
      throw new Error(
        `Debe registrar al menos ${minRequired} horas disponibles según su régimen (${docenteRegimen}). Actualmente tiene ${availableCount}.`,
      );
    }

    return this.disponibilidadRepository.saveBulk(docenteId, periodoId, blocks);
  }
}
