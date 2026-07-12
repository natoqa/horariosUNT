import { ICargaNoLectivaRepository } from '../../domain/repositories/carga-no-lectiva.repository';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';

export class ResetAllCargasNoLectivasUseCase {
  private repository: ICargaNoLectivaRepository;

  constructor(repository?: ICargaNoLectivaRepository) {
    this.repository = repository || new SupabaseCargaNoLectivaRepository();
  }

  async execute(periodoId: string): Promise<void> {
    return this.repository.resetAllCargas(periodoId);
  }
}
