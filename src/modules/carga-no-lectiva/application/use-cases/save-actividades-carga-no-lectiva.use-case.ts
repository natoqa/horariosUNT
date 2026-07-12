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

    // 1. Guardar las actividades
    await this.repository.saveActividades(docenteId, periodoId, validated.actividades);

    // 2. Calcular el total de horas
    const totalHoras = validated.actividades.reduce((sum, a) => sum + a.horas, 0);

    // 3. Obtener la carga actual (si existe)
    const currentCarga = await this.repository.findCargaTotalByDocentePeriodo(docenteId, periodoId);

    if (currentCarga) {
      // Si existe: Actualizar el total y marcar como borrador (si no estaba aprobado)
      const sameTotal = totalHoras === currentCarga.totalHoras;
      const updatedEstado = currentCarga.directorAprobado && currentCarga.secretariaAprobado && sameTotal 
        ? 'Aprobado' 
        : 'En revisión';

      await this.repository.saveCargaMeta(docenteId, periodoId, {
        // Solo actualizamos el total si la carga no está aprobada o si el total cambió
        ...(!(currentCarga.directorAprobado && currentCarga.secretariaAprobado && sameTotal) ? {
          horasLectivasAsignadas: currentCarga.horasLectivasAsignadas,
          horasLectivasNoAsignadas: currentCarga.horasLectivasNoAsignadas,
          lectivaDeclarada: currentCarga.lectivaDeclarada,
          declaracionLectiva: currentCarga.declaracionLectiva,
        } : {}),
      });

      // Necesitamos actualizar el totalHoras específicamente (saveCargaMeta no lo hace)
      await this.repository.saveCargaTotal(docenteId, periodoId, totalHoras);
    } else {
      // Si no existe: Crear una nueva en estado borrador
      await this.repository.saveCargaTotal(docenteId, periodoId, totalHoras);
    }

    return;
  }
}
