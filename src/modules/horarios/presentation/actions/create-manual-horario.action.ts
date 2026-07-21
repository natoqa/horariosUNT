'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { Horario } from '../../domain/entities/horario.entity';

export interface CreateManualHorarioResult {
  horario?: Horario;
  message?: string;
}

export async function createManualHorarioAction(
  periodoId: string,
): Promise<CreateManualHorarioResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el Director o la Secretaria pueden crear horarios manuales.' };
  }

  try {
    // Validate period state
    const { data: periodo, error: periodoError } = await supabase
      .from('periodos')
      .select('state')
      .eq('id', periodoId)
      .single();

    if (periodoError || !periodo) {
      return { message: 'No se encontró el período indicado.' };
    }

    if (periodo.state !== 'Generación') {
      return { message: `El período debe estar en estado "Generación". Estado actual: "${periodo.state}".` };
    }

    const repo = new SupabaseHorarioRepository();

    // Delete existing horario for this period (if any)
    const existing = await repo.findByPeriodo(periodoId);
    if (existing) {
      await repo.deleteAsignacionesByHorario(existing.id);
    }

    // Create empty horario in Borrador without summary (indicates manual mode)
    const horario = await repo.save(periodoId);

    revalidatePath('/director/horarios');
    revalidatePath('/secretaria/horarios');
    return { horario };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al crear horario manual.' };
  }
}
