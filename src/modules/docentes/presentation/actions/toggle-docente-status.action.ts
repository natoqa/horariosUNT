'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseDocenteRepository } from '../../infrastructure/supabase-docente.repository';
import { ToggleDocenteStatusUseCase } from '../../application/use-cases/toggle-docente-status.use-case';
import { createClient } from '@/shared/lib/supabase/server';

interface ToggleResult {
  success?: boolean;
  message?: string;
}

export async function toggleDocenteStatusAction(docenteId: string): Promise<ToggleResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'Solo el director puede activar/desactivar docentes.' };
  }

  const repo = new SupabaseDocenteRepository();
  const useCase = new ToggleDocenteStatusUseCase(repo);

  try {
    const docente = await useCase.execute(docenteId);
    const action = docente.estado === 'Activo' ? 'activado' : 'desactivado';
    revalidatePath('/director/docentes');
    revalidatePath('/secretaria/docentes');
    return { success: true, message: `Docente ${action} exitosamente.` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cambiar estado del docente.';
    return { message };
  }
}
