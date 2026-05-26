import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { UpdatePeriodoDTO, updatePeriodoSchema } from '../dtos/update-periodo.dto';
import { Periodo } from '../../domain/entities/periodo.entity';

export class UpdatePeriodoUseCase {
  constructor(private readonly periodoRepository: IPeriodoRepository) {}

  async execute(dto: UpdatePeriodoDTO): Promise<Periodo> {
    const validated = updatePeriodoSchema.parse(dto);

    const periodo = await this.periodoRepository.findById(validated.id);
    if (!periodo) {
      throw new Error('Período no encontrado.');
    }

    if (periodo.state !== 'Configuración') {
      throw new Error(
        'Solo se puede editar un período en estado "Configuración".',
      );
    }

    return this.periodoRepository.update(validated.id, {
      name: validated.name,
      startDate: validated.startDate,
      endDate: validated.endDate,
      availabilityDeadline: validated.availabilityDeadline,
    });
  }
}
