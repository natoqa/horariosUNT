'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseNotificacionRepository } from '../../infrastructure/supabase-notificacion.repository';
import { MarcarLeidaUseCase } from '../../application/use-cases/marcar-leida.use-case';

interface MarcarLeidaResult {
  success?: boolean;
  message?: string;
}

export async function marcarLeidaAction(id?: string): Promise<MarcarLeidaResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const repo = new SupabaseNotificacionRepository();
  const useCase = new MarcarLeidaUseCase(repo);

  try {
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al marcar notificación como leída.';
    return { message };
  }
}
