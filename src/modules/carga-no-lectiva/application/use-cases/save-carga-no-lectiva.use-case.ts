import { ICargaNoLectivaRepository } from '../../domain/repositories/carga-no-lectiva.repository';
import { ACTIVIDADES_NO_LECTIVAS } from '../../domain/entities/carga-no-lectiva.entity';
import { saveCargaNoLectivaSchema } from '../dtos/save-carga-no-lectiva.dto';

export class SaveCargaNoLectivaUseCase {
  constructor(private readonly repository: ICargaNoLectivaRepository) {}

  async execute(docenteId: string, periodoId: string, totalHoras: number) {
    const validated = saveCargaNoLectivaSchema.parse({ periodoId, totalHoras });

    const carga = await this.repository.findCargaTotalByDocentePeriodo(docenteId, periodoId);
    if (!carga) {
      throw new Error('Debe declarar la carga lectiva antes de registrar la carga total.');
    }
    if (!carga.lectivaDeclarada) {
      throw new Error('Debe declarar la carga lectiva en Dirección de escuela antes de registrar la carga total.');
    }

    const actividades = await this.repository.findActividadesByDocentePeriodo(docenteId, periodoId);
    if (actividades.length !== ACTIVIDADES_NO_LECTIVAS.length) {
      throw new Error('Debe registrar todas las actividades no lectivas antes de registrar la carga total.');
    }

    const sumaActividades = actividades.reduce((sum, actividad) => sum + actividad.horas, 0);
    const expectedTotal = sumaActividades + carga.horasLectivasAsignadas + carga.horasLectivasNoAsignadas;

    if (expectedTotal !== validated.totalHoras) {
      throw new Error('El total de horas debe coincidir con la suma de la carga lectiva y no lectiva registrada.');
    }
    if (validated.totalHoras <= 0) {
      throw new Error('El total de horas declaradas debe ser mayor a 0.');
    }

    return this.repository.saveCargaTotal(docenteId, periodoId, validated.totalHoras);
  }
}
