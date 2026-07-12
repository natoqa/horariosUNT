'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { ResetAllCargasNoLectivasUseCase } from '../../application/use-cases/reset-all-cargas-no-lectivas.use-case';

interface ResetAllCargasResult {
  success?: boolean;
  message?: string;
}

export async function resetAllCargasNoLectivasAction(): Promise<ResetAllCargasResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para resetear las cargas no lectivas.' };
  }

  // Obtener período activo
  const { data: periodoData, error: periodoError } = await supabase
    .from('periodos')
    .select('id')
    .neq('state', 'Cerrado')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (periodoError || !periodoData) {
    return { message: 'No hay un período académico activo.' };
  }

  const useCase = new ResetAllCargasNoLectivasUseCase();

  try {
    await useCase.execute(periodoData.id);
    revalidatePath('/director/carga-no-lectiva');
    revalidatePath('/secretaria/carga-no-lectiva');
    return { success: true, message: 'Todas las cargas no lectivas han sido reseteadas exitosamente.' };
  } catch (error) {
    return { message: (error as Error).message || 'Error al resetear las cargas no lectivas.' };
  }
}
