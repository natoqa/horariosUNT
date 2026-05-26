import { IDocenteRepository } from '../../domain/repositories/docente.repository';
import { Docente } from '../../domain/entities/docente.entity';

export class ToggleDocenteStatusUseCase {
  constructor(private readonly docenteRepository: IDocenteRepository) {}

  async execute(docenteId: string): Promise<Docente> {
    if (!docenteId) {
      throw new Error('El ID del docente es requerido.');
    }

    const docente = await this.docenteRepository.findById(docenteId);
    if (!docente) {
      throw new Error('Docente no encontrado.');
    }

    const newState = docente.estado === 'Activo' ? 'Inactivo' : 'Activo';
    return this.docenteRepository.update(docenteId, { estado: newState });
  }
}
