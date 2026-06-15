'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseDashboardRepository } from '../../infrastructure/supabase-dashboard.repository';
import { GetDashboardSecretariaUseCase } from '../../application/use-cases/get-dashboard-secretaria.use-case';
import { DashboardSecretariaDTO } from '../../application/dtos/dashboard.dto';

interface GetDashboardSecretariaResult {
  data?: DashboardSecretariaDTO;
  message?: string;
}

export async function getDashboardSecretariaAction(): Promise<GetDashboardSecretariaResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'secretaria') {
    return { message: 'No tiene permisos para ver este dashboard.' };
  }

  const repo = new SupabaseDashboardRepository();
  const useCase = new GetDashboardSecretariaUseCase(repo);

  try {
    const dashboard = await useCase.execute();
    return { data: dashboard };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener dashboard de secretaria.';
    return { message };
  }
}
