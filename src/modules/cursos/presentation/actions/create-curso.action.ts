'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseCursoRepository } from '../../infrastructure/supabase-curso.repository';
import { CreateCursoUseCase } from '../../application/use-cases/create-curso.use-case';
import { createCursoSchema } from '../../application/dtos/create-curso.dto';
import { createClient } from '@/shared/lib/supabase/server';

export interface CursoActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export async function createCursoAction(
  _prevState: CursoActionState | undefined,
  formData: FormData,
): Promise<CursoActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para registrar cursos.' };
  }

  const raw = {
    codigo: formData.get('codigo') as string,
    nombre: formData.get('nombre') as string,
    ciclo: formData.get('ciclo') as string,
    tipo: formData.get('tipo') as string,
    horasTeoricas: formData.get('horasTeoricas') as string,
    horasPracticas: formData.get('horasPracticas') as string,
    creditos: formData.get('creditos') as string,
    requiereLaboratorio: formData.get('requiereLaboratorio') as string,
    tipoLaboratorio: formData.get('tipoLaboratorio') as string,
  };

  const validated = createCursoSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseCursoRepository();
  const useCase = new CreateCursoUseCase(repo);

  try {
    await useCase.execute(validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar el curso.';
    return { message };
  }

  revalidatePath('/director/cursos');
  revalidatePath('/secretaria/cursos');
  return { success: true, message: 'Curso registrado exitosamente.' };
}
