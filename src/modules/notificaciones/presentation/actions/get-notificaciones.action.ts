'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseNotificacionRepository } from '../../infrastructure/supabase-notificacion.repository';
import { GetNotificacionesUseCase } from '../../application/use-cases/get-notificaciones.use-case';
import { Notificacion } from '../../domain/entities/notificacion.entity';

interface GetNotificacionesResult {
  data?: Notificacion[];
  message?: string;
}

export async function getNotificacionesAction(): Promise<GetNotificacionesResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const repo = new SupabaseNotificacionRepository();
  const useCase = new GetNotificacionesUseCase(repo);

  try {
    const notificaciones = await useCase.execute();
    return { data: notificaciones };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener notificaciones.';
    return { message };
  }
}
