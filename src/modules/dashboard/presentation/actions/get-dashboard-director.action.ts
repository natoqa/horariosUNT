'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseDashboardRepository } from '../../infrastructure/supabase-dashboard.repository';
import { GetDashboardDirectorUseCase } from '../../application/use-cases/get-dashboard-director.use-case';
import { DashboardDirectorDTO } from '../../application/dtos/dashboard.dto';

interface GetDashboardDirectorResult {
  data?: DashboardDirectorDTO;
  message?: string;
}

export async function getDashboardDirectorAction(): Promise<GetDashboardDirectorResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director') {
    return { message: 'No tiene permisos para ver este dashboard.' };
  }

  const repo = new SupabaseDashboardRepository();
  const useCase = new GetDashboardDirectorUseCase(repo);

  try {
    const dashboard = await useCase.execute();
    return { data: dashboard };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener dashboard del director.';
    return { message };
  }
}
