'use server';

import { revalidatePath } from 'next/cache';
import { SupabasePeriodoRepository } from '../../infrastructure/supabase-periodo.repository';
import { ChangePeriodoStateUseCase } from '../../application/use-cases/change-periodo-state.use-case';
import { changeStateSchema } from '../../application/dtos/change-state.dto';
import { createClient } from '@/shared/lib/supabase/server';
import { EstadoPeriodo } from '@/shared/constants/period-states';

interface ChangeStateResult {
  success?: boolean;
  message?: string;
}

export async function changeStateAction(
  periodoId: string,
  newState: EstadoPeriodo,
): Promise<ChangeStateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'No tiene permisos para cambiar el estado del período.' };
  }

  const validated = changeStateSchema.safeParse({ periodoId, newState });
  if (!validated.success) {
    return { message: 'Datos inválidos.' };
  }

  const repo = new SupabasePeriodoRepository();
  const useCase = new ChangePeriodoStateUseCase(repo);

  try {
    await useCase.execute(validated.data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al cambiar estado.';
    return { message };
  }

  revalidatePath('/director/periodos');
  return { success: true, message: 'Estado actualizado exitosamente.' };
}
