import { IDocenteRepository, DocenteFilters } from '../../domain/repositories/docente.repository';
import { Docente } from '../../domain/entities/docente.entity';

export class GetDocentesUseCase {
  constructor(private readonly docenteRepository: IDocenteRepository) {}

  async execute(filters?: DocenteFilters): Promise<Docente[]> {
    return this.docenteRepository.findAll(filters);
  }
}
