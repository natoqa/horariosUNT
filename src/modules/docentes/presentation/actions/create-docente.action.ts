'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseDocenteRepository } from '../../infrastructure/supabase-docente.repository';
import { CreateDocenteUseCase } from '../../application/use-cases/create-docente.use-case';
import { createDocenteSchema } from '../../application/dtos/create-docente.dto';
import { createClient } from '@/shared/lib/supabase/server';

export interface DocenteActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export async function createDocenteAction(
  _prevState: DocenteActionState | undefined,
  formData: FormData,
): Promise<DocenteActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para registrar docentes.' };
  }

  const raw = {
    nombres: formData.get('nombres') as string,
    apellidos: formData.get('apellidos') as string,
    dni: formData.get('dni') as string,
    correo: formData.get('correo') as string,
    telefono: formData.get('telefono') as string,
    categoria: formData.get('categoria') as string,
    regimen: formData.get('regimen') as string,
    condicion: formData.get('condicion') as string,
    fechaIngreso: formData.get('fechaIngreso') as string,
    cargaMaxima: formData.get('cargaMaxima') as string,
  };

  const validated = createDocenteSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseDocenteRepository();
  const useCase = new CreateDocenteUseCase(repo);

  try {
    await useCase.execute(validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar el docente.';
    return { message };
  }

  revalidatePath('/director/docentes');
  revalidatePath('/secretaria/docentes');
  return { success: true, message: 'Docente registrado exitosamente.' };
}
