'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { Disponibilidad } from '../../domain/entities/disponibilidad.entity';

const DB_TO_ESTADO: Record<string, string> = {
  'Disponible': 'disponible',
  'No disponible': 'no_disponible',
  'Preferido': 'preferido',
};

export async function getDocenteDisponibilidadAction(
  docenteId: string,
  periodoId: string,
): Promise<{ data?: Disponibilidad[]; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role || 'docente';
  if (role !== 'director') {
    return { message: 'Solo el Director puede consultar la disponibilidad de otros docentes.' };
  }

  const { data, error } = await supabase
    .from('disponibilidad')
    .select('*')
    .eq('docente_id', docenteId)
    .eq('periodo_id', periodoId);

  if (error) {
    return { message: 'Error al cargar la disponibilidad del docente.' };
  }

  if (!data || data.length === 0) {
    return { data: [] };
  }

  const mapped: Disponibilidad[] = data.map((row) => ({
    id: row.id,
    docenteId: row.docente_id,
    periodoId: row.periodo_id,
    dia: row.dia as Disponibilidad['dia'],
    bloque: row.bloque as Disponibilidad['bloque'],
    estado: (DB_TO_ESTADO[row.estado] || row.estado) as Disponibilidad['estado'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { data: mapped };
}
