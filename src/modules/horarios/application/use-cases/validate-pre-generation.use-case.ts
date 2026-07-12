import { Periodo } from '@/modules/periodos';
import { Docente } from '@/modules/docentes';
import { Curso, Grupo } from '@/modules/cursos';
import { Aula } from '@/modules/aulas';
import { Disponibilidad } from '@/modules/disponibilidad';

export interface PreValidationError {
  category: 'periodo' | 'docentes' | 'cursos' | 'aulas';
  message: string;
}

export interface PreValidationResult {
  valid: boolean;
  errors: PreValidationError[];
  stats: {
    totalDocentes: number;
    docentesConDisponibilidad: number;
    totalCursos: number;
    totalGrupos: number;
    totalAulas: number;
  };
}

export class ValidatePreGenerationUseCase {
  execute(
    periodo: Periodo,
    docentes: Docente[],
    cursos: Curso[],
    grupos: Grupo[],
    aulas: Aula[],
    disponibilidades: Disponibilidad[],
    forceWithoutFullAvailability: boolean,
  ): PreValidationResult {
    const errors: PreValidationError[] = [];

    // Validate periodo state
    if (periodo.state !== 'Generación') {
      errors.push({
        category: 'periodo',
        message: `El período debe estar en estado "Generación". Estado actual: "${periodo.state}".`,
      });
    }

    // Get docentes with grupos assigned
    const docentesAsignadosIds = new Set(
      grupos
        .filter((g) => g.docenteId)
        .map((g) => g.docenteId)
    );
    const activeDocentesAsignados = docentes.filter(
      (d) => d.estado === 'Activo' && docentesAsignadosIds.has(d.id),
    );
    const activeDocentes = docentes.filter((d) => d.estado === 'Activo');
    
    if (activeDocentesAsignados.length === 0) {
      errors.push({
        category: 'docentes',
        message: 'No hay docentes activos con grupos asignados.',
      });
    }

    // Check availability only for docentes with grupos assigned
    const docenteIdsWithAvailability = new Set(
      disponibilidades.map((d) => d.docenteId),
    );
    const docentesSinDisponibilidad = activeDocentesAsignados.filter(
      (d) => !docenteIdsWithAvailability.has(d.id),
    );

    if (docentesSinDisponibilidad.length > 0 && !forceWithoutFullAvailability) {
      errors.push({
        category: 'docentes',
        message: `${docentesSinDisponibilidad.length} docente(s) sin disponibilidad registrada.`,
      });
    }

    // Active cursos
    const activeCursos = cursos.filter((c) => c.estado === 'Activo');
    if (activeCursos.length === 0) {
      errors.push({
        category: 'cursos',
        message: 'No hay cursos activos registrados.',
      });
    }

    // Check grupos exist
    if (grupos.length === 0) {
      errors.push({
        category: 'cursos',
        message: 'No hay grupos configurados para los cursos.',
      });
    }

    // Active aulas
    const activeAulas = aulas.filter((a) => a.estado === 'Activa');
    if (activeAulas.length === 0) {
      errors.push({
        category: 'aulas',
        message: 'No hay aulas activas disponibles.',
      });
    }

    // Calculate stats for docentes with grupos assigned
    const docentesAsignadosConDisponibilidad = activeDocentesAsignados.filter(
      (d) => docenteIdsWithAvailability.has(d.id),
    );

    return {
      valid: errors.length === 0,
      errors,
      stats: {
        totalDocentes: activeDocentesAsignados.length,
        docentesConDisponibilidad: docentesAsignadosConDisponibilidad.length,
        totalCursos: activeCursos.length,
        totalGrupos: grupos.length,
        totalAulas: activeAulas.length,
      },
    };
  }
}
