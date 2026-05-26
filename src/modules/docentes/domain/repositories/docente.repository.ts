import { Docente } from '../entities/docente.entity';

export interface IDocenteRepository {
  findById(id: string): Promise<Docente | null>;
  findAll(filters?: DocenteFilters): Promise<Docente[]>;
  findByDni(dni: string): Promise<Docente | null>;
  findByCorreo(correo: string): Promise<Docente | null>;
  save(docente: Omit<Docente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Docente>;
  update(id: string, data: Partial<Omit<Docente, 'id' | 'dni' | 'createdAt' | 'updatedAt'>>): Promise<Docente>;
  delete(id: string): Promise<void>;
}

export interface DocenteFilters {
  search?: string;
  categoria?: string;
  estado?: string;
}
