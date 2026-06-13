import { IDashboardRepository } from '../../domain/repositories/dashboard.repository';
import { DashboardSecretariaDTO } from '../dtos/dashboard.dto';

export class GetDashboardSecretariaUseCase {
  constructor(private readonly repository: IDashboardRepository) {}

  async execute(): Promise<DashboardSecretariaDTO> {
    return this.repository.getSecretariaDashboard();
  }
}
