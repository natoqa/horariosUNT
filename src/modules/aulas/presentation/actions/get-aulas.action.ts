'use server';

import { SupabaseAulaRepository } from '../../infrastructure/supabase-aula.repository';
import { GetAulasUseCase } from '../../application/use-cases/get-aulas.use-case';
import { AulaFilters } from '../../domain/repositories/aula.repository';
import { Aula } from '../../domain/entities/aula.entity';
import { createClient } from '@/shared/lib/supabase/server';

interface GetAulasResult {
  data?: Aula[];
  message?: string;
}

export async function getAulasAction(
  filters?: AulaFilters,
): Promise<GetAulasResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para ver aulas.' };
  }

  const repo = new SupabaseAulaRepository();
  const useCase = new GetAulasUseCase(repo);

  try {
    const aulas = await useCase.execute(filters);
    return { data: aulas };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cargar aulas.';
    return { message };
  }
}
