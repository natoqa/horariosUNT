'use server';

import { revalidatePath } from 'next/cache';
import { SupabasePeriodoRepository } from '../../infrastructure/supabase-periodo.repository';
import { CreatePeriodoUseCase } from '../../application/use-cases/create-periodo.use-case';
import { createPeriodoSchema } from '../../application/dtos/create-periodo.dto';
import { createClient } from '@/shared/lib/supabase/server';

export interface PeriodoActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export async function createPeriodoAction(
  _prevState: PeriodoActionState | undefined,
  formData: FormData,
): Promise<PeriodoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'No tiene permisos para crear períodos académicos.' };
  }

  const raw = {
    name: formData.get('name') as string,
    tipoCiclo: formData.get('tipoCiclo') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    availabilityDeadline: formData.get('availabilityDeadline') as string,
  };

  const validated = createPeriodoSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabasePeriodoRepository();
  const useCase = new CreatePeriodoUseCase(repo);

  try {
    await useCase.execute(validated.data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al crear el período.';
    return { message };
  }

  revalidatePath('/director/periodos');
  return { success: true, message: 'Período creado exitosamente.' };
}
