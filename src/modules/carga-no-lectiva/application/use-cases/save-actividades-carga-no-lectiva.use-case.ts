import { ICargaNoLectivaRepository, ActividadNoLectivaInput } from '../../domain/repositories/carga-no-lectiva.repository';
import { ACTIVIDADES_NO_LECTIVAS } from '../../domain/entities/carga-no-lectiva.entity';
import { saveActividadesCargaNoLectivaSchema } from '../dtos/save-actividades-carga-no-lectiva.dto';

export class SaveActividadesCargaNoLectivaUseCase {
  constructor(private readonly repository: ICargaNoLectivaRepository) {}

  async execute(
    docenteId: string,
    periodoId: string,
    actividades: ActividadNoLectivaInput[],
  ) {
    const validated = saveActividadesCargaNoLectivaSchema.parse({ periodoId, actividades });

    const tipos = validated.actividades.map((actividad) => actividad.tipo);
    const missing = ACTIVIDADES_NO_LECTIVAS.filter((tipo) => !tipos.includes(tipo));

    if (missing.length > 0) {
      throw new Error('Debe completar todas las actividades no lectivas antes de registrar la carga total. Faltan: ' + missing.join(', '));
    }

    return this.repository.saveActividades(docenteId, periodoId, validated.actividades);
  }
}
