import { IDashboardRepository } from '../../domain/repositories/dashboard.repository';
import { DashboardDocenteDTO } from '../dtos/dashboard.dto';

export class GetDashboardDocenteUseCase {
  constructor(private readonly repository: IDashboardRepository) {}

  async execute(docenteId: string): Promise<DashboardDocenteDTO> {
    return this.repository.getDocenteDashboard(docenteId);
  }
}
