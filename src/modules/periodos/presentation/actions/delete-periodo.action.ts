'use server';

import { revalidatePath } from 'next/cache';
import { SupabasePeriodoRepository } from '../../infrastructure/supabase-periodo.repository';
import { createClient } from '@/shared/lib/supabase/server';

interface DeleteResult {
  success?: boolean;
  message?: string;
}

export async function deletePeriodoAction(periodoId: string): Promise<DeleteResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'No tiene permisos para eliminar periodos.' };
  }

  const repo = new SupabasePeriodoRepository();

  try {
    const periodo = await repo.findById(periodoId);
    if (!periodo) {
      return { message: 'Periodo no encontrado.' };
    }

    if (periodo.state !== 'Configuración' && periodo.state !== 'Cerrado') {
      return { message: 'Solo se pueden eliminar periodos en estado Configuracion o Cerrado.' };
    }

    await repo.delete(periodoId);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar el periodo.';
    return { message };
  }

  revalidatePath('/director/periodos');
  return { success: true, message: 'Periodo eliminado.' };
}
