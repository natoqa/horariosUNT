import { IPlanEstudioRepository } from '../../domain/repositories/plan-estudio.repository';
import { SupabasePlanEstudioRepository } from '../../infrastructure/supabase-plan-estudio.repository';

export class DeletePlanEstudioUseCase {
  private repository: IPlanEstudioRepository;

  constructor(repository?: IPlanEstudioRepository) {
    this.repository = repository || new SupabasePlanEstudioRepository();
  }

  async execute(id: string) {
    return this.repository.delete(id);
  }
}
