import { IDashboardRepository } from '../../domain/repositories/dashboard.repository';
import { DashboardDirectorDTO } from '../dtos/dashboard.dto';

export class GetDashboardDirectorUseCase {
  constructor(private readonly repository: IDashboardRepository) {}

  async execute(): Promise<DashboardDirectorDTO> {
    return this.repository.getDirectorDashboard();
  }
}
