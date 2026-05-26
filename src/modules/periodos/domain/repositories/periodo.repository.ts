import { Periodo } from '../entities/periodo.entity';
import { EstadoPeriodo } from '@/shared/constants/period-states';

export interface IPeriodoRepository {
  findById(id: string): Promise<Periodo | null>;
  findAll(): Promise<Periodo[]>;
  findActive(): Promise<Periodo | null>;
  save(periodo: Omit<Periodo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Periodo>;
  update(id: string, data: Partial<Omit<Periodo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Periodo>;
  updateState(id: string, state: EstadoPeriodo): Promise<Periodo>;
}
