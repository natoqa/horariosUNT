import { DashboardDirectorDTO, DashboardSecretariaDTO, DashboardDocenteDTO } from '../../application/dtos/dashboard.dto';

export interface IDashboardRepository {
  getDirectorDashboard(): Promise<DashboardDirectorDTO>;
  getSecretariaDashboard(): Promise<DashboardSecretariaDTO>;
  getDocenteDashboard(docenteId: string): Promise<DashboardDocenteDTO>;
}
