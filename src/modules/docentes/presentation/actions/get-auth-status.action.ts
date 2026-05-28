'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';

export async function getAuthStatusAction(): Promise<{
  data?: Record<string, boolean>;
  message?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Sin permisos.' };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { message: 'Servicio de verificación no configurado.' };
  }

  const { data: authData, error } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error || !authData) {
    return { message: 'Error al consultar usuarios de acceso.' };
  }

  const emailMap: Record<string, boolean> = {};
  for (const authUser of authData.users) {
    if (authUser.email) {
      emailMap[authUser.email.toLowerCase()] = true;
    }
  }

  return { data: emailMap };
}
