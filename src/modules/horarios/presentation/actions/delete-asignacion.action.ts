'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';

export interface DeleteAsignacionResult {
  success?: boolean;
  message?: string;
}

export async function deleteAsignacionAction(
  asignacionId: string,
): Promise<DeleteAsignacionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el Director o la Secretaria pueden eliminar asignaciones.' };
  }

  try {
    const repo = new SupabaseHorarioRepository();

    // Verify asignacion exists
    const asignacion = await repo.findAsignacionById(asignacionId);
    if (!asignacion) {
      return { message: 'Asignación no encontrada.' };
    }

    // Verify horario is in Borrador
    const horario = await repo.findById(asignacion.horarioId);
    if (!horario) {
      return { message: 'Horario no encontrado.' };
    }
    if (horario.estado !== 'Borrador') {
      return { message: `Solo se pueden eliminar asignaciones de horarios en estado "Borrador". Estado actual: "${horario.estado}".` };
    }

    await repo.deleteAsignacion(asignacionId);

    revalidatePath('/director/horarios');
    revalidatePath('/secretaria/horarios');
    return { success: true };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al eliminar asignación.' };
  }
}
