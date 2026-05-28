'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';

interface CreateAuthResult {
  success: boolean;
  message: string;
  tempPassword?: string;
}

export async function createAuthUserAction(
  docenteCorreo: string,
  docenteDni: string,
  docenteFullName: string,
): Promise<CreateAuthResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { success: false, message: 'Sin permisos para esta acción.' };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { success: false, message: 'SUPABASE_SERVICE_ROLE_KEY no configurada.' };
  }

  const tempPassword = `${docenteDni}UNT!`;

  const { error } = await adminClient.auth.admin.createUser({
    email: docenteCorreo,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { role: 'docente', full_name: docenteFullName },
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      return { success: true, message: 'El usuario de acceso ya existía.' };
    }
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: 'Usuario de acceso creado.',
    tempPassword,
  };
}
