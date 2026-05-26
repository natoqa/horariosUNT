import { IDisponibilidadRepository } from '../../domain/repositories/disponibilidad.repository';
import { Disponibilidad } from '../../domain/entities/disponibilidad.entity';

export class GetDisponibilidadUseCase {
  constructor(private readonly disponibilidadRepository: IDisponibilidadRepository) {}

  async execute(docenteId: string, periodoId: string): Promise<Disponibilidad[]> {
    return this.disponibilidadRepository.findByDocenteAndPeriodo(docenteId, periodoId);
  }
}
