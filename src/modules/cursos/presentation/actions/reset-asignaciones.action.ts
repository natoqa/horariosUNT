'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { ResetAsignacionesUseCase } from '../../application/use-cases/reset-asignaciones.use-case';

interface ResetAsignacionesActionResult {
  success?: boolean;
  message?: string;
}

export async function resetAsignacionesAction(): Promise<ResetAsignacionesActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director' && user.user_metadata?.role !== 'secretaria') {
    return { message: 'Solo la secretaria y el director pueden resetear las asignaciones.' };
  }

  // Get active period
  const { data: periodoData, error: periodoError } = await supabase
    .from('periodos')
    .select('*')
    .neq('state', 'Cerrado')
    .limit(1)
    .single();

  if (periodoError || !periodoData) {
    return { message: 'No hay un período académico activo.' };
  }

  const useCase = new ResetAsignacionesUseCase();

  try {
    await useCase.execute(periodoData.id);
    revalidatePath('/director/horarios');
    revalidatePath('/secretaria/horarios');
    return { success: true, message: 'Asignaciones reseteadas exitosamente.' };
  } catch (error) {
    return { message: (error as Error).message || 'Error al resetear las asignaciones.' };
  }
}