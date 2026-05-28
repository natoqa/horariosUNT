'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseDocenteRepository } from '../../infrastructure/supabase-docente.repository';
import { CreateDocenteUseCase } from '../../application/use-cases/create-docente.use-case';
import { createDocenteSchema } from '../../application/dtos/create-docente.dto';
import { createClient } from '@/shared/lib/supabase/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';

export interface DocenteActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  authLinked?: boolean;
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
    escuela: formData.get('escuela') as string,
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

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      success: true,
      authLinked: false,
      message:
        'Docente registrado, pero no se pudo crear el usuario de acceso (SUPABASE_SERVICE_ROLE_KEY no configurada).',
    };
  }

  try {
    const tempPassword = `${validated.data.dni}UNT!`;
    const fullName = `${validated.data.nombres} ${validated.data.apellidos}`;

    const { error: authError } = await adminClient.auth.admin.createUser({
      email: validated.data.correo,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'docente', full_name: fullName },
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return {
          success: true,
          authLinked: true,
          message: 'Docente registrado y vinculado con usuario de acceso existente.',
        };
      }

      return {
        success: true,
        authLinked: false,
        message: `Docente registrado, pero falló la creación del usuario de acceso: ${authError.message}`,
      };
    }

    return {
      success: true,
      authLinked: true,
      message: `Docente registrado con usuario de acceso creado. Contraseña temporal: ${tempPassword}`,
    };
  } catch {
    return {
      success: true,
      authLinked: false,
      message: 'Docente registrado, pero ocurrió un error al crear el usuario de acceso.',
    };
  }
}
