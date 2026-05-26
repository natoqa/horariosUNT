'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { Periodo } from '@/modules/periodos';

export async function getActivePeriodoAction(): Promise<{ data?: Periodo; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .neq('state', 'Cerrado')
    .limit(1)
    .single();

  if (error || !data) {
    return { message: 'No hay un período académico activo.' };
  }

  return {
    data: {
      id: data.id,
      name: data.name,
      tipoCiclo: data.tipo_ciclo,
      startDate: data.start_date,
      endDate: data.end_date,
      availabilityDeadline: data.availability_deadline,
      state: data.state,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}
