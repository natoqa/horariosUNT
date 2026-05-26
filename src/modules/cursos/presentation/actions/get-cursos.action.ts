'use server';

import { SupabaseCursoRepository } from '../../infrastructure/supabase-curso.repository';
import { GetCursosUseCase } from '../../application/use-cases/get-cursos.use-case';
import { CursoFilters } from '../../domain/repositories/curso.repository';
import { Curso } from '../../domain/entities/curso.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface GetCursosResult {
  data?: Curso[];
  message?: string;
}

export async function getCursosAction(
  filters?: CursoFilters,
): Promise<GetCursosResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para ver cursos.' };
  }

  const repo = new SupabaseCursoRepository();
  const useCase = new GetCursosUseCase(repo);

  try {
    const cursos = await useCase.execute(filters);
    return { data: cursos };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cargar cursos.';
    return { message };
  }
}
