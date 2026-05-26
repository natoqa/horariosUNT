'use server';

import { SupabaseDocenteRepository } from '../../infrastructure/supabase-docente.repository';
import { GetDocentesUseCase } from '../../application/use-cases/get-docentes.use-case';
import { DocenteFilters } from '../../domain/repositories/docente.repository';
import { Docente } from '../../domain/entities/docente.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface GetDocentesResult {
  data?: Docente[];
  message?: string;
}

export async function getDocentesAction(
  filters?: DocenteFilters,
): Promise<GetDocentesResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para ver docentes.' };
  }

  const repo = new SupabaseDocenteRepository();
  const useCase = new GetDocentesUseCase(repo);

  try {
    const docentes = await useCase.execute(filters);
    return { data: docentes };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cargar docentes.';
    return { message };
  }
}
