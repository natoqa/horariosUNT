'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseDashboardRepository } from '../../infrastructure/supabase-dashboard.repository';
import { GetDashboardDocenteUseCase } from '../../application/use-cases/get-dashboard-docente.use-case';
import { DashboardDocenteDTO } from '../../application/dtos/dashboard.dto';

interface GetDashboardDocenteResult {
  data?: DashboardDocenteDTO;
  message?: string;
}

export async function getDashboardDocenteAction(): Promise<GetDashboardDocenteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'docente') {
    return { message: 'No tiene permisos para ver este dashboard.' };
  }

  // Obtener ID del docente desde user_metadata
  const docenteId = user.user_metadata?.docente_id;
  if (!docenteId) {
    return { message: 'No se encontró ID de docente.' };
  }

  const repo = new SupabaseDashboardRepository();
  const useCase = new GetDashboardDocenteUseCase(repo);

  try {
    const dashboard = await useCase.execute(docenteId);
    return { data: dashboard };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener dashboard de docente.';
    return { message };
  }
}
