import { AuditLog } from '../entities/audit-log.entity';

export interface IAuditoriaRepository {
  findAll(filters?: {
    userEmail?: string;
    modulo?: string;
    accion?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]>;
  save(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
}
