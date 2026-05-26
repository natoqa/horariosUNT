import { IAuditoriaRepository } from '../../domain/repositories/auditoria.repository';
import { AuditLog } from '../../domain/entities/audit-log.entity';

export class GetAuditLogsUseCase {
  constructor(private readonly repository: IAuditoriaRepository) {}

  async execute(filters?: {
    userEmail?: string;
    modulo?: string;
    accion?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    return this.repository.findAll(filters);
  }
}
