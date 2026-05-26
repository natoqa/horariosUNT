import { ICursoRepository } from '../../domain/repositories/curso.repository';
import { UpdateCursoDTO, updateCursoSchema } from '../dtos/update-curso.dto';
import { Curso } from '../../domain/entities/curso.entity';

export class UpdateCursoUseCase {
  constructor(private readonly cursoRepository: ICursoRepository) {}

  async execute(id: string, dto: UpdateCursoDTO): Promise<Curso> {
    const validated = updateCursoSchema.parse(dto);

    const existing = await this.cursoRepository.findById(id);
    if (!existing) {
      throw new Error('El curso a actualizar no existe.');
    }

    return this.cursoRepository.update(id, {
      nombre: validated.nombre,
      ciclo: validated.ciclo,
      tipo: validated.tipo,
      horasTeoricas: validated.horasTeoricas,
      horasPracticas: validated.horasPracticas,
      creditos: validated.creditos,
      requiereLaboratorio: validated.requiereLaboratorio,
      tipoLaboratorio: validated.requiereLaboratorio ? validated.tipoLaboratorio || null : null,
      estado: validated.estado,
    });
  }
}
