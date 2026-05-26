import { IAulaRepository } from '../../domain/repositories/aula.repository';
import { UpdateAulaDTO } from '../dtos/update-aula.dto';
import { Aula } from '../../domain/entities/aula.entity';

export class UpdateAulaUseCase {
  constructor(private readonly aulaRepository: IAulaRepository) {}

  async execute(id: string, dto: UpdateAulaDTO): Promise<Aula> {
    const existing = await this.aulaRepository.findById(id);
    if (!existing) {
      throw new Error('El aula a actualizar no existe.');
    }

    return this.aulaRepository.update(id, {
      nombre: dto.nombre,
      pabellon: dto.pabellon || null,
      piso: dto.piso || null,
      capacidad: dto.capacidad,
      tipo: dto.tipo,
      equipamiento: dto.equipamiento || [],
      estado: dto.estado,
    });
  }
}
