import { ICursoRepository } from '../../domain/repositories/curso.repository';
import { SupabaseCursoRepository } from '../../infrastructure/supabase-curso.repository';

export class ResetAsignacionesUseCase {
  private repository: ICursoRepository;

  constructor(repository?: ICursoRepository) {
    this.repository = repository || new SupabaseCursoRepository();
  }

  async execute(periodoId: string): Promise<void> {
    return this.repository.resetAsignaciones(periodoId);
  }
}