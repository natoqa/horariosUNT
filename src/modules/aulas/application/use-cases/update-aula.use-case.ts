import { IAulaRepository } from '../../domain/repositories/aula.repository';
import { UpdateAulaDTO, updateAulaSchema } from '../dtos/update-aula.dto';
import { Aula } from '../../domain/entities/aula.entity';

export class UpdateAulaUseCase {
  constructor(private readonly aulaRepository: IAulaRepository) {}

  async execute(id: string, dto: UpdateAulaDTO): Promise<Aula> {
    const validated = updateAulaSchema.parse(dto);

    const existing = await this.aulaRepository.findById(id);
    if (!existing) {
      throw new Error('El aula a actualizar no existe.');
    }

    return this.aulaRepository.update(id, {
      nombre: validated.nombre,
      pabellon: validated.pabellon || null,
      piso: validated.piso || null,
      capacidad: validated.capacidad,
      tipo: validated.tipo,
      equipamiento: validated.equipamiento || [],
      estado: validated.estado,
    });
  }
}
