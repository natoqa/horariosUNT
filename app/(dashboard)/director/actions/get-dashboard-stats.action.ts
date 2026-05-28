'use server'

import { SupabaseDocenteRepository } from '@/modules/docentes/infrastructure/supabase-docente.repository';
import { GetDocentesUseCase } from '@/modules/docentes/application/use-cases/get-docentes.use-case';
import { SupabasePeriodoRepository } from '@/modules/periodos/infrastructure/supabase-periodo.repository';
import { GetPeriodosUseCase } from '@/modules/periodos/application/use-cases/get-periodos.use-case';
import { GetActivePeriodoUseCase } from '@/modules/periodos/application/use-cases/get-active-periodo.use-case';
import { SupabaseCursoRepository } from '@/modules/cursos/infrastructure/supabase-curso.repository';
import { GetCursosUseCase } from '@/modules/cursos/application/use-cases/get-cursos.use-case';

export interface DashboardStats {
  docentesActivos: number;
  cursosRegistrados: number;
  periodoActivo: string | null;
  periodoNombre: string | null;
}

export async function getDashboardStatsAction(): Promise<DashboardStats> {
  const docenteRepo = new SupabaseDocenteRepository();
  const periodoRepo = new SupabasePeriodoRepository();
  const cursoRepo = new SupabaseCursoRepository();

  const docentesUseCase = new GetDocentesUseCase(docenteRepo);
  const periodosUseCase = new GetPeriodosUseCase(periodoRepo);
  const activePeriodoUseCase = new GetActivePeriodoUseCase(periodoRepo);
  const cursosUseCase = new GetCursosUseCase(cursoRepo);

  const [docentes, periodos, activePeriodo, cursos] = await Promise.all([
    docentesUseCase.execute(),
    periodosUseCase.execute(),
    activePeriodoUseCase.execute(),
    cursosUseCase.execute(),
  ]);

  const docentesActivos = docentes.filter(d => d.estado === 'Activo').length;
  const cursosRegistrados = cursos.filter(c => c.estado === 'Activo').length;
  const periodoActivo = activePeriodo?.id || null;
  const periodoNombre = activePeriodo?.name || null;

  return {
    docentesActivos,
    cursosRegistrados,
    periodoActivo,
    periodoNombre,
  };
}
