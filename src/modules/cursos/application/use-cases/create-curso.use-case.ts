import { ICursoRepository } from '../../domain/repositories/curso.repository';
import { CreateCursoDTO, createCursoSchema } from '../dtos/create-curso.dto';
import { Curso } from '../../domain/entities/curso.entity';

export class CreateCursoUseCase {
  constructor(private readonly cursoRepository: ICursoRepository) {}

  async execute(dto: CreateCursoDTO): Promise<Curso> {
    const validated = createCursoSchema.parse(dto);

    const existingCurso = await this.cursoRepository.findByCodigo(validated.codigo);
    if (existingCurso) {
      throw new Error('Ya existe un curso registrado con este código.');
    }

    return this.cursoRepository.save({
      codigo: validated.codigo,
      nombre: validated.nombre,
      ciclo: validated.ciclo,
      tipo: validated.tipo,
      horasTeoricas: validated.horasTeoricas,
      horasPracticas: validated.horasPracticas,
      creditos: validated.creditos,
      requiereLaboratorio: validated.requiereLaboratorio,
      tipoLaboratorio: validated.requiereLaboratorio ? validated.tipoLaboratorio || null : null,
      estado: 'Activo',
    });
  }
}
