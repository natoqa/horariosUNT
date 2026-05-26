import { IPeriodoRepository } from '../../domain/repositories/periodo.repository';
import { Periodo } from '../../domain/entities/periodo.entity';

export class GetPeriodosUseCase {
  constructor(private readonly periodoRepository: IPeriodoRepository) {}

  async execute(): Promise<Periodo[]> {
    return this.periodoRepository.findAll();
  }
}
