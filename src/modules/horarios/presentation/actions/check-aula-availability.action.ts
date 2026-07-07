'use server';

import { createClient } from '@/shared/lib/supabase/server';

interface CheckAulaAvailabilityResult {
  available: boolean;
  message?: string;
}

export async function checkAulaAvailabilityAction(
  aulaId: string,
  dia: string,
  bloque: string,
  excludeAsignacionId?: string,
): Promise<CheckAulaAvailabilityResult> {
  const supabase = await createClient();

  // Check if there are any existing asignaciones for this aula, dia, and bloque
  let query = supabase
    .from('asignaciones')
    .select('*')
    .eq('aula_id', aulaId)
    .eq('dia', dia)
    .eq('bloque', bloque);

  if (excludeAsignacionId) {
    query = query.neq('id', excludeAsignacionId);
  }

  const { data: existingAsignaciones, error } = await query;

  if (error) {
    return { available: false, message: 'Error al verificar disponibilidad' };
  }

  if (existingAsignaciones && existingAsignaciones.length > 0) {
    return { available: false, message: 'El aula ya está ocupada en este horario' };
  }

  return { available: true };
}
