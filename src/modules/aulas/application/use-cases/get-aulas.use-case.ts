import { IAulaRepository, AulaFilters } from '../../domain/repositories/aula.repository';
import { Aula } from '../../domain/entities/aula.entity';

export class GetAulasUseCase {
  constructor(private readonly aulaRepository: IAulaRepository) {}

  async execute(filters?: AulaFilters): Promise<Aula[]> {
    return this.aulaRepository.findAll(filters);
  }
}
