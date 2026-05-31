'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { getActivePeriodoAction } from '@/modules/disponibilidad/presentation/actions/get-periodo-estado.action';

export async function getCargasNoLectivaAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo director o secretaria pueden ver este módulo.' };
  }

  const periodoResult = await getActivePeriodoAction();
  if (periodoResult.message || !periodoResult.data) {
    return { message: periodoResult.message || 'No hay un período activo.' };
  }

  const repo = new SupabaseCargaNoLectivaRepository();
  const cargas = await repo.listCargasByPeriodo(periodoResult.data.id);

  const response: {
    periodoId: string;
    periodoName: string;
    cargas: any;
    docentes?: Array<{ id: string; nombres: string; apellidos: string; correo: string }>;
  } = {
    periodoId: periodoResult.data.id,
    periodoName: periodoResult.data.name,
    cargas,
  };

  if (role === 'secretaria') {
    const { data: docentesData, error: docentesError } = await supabase
      .from('docentes')
      .select('id, nombres, apellidos, correo');

    if (!docentesError && docentesData) {
      response.docentes = docentesData as Array<{ id: string; nombres: string; apellidos: string; correo: string }>;
    }
  }

  return { data: response };
}
