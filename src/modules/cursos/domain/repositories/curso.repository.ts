import { Curso } from '../entities/curso.entity';
import { Grupo } from '../entities/grupo.entity';

export interface CursoFilters {
  search?: string;
  ciclo?: string;
  tipoCiclo?: 'Impar' | 'Par';
  tipo?: string;
  estado?: string;
  planEstudioId?: string;
}

export interface ICursoRepository {
  findById(id: string): Promise<Curso | null>;
  findAll(filters?: CursoFilters): Promise<Curso[]>;
  findByCodigo(codigo: string): Promise<Curso | null>;
  save(curso: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>): Promise<Curso>;
  saveBatch(cursos: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Curso[]>;
  update(id: string, data: Partial<Omit<Curso, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>>): Promise<Curso>;
  delete(id: string): Promise<void>;
  
  // Grupos
  findGruposByPeriodo(periodoId: string): Promise<Grupo[]>;
  findGruposByCursoAndPeriodo(cursoId: string, periodoId: string): Promise<Grupo[]>;
  saveGrupo(grupo: Omit<Grupo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Grupo>;
  deleteGrupo(id: string): Promise<void>;
}
