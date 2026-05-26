import { ICursoRepository, CursoFilters } from '../../domain/repositories/curso.repository';
import { Curso } from '../../domain/entities/curso.entity';

export class GetCursosUseCase {
  constructor(private readonly cursoRepository: ICursoRepository) {}

  async execute(filters?: CursoFilters): Promise<Curso[]> {
    return this.cursoRepository.findAll(filters);
  }
}
