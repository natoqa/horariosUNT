import { IAuditoriaRepository } from '../../domain/repositories/auditoria.repository';
import { AuditLog } from '../../domain/entities/audit-log.entity';

export class RegistrarAuditoriaUseCase {
  constructor(private readonly repository: IAuditoriaRepository) {}

  async execute(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    return this.repository.save(log);
  }
}
