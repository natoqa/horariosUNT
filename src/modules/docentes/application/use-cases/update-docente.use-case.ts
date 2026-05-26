import { IDocenteRepository } from '../../domain/repositories/docente.repository';
import { UpdateDocenteDTO, updateDocenteSchema } from '../dtos/update-docente.dto';
import { Docente } from '../../domain/entities/docente.entity';

export class UpdateDocenteUseCase {
  constructor(private readonly docenteRepository: IDocenteRepository) {}

  async execute(dto: UpdateDocenteDTO): Promise<Docente> {
    const validated = updateDocenteSchema.parse(dto);

    const existing = await this.docenteRepository.findById(validated.id);
    if (!existing) {
      throw new Error('Docente no encontrado.');
    }

    if (validated.correo && validated.correo !== existing.correo) {
      const existingCorreo = await this.docenteRepository.findByCorreo(validated.correo);
      if (existingCorreo) {
        throw new Error('Ya existe un docente con este correo electrónico.');
      }
    }

    const { id, ...updateData } = validated;
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined),
    ) as Partial<Omit<Docente, 'id' | 'dni' | 'createdAt' | 'updatedAt'>>;

    return this.docenteRepository.update(id, cleanData);
  }
}
