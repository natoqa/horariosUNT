'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { Docente } from '../../domain/entities/docente.entity';

export async function getOwnDocenteInfoAction(): Promise<{ data?: Docente; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'docente') {
    return { message: 'Solo los docentes pueden acceder a esta información.' };
  }

  try {
    const { data: docenteData, error: docenteError } = await supabase
      .from('docentes')
      .select('*')
      .eq('correo', user.email)
      .single();

    if (docenteError || !docenteData) {
      return { message: 'No se encontró un registro de docente asociado a este usuario.' };
    }

    const docente: Docente = {
      id: docenteData.id,
      nombres: docenteData.nombres,
      apellidos: docenteData.apellidos,
      dni: docenteData.dni,
      correo: docenteData.correo,
      telefono: docenteData.telefono,
      categoria: docenteData.categoria,
      regimen: docenteData.regimen,
      condicion: docenteData.condicion,
      escuela: docenteData.escuela,
      fechaIngreso: docenteData.fecha_ingreso,
      cargaMaxima: docenteData.carga_maxima,
      cargaElectiva: docenteData.carga_electiva || 0,
      estado: docenteData.estado,
      createdAt: docenteData.created_at,
      updatedAt: docenteData.updated_at,
    };

    return { data: docente };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al cargar información del docente.' };
  }
}
