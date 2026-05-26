import { IDocenteRepository } from '../../domain/repositories/docente.repository';
import { CreateDocenteDTO, createDocenteSchema } from '../dtos/create-docente.dto';
import { Docente } from '../../domain/entities/docente.entity';

export class CreateDocenteUseCase {
  constructor(private readonly docenteRepository: IDocenteRepository) {}

  async execute(dto: CreateDocenteDTO): Promise<Docente> {
    const validated = createDocenteSchema.parse(dto);

    const existingDni = await this.docenteRepository.findByDni(validated.dni);
    if (existingDni) {
      throw new Error('Ya existe un docente con este DNI.');
    }

    const existingCorreo = await this.docenteRepository.findByCorreo(validated.correo);
    if (existingCorreo) {
      throw new Error('Ya existe un docente con este correo electrónico.');
    }

    return this.docenteRepository.save({
      nombres: validated.nombres,
      apellidos: validated.apellidos,
      dni: validated.dni,
      correo: validated.correo,
      telefono: validated.telefono || null,
      categoria: validated.categoria,
      regimen: validated.regimen,
      condicion: validated.condicion,
      fechaIngreso: validated.fechaIngreso,
      cargaMaxima: validated.cargaMaxima,
      estado: 'Activo',
    });
  }
}
