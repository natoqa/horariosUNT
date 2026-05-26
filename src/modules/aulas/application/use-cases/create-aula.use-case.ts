import { IAulaRepository } from '../../domain/repositories/aula.repository';
import { CreateAulaDTO, createAulaSchema } from '../dtos/create-aula.dto';
import { Aula } from '../../domain/entities/aula.entity';

export class CreateAulaUseCase {
  constructor(private readonly aulaRepository: IAulaRepository) {}

  async execute(dto: CreateAulaDTO): Promise<Aula> {
    const validated = createAulaSchema.parse(dto);

    const existing = await this.aulaRepository.findByCodigo(validated.codigo);
    if (existing) {
      throw new Error('Ya existe un aula registrada con este código.');
    }

    return this.aulaRepository.save({
      codigo: validated.codigo,
      nombre: validated.nombre,
      pabellon: validated.pabellon || null,
      piso: validated.piso || null,
      capacidad: validated.capacidad,
      tipo: validated.tipo,
      equipamiento: validated.equipamiento || [],
      estado: 'Activa',
    });
  }
}
