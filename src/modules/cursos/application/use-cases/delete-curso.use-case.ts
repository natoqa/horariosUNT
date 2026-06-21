import { ICursoRepository } from '../../domain/repositories/curso.repository';
import { SupabaseCursoRepository } from '../../infrastructure/supabase-curso.repository';

export class DeleteCursoUseCase {
  private repository: ICursoRepository;

  constructor(repository?: ICursoRepository) {
    this.repository = repository || new SupabaseCursoRepository();
  }

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
