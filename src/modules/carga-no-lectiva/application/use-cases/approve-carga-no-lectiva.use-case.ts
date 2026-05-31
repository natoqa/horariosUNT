import { ICargaNoLectivaRepository } from '../../domain/repositories/carga-no-lectiva.repository';
import { UserRole } from '@/shared/types/roles';

export class ApproveCargaNoLectivaUseCase {
  constructor(private readonly repository: ICargaNoLectivaRepository) {}

  async execute(cargaId: string, role: UserRole) {
    if (role !== 'director' && role !== 'secretaria') {
      throw new Error('Solo director o secretaria pueden aprobar la carga no lectiva.');
    }

    return this.repository.approveCargaTotal(cargaId, role);
  }
}
