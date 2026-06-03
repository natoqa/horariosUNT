import { ICargaNoLectivaRepository } from '../../domain/repositories/carga-no-lectiva.repository';
import { saveLectivaAsignacionSchema } from '../dtos/save-lectiva-asignacion.dto';

export class SaveLectivaAsignacionUseCase {
  constructor(private readonly repository: ICargaNoLectivaRepository) {}

  async execute(docenteId: string, periodoId: string, horasLectivasAsignadas: number) {
    const validated = saveLectivaAsignacionSchema.parse({
      periodoId,
      docenteId,
      horasLectivasAsignadas,
    });

    return this.repository.saveCargaMeta(docenteId, periodoId, {
      horasLectivasAsignadas: validated.horasLectivasAsignadas,
    });
  }
}
