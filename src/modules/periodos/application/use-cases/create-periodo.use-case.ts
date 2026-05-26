import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { CreatePeriodoDTO, createPeriodoSchema } from '../dtos/create-periodo.dto';
import { Periodo, TipoCiclo } from '../../domain/entities/periodo.entity';

export class CreatePeriodoUseCase {
  constructor(private readonly periodoRepository: IPeriodoRepository) {}

  async execute(dto: CreatePeriodoDTO): Promise<Periodo> {
    const validated = createPeriodoSchema.parse(dto);

    const activePeriodo = await this.periodoRepository.findActive();
    if (activePeriodo) {
      throw new Error(
        'Ya existe un período académico activo. Debe cerrar el período actual antes de crear uno nuevo.',
      );
    }

    return this.periodoRepository.save({
      name: validated.name,
      tipoCiclo: validated.tipoCiclo as TipoCiclo,
      startDate: validated.startDate,
      endDate: validated.endDate,
      availabilityDeadline: validated.availabilityDeadline,
      state: 'Configuración',
    });
  }
}
