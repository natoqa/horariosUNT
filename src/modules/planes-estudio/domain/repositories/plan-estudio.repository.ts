import { PlanEstudio } from '../entities/plan-estudio.entity';

export interface IPlanEstudioRepository {
  findAll(): Promise<PlanEstudio[]>;
  findById(id: string): Promise<PlanEstudio | null>;
  create(data: Omit<PlanEstudio, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanEstudio>;
  update(id: string, data: Partial<Omit<PlanEstudio, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PlanEstudio>;
  delete(id: string): Promise<void>;
}
