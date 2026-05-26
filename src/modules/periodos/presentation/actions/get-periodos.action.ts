'use server';

import { SupabasePeriodoRepository } from '../../infrastructure/supabase-periodo.repository';
import { GetPeriodosUseCase } from '../../application/use-cases/get-periodos.use-case';
import { createClient } from '@/shared/lib/supabase/server';
import { Periodo } from '../../domain/entities/periodo.entity';

interface GetPeriodosResult {
  data?: Periodo[];
  message?: string;
}

export async function getPeriodosAction(): Promise<GetPeriodosResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para ver períodos.' };
  }

  const repo = new SupabasePeriodoRepository();
  const useCase = new GetPeriodosUseCase(repo);

  try {
    const periodos = await useCase.execute();
    return { data: periodos };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener períodos.';
    return { message };
  }
}
