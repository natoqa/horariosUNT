import { ICargaNoLectivaRepository } from '../../domain/repositories/carga-no-lectiva.repository';
import { saveLectivaDeclaracionSchema } from '../dtos/save-lectiva-declaracion.dto';

export class SaveLectivaDeclaracionUseCase {
  constructor(private readonly repository: ICargaNoLectivaRepository) {}

  async execute(docenteId: string, periodoId: string, horasLectivasNoAsignadas: number, lectivaDeclarada: boolean, declaracionLectiva: string) {
    const validated = saveLectivaDeclaracionSchema.parse({
      periodoId,
      horasLectivasNoAsignadas,
      lectivaDeclarada,
      declaracionLectiva,
    });

    return this.repository.saveCargaMeta(docenteId, periodoId, {
      horasLectivasNoAsignadas: validated.horasLectivasNoAsignadas,
      lectivaDeclarada: validated.lectivaDeclarada,
      declaracionLectiva: validated.declaracionLectiva,
    });
  }
}
