'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseNotificacionRepository } from '../../infrastructure/supabase-notificacion.repository';
import { CrearNotificacionUseCase } from '../../application/use-cases/crear-notificacion.use-case';
import { Notificacion } from '../../domain/entities/notificacion.entity';

interface CrearNotificacionResult {
  success?: boolean;
  message?: string;
}

export async function crearNotificacionAction(
  notificacion: Omit<Notificacion, 'id' | 'createdAt' | 'leida'>
): Promise<CrearNotificacionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para crear notificaciones.' };
  }

  const repo = new SupabaseNotificacionRepository();
  const useCase = new CrearNotificacionUseCase(repo);

  try {
    await useCase.execute(notificacion);
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al crear notificación.';
    return { message };
  }
}
