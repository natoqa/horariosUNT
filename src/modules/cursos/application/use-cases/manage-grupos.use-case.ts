import { ICursoRepository } from '../../domain/repositories/curso.repository';
import { Grupo } from '../../domain/entities/grupo.entity';
import { z } from 'zod';

export const createGrupoSchema = z.object({
  cursoId: z.string().uuid('ID de curso no válido'),
  periodoId: z.string().uuid('ID de período no válido'),
  nombre: z
    .string()
    .min(1, 'El nombre de sección no puede estar vacío')
    .max(5, 'El nombre de sección no puede exceder 5 caracteres')
    .regex(/^[A-Za-z0-9]+$/, 'Solo se permiten letras y números'),
  numEstudiantes: z.coerce
    .number()
    .int('El número de estudiantes debe ser entero')
    .min(1, 'Debe haber al menos 1 estudiante')
    .max(100, 'El número máximo de estudiantes es 100'),
});

export type CreateGrupoDTO = z.infer<typeof createGrupoSchema>;

export class ManageGruposUseCase {
  constructor(private readonly cursoRepository: ICursoRepository) {}

  async getGruposForCursoAndPeriodo(cursoId: string, periodoId: string): Promise<Grupo[]> {
    return this.cursoRepository.findGruposByCursoAndPeriodo(cursoId, periodoId);
  }

  async getGruposForPeriodo(periodoId: string): Promise<Grupo[]> {
    return this.cursoRepository.findGruposByPeriodo(periodoId);
  }

  async addGrupo(dto: CreateGrupoDTO): Promise<Grupo> {
    const validated = createGrupoSchema.parse(dto);

    // Verificar si ya existe esa sección para el curso en ese periodo
    const existing = await this.cursoRepository.findGruposByCursoAndPeriodo(validated.cursoId, validated.periodoId);
    const duplicated = existing.find(g => g.nombre.toLowerCase() === validated.nombre.toLowerCase());
    
    if (duplicated) {
      throw new Error(`La sección '${validated.nombre}' ya está registrada para este curso en el período actual.`);
    }

    return this.cursoRepository.saveGrupo({
      cursoId: validated.cursoId,
      periodoId: validated.periodoId,
      nombre: validated.nombre,
      numEstudiantes: validated.numEstudiantes,
    });
  }

  async removeGrupo(id: string): Promise<void> {
    return this.cursoRepository.deleteGrupo(id);
  }
}
