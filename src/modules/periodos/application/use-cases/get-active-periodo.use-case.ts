import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { Periodo } from '../../domain/entities/periodo.entity';

export class GetActivePeriodoUseCase {
  constructor(private readonly periodoRepository: IPeriodoRepository) {}

  async execute(): Promise<Periodo | null> {
    return this.periodoRepository.findActive();
  }
}
