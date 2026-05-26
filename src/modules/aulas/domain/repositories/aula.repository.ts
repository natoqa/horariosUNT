import { Aula, AulaRestriccion } from '../entities/aula.entity';

export interface AulaFilters {
  search?: string;
  tipo?: string;
  estado?: string;
  capacidadMin?: number;
}

export interface IAulaRepository {
  findById(id: string): Promise<Aula | null>;
  findAll(filters?: AulaFilters): Promise<Aula[]>;
  findByCodigo(codigo: string): Promise<Aula | null>;
  save(aula: Omit<Aula, 'id' | 'createdAt' | 'updatedAt'>): Promise<Aula>;
  update(id: string, data: Partial<Omit<Aula, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>>): Promise<Aula>;
  
  // Restricciones
  findRestriccionesByAula(aulaId: string): Promise<AulaRestriccion[]>;
  saveRestricciones(aulaId: string, restricciones: Omit<AulaRestriccion, 'id' | 'createdAt'>[]): Promise<void>;
  clearRestricciones(aulaId: string): Promise<void>;
}
