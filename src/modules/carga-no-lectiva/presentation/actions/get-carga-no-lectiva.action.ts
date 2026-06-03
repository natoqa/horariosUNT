'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { getActivePeriodoAction } from '@/modules/disponibilidad/presentation/actions/get-periodo-estado.action';

export async function getCargaNoLectivaAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const periodoResult = await getActivePeriodoAction();
  if (periodoResult.message || !periodoResult.data) {
    return { message: periodoResult.message || 'No hay un período activo.' };
  }

  const { data: docenteData, error: docenteError } = await supabase
    .from('docentes')
    .select('id')
    .eq('correo', user.email)
    .single();

  if (docenteError || !docenteData) {
    return { message: 'No se encontró un docente asociado a este usuario.' };
  }

  const repo = new SupabaseCargaNoLectivaRepository();
  const actividades = await repo.findActividadesByDocentePeriodo(docenteData.id, periodoResult.data.id);
  const carga = await repo.findCargaTotalByDocentePeriodo(docenteData.id, periodoResult.data.id);

  return {
    data: {
      periodoId: periodoResult.data.id,
      periodoName: periodoResult.data.name,
      actividades,
      carga,
    },
  };
}
