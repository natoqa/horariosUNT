'use server';

import { SupabaseDocenteRepository } from '@/modules/docentes/infrastructure/supabase-docente.repository';
import { SupabaseCursoRepository } from '@/modules/cursos/infrastructure/supabase-curso.repository';
import { SupabaseAulaRepository } from '@/modules/aulas/infrastructure/supabase-aula.repository';

export interface SecretariaDashboardStats {
  docentesActivos: number;
  cursosRegistrados: number;
  aulasDisponibles: number;
}

export async function getSecretariaDashboardStatsAction(): Promise<SecretariaDashboardStats> {
  try {
    const docenteRepo = new SupabaseDocenteRepository();
    const cursoRepo = new SupabaseCursoRepository();
    const aulaRepo = new SupabaseAulaRepository();

    const [docentes, cursos, aulas] = await Promise.all([
      docenteRepo.findAll(),
      cursoRepo.findAll(),
      aulaRepo.findAll(),
    ]);

    return {
      docentesActivos: docentes.length,
      cursosRegistrados: cursos.length,
      aulasDisponibles: aulas.length,
    };
  } catch (error) {
    console.error('Error fetching secretaria dashboard stats:', error);
    return {
      docentesActivos: 0,
      cursosRegistrados: 0,
      aulasDisponibles: 0,
    };
  }
}
