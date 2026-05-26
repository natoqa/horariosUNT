import { IAulaRepository } from '../../domain/repositories/aula.repository';
import { CreateAulaDTO } from '../dtos/create-aula.dto';
import { Aula } from '../../domain/entities/aula.entity';

export class CreateAulaUseCase {
  constructor(private readonly aulaRepository: IAulaRepository) {}

  async execute(dto: CreateAulaDTO): Promise<Aula> {
    const existing = await this.aulaRepository.findByCodigo(dto.codigo);
    if (existing) {
      throw new Error('Ya existe un aula registrada con este código.');
    }

    return this.aulaRepository.save({
      codigo: dto.codigo,
      nombre: dto.nombre,
      pabellon: dto.pabellon || null,
      piso: dto.piso || null,
      capacidad: dto.capacidad,
      tipo: dto.tipo,
      equipamiento: dto.equipamiento || [],
      estado: 'Activa',
    });
  }
}
