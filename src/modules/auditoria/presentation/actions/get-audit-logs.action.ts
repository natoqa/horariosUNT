'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseAuditoriaRepository } from '../../infrastructure/supabase-auditoria.repository';
import { GetAuditLogsUseCase } from '../../application/use-cases/get-audit-logs.use-case';
import { AuditLog } from '../../domain/entities/audit-log.entity';

interface GetAuditLogsResult {
  data?: AuditLog[];
  message?: string;
}

export async function getAuditLogsAction(filters?: {
  userEmail?: string;
  modulo?: string;
  accion?: string;
  startDate?: string;
  endDate?: string;
}): Promise<GetAuditLogsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director') {
    return { message: 'No tiene permisos para ver los logs de auditoría.' };
  }

  const repo = new SupabaseAuditoriaRepository();
  const useCase = new GetAuditLogsUseCase(repo);

  try {
    const logs = await useCase.execute(filters);
    return { data: logs };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener logs de auditoría.';
    return { message };
  }
}
